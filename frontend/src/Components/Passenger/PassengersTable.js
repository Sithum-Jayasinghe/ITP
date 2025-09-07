import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import jsPDF from "jspdf";

const PassengersTable = ({ rows = [], selectedPassenger, deletePassenger, viewLuggageStatus }) => {
  const totalBaggage = rows.reduce((sum, r) => sum + (r.baggagePrice || 0), 0);
  const totalMeal = rows.reduce((sum, r) => sum + (r.mealPrice || 0), 0);

  const getSeatClass = (seat) => seat <= 20 ? "First Class" : "Economy";

  // Function to generate PDF for one passenger
  const generatePassengerPDF = (row) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Passenger Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`ID: ${row.id}`, 14, 40);
    doc.text(`Name: ${row.name}`, 14, 50);
    doc.text(`Details: ${row.details}`, 14, 60);
    doc.text(`Baggage: ${row.baggage}`, 14, 70);
    doc.text(`Baggage Price: LKR ${row.baggagePrice}`, 14, 80);
    doc.text(`Meal: ${row.meal}`, 14, 90);
    doc.text(`Meal Price: LKR ${row.mealPrice}`, 14, 100);
    doc.text(`Seat: ${row.seat} (${getSeatClass(row.seat)})`, 14, 110);
    doc.text(`Luggage Status: ${row.luggageStatus || "Unknown"}`, 14, 120);

    doc.save(`passenger_${row.id}.pdf`);
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
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Baggage</TableCell>
              <TableCell>Baggage Price</TableCell>
              <TableCell>Meal</TableCell>
              <TableCell>Meal Price</TableCell>
              <TableCell>Seat</TableCell>
              <TableCell>Luggage Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? rows.map(row => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.details}</TableCell>
                <TableCell>{row.baggage}</TableCell>
                <TableCell>{row.baggagePrice}</TableCell>
                <TableCell>{row.meal}</TableCell>
                <TableCell>{row.mealPrice}</TableCell>
                <TableCell>{row.seat} ({getSeatClass(row.seat)})</TableCell>
                <TableCell>
                  <Chip 
                    label={row.luggageStatus || "Unknown"} 
                    color={getLuggageStatusColor(row.luggageStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Passenger">
                    <IconButton color="primary" sx={{ "&:hover": { backgroundColor: "#E0F7FA" } }} onClick={() => selectedPassenger(row)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Passenger">
                    <IconButton color="error" sx={{ "&:hover": { backgroundColor: "#FFEBEE" } }} onClick={() => deletePassenger(row)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  {/* PDF Button */}
                  <Tooltip title="Generate PDF">
                    <IconButton color="secondary" sx={{ "&:hover": { backgroundColor: "#F3E5F5" } }} onClick={() => generatePassengerPDF(row)}>
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                  {/* Luggage Tracking Button */}
                  <Tooltip title="Track Luggage">
                    <IconButton 
                      color="info" 
                      sx={{ "&:hover": { backgroundColor: "#E3F2FD" } }} 
                      onClick={() => viewLuggageStatus(row)}
                    >
                      <TravelLuggageIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={10} align="center">No Data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography sx={{ mt: 2, fontWeight: "bold" }}>
        Total Baggage Price: LKR {totalBaggage} | Total Meal Price: LKR {totalMeal}
      </Typography>
    </>
  );
};

export default PassengersTable;