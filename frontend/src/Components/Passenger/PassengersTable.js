import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, Chip, Box, Grid, Card, CardContent
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChairIcon from "@mui/icons-material/Chair";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from '../Images/logo.png';

// Helper: convert image src (bundled or URL) to dataURL for jsPDF
const loadImageAsDataURL = async (src) => {
  try {
    if (!src) return null;
    if (typeof src === "string" && src.startsWith("data:")) return src;
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const PassengersTable = ({ rows = [], selectedPassenger, deletePassenger, viewLuggageStatus }) => {
  const totalBaggage = rows.reduce((sum, r) => sum + (r.baggagePrice || 0), 0);
  const totalMeal = rows.reduce((sum, r) => sum + (r.mealPrice || 0), 0);

  // Seat class by first seat number (customize if needed)
  const getSeatClass = (seats) => {
    if (!seats || !Array.isArray(seats) || seats.length === 0) return "Unknown";
    const firstSeat = seats[0];
    if (Number(firstSeat) <= 16) return "First Class";
    if (Number(firstSeat) <= 40) return "Business";
    return "Economy";
  };

  const formatSeats = (seats) => {
    if (!seats || !Array.isArray(seats)) return "No seats";
    return [...seats].sort((a, b) => Number(a) - Number(b)).join(", ");
  };

  // A4-aligned PDF for one passenger (no extra button)
  const generatePassengerPDF = async (row) => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();   // 210
    const pageH = doc.internal.pageSize.getHeight();  // 297
    const margin = 15;

    // Theme
    const primary = [0, 90, 156];   // #005a9c
    const darkGray = [51, 51, 51];
    const lightGray = [245, 245, 245];

    // Safe data
    const safe = {
      id: String(row.id ?? ""),
      name: String(row.name ?? "N/A"),
      age: String(row.age ?? "N/A"),
      passport: String(row.passport ?? "N/A"),
      baggage: String(row.baggage ?? "N/A"),
      baggagePrice: Number(row.baggagePrice || 0),
      meal: String(row.meal ?? "N/A"),
      mealPrice: Number(row.mealPrice || 0),
      seats: Array.isArray(row.seats) ? row.seats : [],
      luggageStatus: String(row.luggageStatus ?? "Unknown")
    };

    const seatClass = getSeatClass(safe.seats);
    const seatsText = formatSeats(safe.seats);

    // Header band (full width)
    const headerH = 28;
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageW, headerH, "F");

    // Logo (left)
    const logoSize = 16;
    const logoX = margin;
    const logoY = (headerH - logoSize) / 2;
    try {
      const logoData = await loadImageAsDataURL(Logo);
      if (logoData) {
        doc.addImage(logoData, "PNG", logoX, logoY, logoSize, logoSize);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("AIRGO", logoX, logoY + 10);
      }
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO", logoX, logoY + 10);
    }

    // Header text (centered)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO AIRLINES", pageW / 2, logoY + 7, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Passenger Details & Travel Information", pageW / 2, logoY + 14, { align: "center" });

    // Meta right
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, headerH - 6, { align: "right" });
    doc.text(`Passenger ID: ${safe.id}`, pageW - margin, headerH - 2, { align: "right" });

    // Title card
    const titleY = headerH + 8;
    const titleH = 16;
    const titleW = pageW - 2 * margin;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin, titleY, titleW, titleH, 3, 3, "F");
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, titleY, titleW, titleH, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(`PASSENGER PROFILE: ${safe.name.toUpperCase()}`, pageW / 2, titleY + titleH / 2 + 4, { align: "center" });

    // Personal Information
    const personalTitleY = titleY + titleH + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("PERSONAL INFORMATION", margin, personalTitleY);
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, personalTitleY + 2, margin + 82, personalTitleY + 2);

    const personalY = personalTitleY + 6;
    const personalH = 38;
    const contentW = pageW - 2 * margin;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, personalY, contentW, personalH, 4, 4, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, personalY, contentW, personalH, 4, 4, "S");

    // Left labels
    const leftX = margin + 8;
    const leftValX = margin + 58;
    let y = personalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("Passenger ID:", leftX, y);
    doc.text("Full Name:", leftX, y + 10);
    doc.text("Age:", leftX, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(safe.id || "-", leftValX, y);
    doc.text(safe.name || "-", leftValX, y + 10);
    doc.text(safe.age || "-", leftValX, y + 20);

    // Right labels
    const rightLblX = margin + contentW - 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("Passport No:", rightLblX, y);
    doc.text("Seat Class:", rightLblX, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(safe.passport || "-", rightLblX + 30, y);
    doc.text(seatClass || "-", rightLblX + 30, y + 10);

    // Travel details
    const travelTitleY = personalY + personalH + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("TRAVEL DETAILS", margin, travelTitleY);
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, travelTitleY + 2, margin + 60, travelTitleY + 2);

    const travelY = travelTitleY + 6;
    const travelH = 46;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, travelY, contentW, travelH, 4, 4, "F");
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, travelY, contentW, travelH, 4, 4, "S");

    // Left column: seats/baggage/meal
    const tLeftX = margin + 8;
    const tLeftValX = margin + 58;
    let ty = travelY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("Assigned Seats:", tLeftX, ty);
    doc.text("Baggage Info:", tLeftX, ty + 10);
    doc.text("Meal Preference:", tLeftX, ty + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(seatsText || "-", tLeftValX, ty);
    doc.text(safe.baggage || "-", tLeftValX, ty + 10);
    doc.text(safe.meal || "-", tLeftValX, ty + 20);

    // Right column: luggage status + prices
    const tRightLblX = margin + contentW - 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("Luggage Status:", tRightLblX, ty);
    doc.text("Baggage Price:", tRightLblX, ty + 10);
    doc.text("Meal Price:", tRightLblX, ty + 20);

    // Luggage status color coding
    const status = safe.luggageStatus;
    let statusColor = [255, 0, 0];
    if (status === "Checked In") statusColor = [0, 128, 0];
    else if (status === "In Transit") statusColor = [255, 165, 0];
    else if (status === "Loaded") statusColor = primary;
    else if (status === "Arrived") statusColor = [0, 100, 0];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...statusColor);
    doc.text(status || "-", tRightLblX + 32, ty);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`LKR ${safe.baggagePrice}`, tRightLblX + 32, ty + 10);
    doc.text(`LKR ${safe.mealPrice}`, tRightLblX + 32, ty + 20);

    // Travel Information box (tips)
    const infoTitleY = travelY + travelH + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text("TRAVEL INFORMATION", margin, infoTitleY);
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, infoTitleY + 2, margin + 85, infoTitleY + 2);

    const infoY = infoTitleY + 6;
    const infoH = 32;
    doc.setFillColor(255, 253, 231);
    doc.roundedRect(margin, infoY, contentW, infoH, 4, 4, "F");
    doc.setDrawColor(255, 213, 79);
    doc.roundedRect(margin, infoY, contentW, infoH, 4, 4, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const tips = [
      "• Check-in opens 3 hours before departure",
      "• Have passport and boarding pass ready for security",
      "• Baggage drop closes 45 minutes before departure",
      "• Special meals served 30 minutes after takeoff"
    ];
    tips.forEach((t, i) => doc.text(t, margin + 6, infoY + 10 + i * 7));

    // Total cost summary
    const total = safe.baggagePrice + safe.mealPrice;
    const totalY = infoY + infoH + 10;
    const totalH = 14;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, totalY, contentW, totalH, 3, 3, "F");
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.roundedRect(margin, totalY, contentW, totalH, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(`TOTAL ADDITIONAL COST: LKR ${total}`, pageW / 2, totalY + 9, { align: "center" });

    // Footer band (full width)
    const footerH = 14;
    const footerY = pageH - footerH;
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, footerY, pageW, footerH, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00", pageW / 2, footerY + 9, { align: "center" });

    // Security badge line
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("CONFIDENTIAL PASSENGER DOCUMENT | FOR OFFICIAL USE ONLY", pageW / 2, footerY - 2, { align: "center" });

    // Page border (inset 5mm)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.rect(5, 5, pageW - 10, pageH - 10);

    // Save
    doc.save(`AIRGO_Passenger_${safe.name.replace(/\s+/g, "_")}_${safe.id}.pdf`);
  };

  const getLuggageStatusColor = (status) => {
    switch (status) {
      case "Checked In": return "default";
      case "In Transit": return "primary";
      case "Loaded": return "warning";
      case "Arrived": return "success";
      default: return "error";
    }
  };

  const getSeatClassColor = (seats) => {
    const seatClass = getSeatClass(seats);
    switch (seatClass) {
      case "First Class": return "secondary";
      case "Business": return "primary";
      case "Economy": return "default";
      default: return "default";
    }
  };

  return (
    <>
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 3, 
          mt: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: "#1976d2",
              '& th': {
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '16px 12px'
              }
            }}>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Passport</TableCell>
              <TableCell>Baggage</TableCell>
              <TableCell>Baggage Price</TableCell>
              <TableCell>Meal</TableCell>
              <TableCell>Meal Price</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Seat Class</TableCell>
              <TableCell>Luggage Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  hover
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f7ff' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {row.id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="primary" />
                      {row.name}
                    </Box>
                  </TableCell>
                  <TableCell>{row.age || "N/A"}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {row.passport || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TravelLuggageIcon fontSize="small" color="action" />
                      {row.baggage || "N/A"}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    LKR {row.baggagePrice || 0}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RestaurantIcon fontSize="small" color="action" />
                      {row.meal || "N/A"}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    LKR {row.mealPrice || 0}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ChairIcon fontSize="small" color="action" />
                      {formatSeats(row.seats)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getSeatClass(row.seats)}
                      color={getSeatClassColor(row.seats)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.luggageStatus || "Unknown"}
                      color={getLuggageStatusColor(row.luggageStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Edit Passenger">
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "primary.light", color: "white" } }}
                          onClick={() => selectedPassenger(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Passenger">
                        <IconButton
                          color="error"
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "error.light", color: "white" } }}
                          onClick={() => deletePassenger(row)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate PDF">
                        <IconButton
                          color="secondary"
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "secondary.light", color: "white" } }}
                          onClick={() => generatePassengerPDF(row)}
                        >
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Track Luggage">
                        <IconButton
                          color="info"
                          size="small"
                          sx={{ "&:hover": { backgroundColor: "info.light", color: "white" } }}
                          onClick={() => viewLuggageStatus(row)}
                        >
                          <TravelLuggageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No passenger data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length > 0 && (
        <Card sx={{ mt: 2, backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="primary" gutterBottom>
                  📊 Passenger Summary
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Passengers: <strong>{rows.length}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" color="success.main" gutterBottom>
                  💼 Total Baggage: <strong>LKR {totalBaggage}</strong>
                </Typography>
                <Typography variant="body1" color="info.main">
                  🍽️ Total Meal: <strong>LKR {totalMeal}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="secondary.main">
                  💰 Grand Total: <strong>LKR {totalBaggage + totalMeal}</strong>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PassengersTable;