// src/components/Payments/PaymentsTable.js
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const PaymentsTable = ({ rows = [], selectedPayment, deletePayment }) => {
  const generatePDF = async (row) => {
    const doc = new jsPDF("landscape");
    const qrData = JSON.stringify(row);
    const qrImageUrl = await QRCode.toDataURL(qrData);

    // Dummy costs (you can adjust / compute from row)
    const baggageCost = 8000; // LKR
    const mealCost = 2500; // LKR
    const taxes = 1500; // LKR
    const total = Number(row.price) + baggageCost + mealCost + taxes;

    // Header Bar
    doc.setFillColor(25, 118, 210); // Blue
    doc.rect(0, 0, 297, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("✈️ AIRGOTravel Airlines - E-Receipt", 10, 17);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Passenger Info
    doc.setFontSize(12);
    doc.text(`Passenger Name: ${row.passenger}`, 20, 45);
    doc.text(`Ticket Number: TK-${row.id}`, 20, 60);
    doc.text(`Flight: ${row.flight}`, 20, 75);
    doc.text(`Seat: ${row.seat}`, 20, 90);
    doc.text(`Class: Economy`, 20, 105);

    // Departure/Arrival (placeholder)
    doc.text(`Departure: Colombo (CMB) - 10:00 AM`, 120, 45);
    doc.text(`Arrival: Dubai (DXB) - 1:30 PM`, 120, 60);
    doc.text(`Date: October 15, 2050`, 120, 75);

    // Payment & Extras Section
    doc.setFontSize(13);
    doc.setTextColor(25, 118, 210);
    doc.text("Payment & Extras", 20, 125);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Ticket Price: LKR ${row.price}`, 20, 140);
    doc.text(`Payment Method: ${row.method}`, 20, 155);
    doc.text(`Status: ${row.status}`, 20, 170);

    // Extras
    doc.text(`🛄 Baggage (30kg): LKR ${baggageCost}`, 120, 140);
    doc.text(`🍱 Meal: LKR ${mealCost}`, 120, 155);
    doc.text(`🎟️ Taxes & Fees: LKR ${taxes}`, 120, 170);

    // Total Payment
    doc.setFontSize(13);
    doc.setTextColor(200, 0, 0);
    doc.text(`💰 TOTAL PAYMENT: LKR ${total}`, 20, 190);

    // Right side block
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text("E-Ticket Copy", 230, 40);

    // QR Code
    doc.addImage(qrImageUrl, "PNG", 230, 60, 45, 45);

    // Footer note
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(
      "This e-receipt is generated electronically. Please carry a valid ID with this ticket. Safe Travels!",
      20,
      210
    );

    // Save
    doc.save(`ticket_${row.id}.pdf`);
  };

  return (
    <TableContainer
      component={Paper}
      elevation={4}
      sx={{ borderRadius: 3, mt: 3, overflow: "hidden" }}
    >
      <Table>
        {/* Table Head */}
        <TableHead sx={{ backgroundColor: "#1976d2" }}>
          <TableRow>
            {[
              "ID",
              "Flight",
              "Passenger",
              "Seat",
              "Price",
              "Method",
              "Status",
              "Phone",
              "Actions",
              "QR Code",
              "Receipt",
            ].map((header) => (
              <TableCell
                key={header}
                sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell align="center">{row.id}</TableCell>
                <TableCell align="center">{row.flight}</TableCell>
                <TableCell align="center">{row.passenger}</TableCell>
                <TableCell align="center">{row.seat}</TableCell>
                <TableCell align="center">LKR {row.price}</TableCell>
                <TableCell align="center">{row.method}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.status}
                    color={
                      row.status === "Paid"
                        ? "success"
                        : row.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">{row.phone}</TableCell>

                {/* Action Buttons */}
                <TableCell align="center">
                  <Tooltip title="Edit Payment">
                    <IconButton color="primary" onClick={() => selectedPayment(row)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Payment">
                    <IconButton color="error" onClick={() => deletePayment(row)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>

                {/* QR Code */}
                <TableCell align="center">
                  <QRCodeCanvas
                    value={JSON.stringify(row)}
                    size={60}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                  />
                </TableCell>

                {/* Download PDF */}
                <TableCell align="center">
                  <Tooltip title="Download Receipt">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => generatePDF(row)}
                    >
                      PDF
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} align="center">
                <Typography variant="body1" color="text.secondary">
                  No Payments Found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentsTable;
