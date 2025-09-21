import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography, Chip
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

  const getSeatClass = (seat) => (seat <= 20 ? "First Class" : "Economy");

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
      ["Details", row.details],
      ["Baggage", row.baggage],
      ["Baggage Price", `LKR ${row.baggagePrice}`],
      ["Meal", row.meal],
      ["Meal Price", `LKR ${row.mealPrice}`],
      ["Seat", `${row.seat} (${getSeatClass(row.seat)})`],
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
    doc.save(`Passenger_${row.id}.pdf`);
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
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.details}</TableCell>
                  <TableCell>{row.baggage}</TableCell>
                  <TableCell>{row.baggagePrice}</TableCell>
                  <TableCell>{row.meal}</TableCell>
                  <TableCell>{row.mealPrice}</TableCell>
                  <TableCell>
                    {row.seat} ({getSeatClass(row.seat)})
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.luggageStatus || "Unknown"}
                      color={getLuggageStatusColor(row.luggageStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
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
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No Data
                </TableCell>
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
