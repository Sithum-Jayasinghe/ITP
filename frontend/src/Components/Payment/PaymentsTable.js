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
  //Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const PaymentsTable = ({ rows, selectedPayment, deletePayment }) => {
  const generatePDF = async (row) => {
    const doc = new jsPDF();
    const qrData = JSON.stringify(row);
    const qrImageUrl = await QRCode.toDataURL(qrData);

    // Title
    doc.setFontSize(18);
    doc.text("✈️ Airline Ticket Payment Receipt", 20, 20);
    doc.setFontSize(12);

    // Payment Details
    doc.text(`ID: ${row.id}`, 20, 40);
    doc.text(`Flight: ${row.flight}`, 20, 50);
    doc.text(`Passenger: ${row.passenger}`, 20, 60);
    doc.text(`Seat: ${row.seat}`, 20, 70);
    doc.text(`Price: LKR ${row.price}`, 20, 80);
    doc.text(`Payment Method: ${row.method}`, 20, 90);
    doc.text(`Status: ${row.status}`, 20, 100);
    doc.text(`Phone: ${row.phone}`, 20, 110);

    // QR Code
    doc.addImage(qrImageUrl, "PNG", 150, 50, 40, 40);
    doc.save(`receipt_${row.id}.pdf`);
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
                    <IconButton
                      color="primary"
                      onClick={() => selectedPayment(row)}
                    >
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
