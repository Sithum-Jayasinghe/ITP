import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, Chip, Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    const doc = new jsPDF("p", "mm", "a4");

    // Use safe font
    doc.setFont("helvetica", "normal");

    // 🔹 Header Banner
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor("#fff");
    doc.setFontSize(18);
    doc.text("AirGo Airlines", 14, 16);
    doc.setFontSize(11);
    doc.text("Passenger Management Report", 150, 16, { align: "right" });

    // 🔹 Passenger Info Title
    doc.setTextColor("#000");
    doc.setFontSize(14);
    doc.text(`Passenger Report - ${row.name}`, 14, 40);

    // 🔹 Passenger Table
    const tableColumn = ["Field", "Details"];
    const tableRows = [
      ["ID", row.id],
      ["Name", row.name],
      ["Age", row.age || "N/A"],
      ["Passport", row.passport || "N/A"],
      ["Baggage", row.baggage || "N/A"],
      ["Baggage Price", `LKR ${row.baggagePrice || 0}`],
      ["Meal", row.meal || "N/A"],
      ["Meal Price", `LKR ${row.mealPrice || 0}`],
      ["Seats", formatSeats(row.seats)],
      ["Seat Class", getSeatClass(row.seats)],
      ["Luggage Status", row.luggageStatus || "Unknown"],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: "#fff",
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [245, 250, 255] },
    });

    // 🔹 Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor("#666");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
    doc.text("AirGo Airlines | Confidential", 200, pageHeight - 10, { align: "right" });

    // ✅ Save File
    doc.save(`Passenger_${row.id}_${row.name}.pdf`);
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

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 3, mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
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
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age || "N/A"}</TableCell>
                  <TableCell>{row.passport || "N/A"}</TableCell>
                  <TableCell>{row.baggage || "N/A"}</TableCell>
                  <TableCell>LKR {row.baggagePrice || 0}</TableCell>
                  <TableCell>{row.meal || "N/A"}</TableCell>
                  <TableCell>LKR {row.mealPrice || 0}</TableCell>
                  <TableCell>
                    {formatSeats(row.seats)}
                  </TableCell>
                  <TableCell>
                    {getSeatClass(row.seats)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.luggageStatus || "Unknown"}
                      color={getLuggageStatusColor(row.luggageStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Edit Passenger">
                        <IconButton
                          color="primary"
                          sx={{ "&:hover": { backgroundColor: "#E0F7FA" } }}
                          onClick={() => selectedPassenger(row)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Passenger">
                        <IconButton
                          color="error"
                          sx={{ "&:hover": { backgroundColor: "#FFEBEE" } }}
                          onClick={() => deletePassenger(row)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate PDF">
                        <IconButton
                          color="secondary"
                          sx={{ "&:hover": { backgroundColor: "#F3E5F5" } }}
                          onClick={() => generatePassengerPDF(row)}
                        >
                          <PictureAsPdf />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Track Luggage">
                        <IconButton
                          color="info"
                          sx={{ "&:hover": { backgroundColor: "#E3F2FD" } }}
                          onClick={() => viewLuggageStatus(row)}
                        >
                          <TravelLuggageIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
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
        <Typography sx={{ mt: 2, fontWeight: "bold", p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          Total Baggage Price: LKR {totalBaggage} | Total Meal Price: LKR {totalMeal} | 
          Total Passengers: {rows.length}
        </Typography>
      )}
    </>
  );
};

export default PassengersTable;