import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, Chip, Box, Grid, Card, CardContent
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import PersonIcon from "@mui/icons-material/Person";
import FlightIcon from "@mui/icons-material/Flight";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ChairIcon from "@mui/icons-material/Chair";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from '../Images/logo.png';

const PassengersTable = ({ rows = [], selectedPassenger, deletePassenger, viewLuggageStatus }) => {
  const totalBaggage = rows.reduce((sum, r) => sum + (r.baggagePrice || 0), 0);
  const totalMeal = rows.reduce((sum, r) => sum + (r.mealPrice || 0), 0);

  // ✅ Fixed: Handle seat data correctly
  const getSeatClass = (seats) => {
    if (!seats || !Array.isArray(seats) || seats.length === 0) return "Unknown";
    
    // Get class from first seat (you can modify this logic as needed)
    const firstSeat = seats[0];
    if (firstSeat <= 16) return "First Class";
    if (firstSeat <= 40) return "Business";
    return "Economy";
  };

  const formatSeats = (seats) => {
    if (!seats || !Array.isArray(seats)) return "No seats";
    return seats.sort((a, b) => a - b).join(", ");
  };

  // ✅ Generate Modern PDF for one passenger
  const generatePassengerPDF = (row) => {
    const doc = new jsPDF();
    
    // Add premium header with gradient effect
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 0, 220, 70, 'F');
    
    // Add AIRGO logo
    try {
      doc.addImage(Logo, 'PNG', 20, 15, 30, 30);
    } catch (error) {
      console.log('Logo not available, using text fallback');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO", 35, 30);
    }
    
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AIRGO AIRLINES", 105, 35, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text("Passenger Details & Travel Information", 105, 45, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Elevate Your Journey", 105, 52, { align: "center" });
    
    // Passenger ID section
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 75, 180, 20, 5, 5, 'F');
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 75, 180, 20, 5, 5, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text(`PASSENGER PROFILE: ${row.name.toUpperCase()}`, 105, 85, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 92, { align: "center" });
    
    // Personal Information section
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("PERSONAL INFORMATION", 20, 112);
    
    // Decorative line
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.8);
    doc.line(20, 115, 100, 115);
    
    // Personal info card
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(25, 120, 160, 35, 4, 4, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25, 120, 160, 35, 4, 4, 'S');
    
    const personalY = 130;
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    
    doc.text("Passenger ID:", 35, personalY);
    doc.text("Full Name:", 35, personalY + 10);
    doc.text("Age:", 35, personalY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row.id.toString(), 85, personalY);
    doc.text(row.name, 85, personalY + 10);
    doc.text((row.age || "N/A").toString(), 85, personalY + 20);
    
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("Passport No:", 120, personalY);
    doc.text("Seat Class:", 120, personalY + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row.passport || "N/A", 155, personalY);
    doc.text(getSeatClass(row.seats), 155, personalY + 10);
    
    // Travel Details section
    const travelY = 170;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("TRAVEL DETAILS", 20, travelY);
    doc.line(20, travelY + 3, 80, travelY + 3);
    
    // Travel details card
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(25, travelY + 10, 160, 45, 4, 4, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25, travelY + 10, 160, 45, 4, 4, 'S');
    
    const travelStartY = travelY + 20;
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    
    // Left column
    doc.text("Assigned Seats:", 35, travelStartY);
    doc.text("Baggage Info:", 35, travelStartY + 10);
    doc.text("Meal Preference:", 35, travelStartY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(formatSeats(row.seats), 85, travelStartY);
    doc.text(row.baggage || "N/A", 85, travelStartY + 10);
    doc.text(row.meal || "N/A", 85, travelStartY + 20);
    
    // Right column
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("Luggage Status:", 120, travelStartY);
    doc.text("Baggage Price:", 120, travelStartY + 10);
    doc.text("Meal Price:", 120, travelStartY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    // Luggage status with color coding
    const status = row.luggageStatus || "Unknown";
    if (status === "Checked In") doc.setTextColor(0, 128, 0);
    else if (status === "In Transit") doc.setTextColor(255, 165, 0);
    else if (status === "Loaded") doc.setTextColor(0, 90, 156);
    else if (status === "Arrived") doc.setTextColor(0, 100, 0);
    else doc.setTextColor(255, 0, 0);
    
    doc.text(status, 155, travelStartY);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`LKR ${row.baggagePrice || 0}`, 155, travelStartY + 10);
    doc.text(`LKR ${row.mealPrice || 0}`, 155, travelStartY + 20);
    
    // Additional Information section
    const infoY = 235;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("TRAVEL INFORMATION", 20, infoY);
    doc.line(20, infoY + 3, 105, infoY + 3);
    
    doc.setFillColor(255, 253, 231);
    doc.roundedRect(25, infoY + 10, 160, 35, 4, 4, 'F');
    doc.setDrawColor(255, 213, 79);
    doc.roundedRect(25, infoY + 10, 160, 35, 4, 4, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const travelTips = [
      "• Check-in opens 3 hours before departure",
      "• Have passport and boarding pass ready for security",
      "• Baggage drop closes 45 minutes before departure",
      "• Special meals served 30 minutes after takeoff"
    ];
    
    travelTips.forEach((tip, index) => {
      doc.text(tip, 30, infoY + 22 + (index * 7));
    });
    
    // Total cost summary
    const totalY = 285;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(25, totalY, 160, 15, 3, 3, 'F');
    doc.setDrawColor(0, 90, 156);
    doc.roundedRect(25, totalY, 160, 15, 3, 3, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    const totalCost = (row.baggagePrice || 0) + (row.mealPrice || 0);
    doc.text(`TOTAL ADDITIONAL COST: LKR ${totalCost}`, 105, totalY + 10, { align: "center" });
    
    // Footer section
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 305, 220, 15, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00", 105, 311, { align: "center" });
    
    // Security badge
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("CONFIDENTIAL PASSENGER DOCUMENT | FOR OFFICIAL USE ONLY", 105, 300, { align: "center" });
    
    // Page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);
    
    // Save the PDF
    doc.save(`AIRGO_Passenger_${row.name}_${row.id}.pdf`);
  };

  // Function to get color for luggage status chip
  const getLuggageStatusColor = (status) => {
    switch (status) {
      case "Checked In": return "default";
      case "In Transit": return "primary";
      case "Loaded": return "warning";
      case "Arrived": return "success";
      default: return "error";
    }
  };

  // Function to get seat class color
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
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#fafafa'
                    },
                    '&:hover': {
                      backgroundColor: '#f0f7ff'
                    }
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
                          sx={{ 
                            "&:hover": { 
                              backgroundColor: "primary.light",
                              color: "white"
                            } 
                          }}
                          onClick={() => selectedPassenger(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Passenger">
                        <IconButton
                          color="error"
                          size="small"
                          sx={{ 
                            "&:hover": { 
                              backgroundColor: "error.light",
                              color: "white"
                            } 
                          }}
                          onClick={() => deletePassenger(row)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate PDF">
                        <IconButton
                          color="secondary"
                          size="small"
                          sx={{ 
                            "&:hover": { 
                              backgroundColor: "secondary.light",
                              color: "white"
                            } 
                          }}
                          onClick={() => generatePassengerPDF(row)}
                        >
                          <PictureAsPdf fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Track Luggage">
                        <IconButton
                          color="info"
                          size="small"
                          sx={{ 
                            "&:hover": { 
                              backgroundColor: "info.light",
                              color: "white"
                            } 
                          }}
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