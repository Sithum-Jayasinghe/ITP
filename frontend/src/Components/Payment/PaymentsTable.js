// src/components/Payments/PaymentsTable.js
import React, { useEffect, useState } from "react";
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
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

// === Pricing Engine ===
const calculateDynamicPrice = (basePrice, loyalty = "Standard", demandFactor = 1) => {
  let discount = 0;
  if (loyalty === "Gold") discount = 0.15;
  else if (loyalty === "Silver") discount = 0.08;
  else if (loyalty === "Bronze") discount = 0.05;

  const demandMarkup = demandFactor > 1.2 ? 0.1 : demandFactor > 1.0 ? 0.05 : 0;

  const finalPrice = basePrice * (1 - discount + demandMarkup);
  return { finalPrice, discount, demandMarkup };
};

const PaymentsTable = ({ rows = [], selectedPayment, deletePayment, showBreakdown, setPayments }) => {
  const [demandFactor, setDemandFactor] = useState(1);

  // === Simulate live demand factor every 5s ===
  useEffect(() => {
    const interval = setInterval(() => {
      setDemandFactor(1 + Math.random() * 0.5); // random between 1.0 and 1.5
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // === WebSocket for live updates from backend ===
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001/payments");

    socket.onmessage = (event) => {
      const updatedPayment = JSON.parse(event.data);
      if (setPayments) {
        setPayments((prev) =>
          prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
        );
      }
    };

    return () => socket.close();
  }, [setPayments]);

  const generatePDF = async (row) => {
    const doc = new jsPDF("landscape");
    const qrData = JSON.stringify(row);
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const baggageCost = Number(row.totalBaggagePrice || 0);
    const mealCost = Number(row.totalMealsPrice || 0);
    const taxes = 1500;
    const basePrice = Number(row.price || 0) + baggageCost + mealCost;

    const { finalPrice } = calculateDynamicPrice(basePrice, row.loyaltyTier, demandFactor);

    // Header Bar
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 297, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("✈️ AIRGOTravel Airlines - E-Receipt", 10, 17);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Passenger Name: ${row.passenger}`, 20, 45);
    doc.text(`Ticket Number: TK-${row.id}`, 20, 60);
    doc.text(`Flight: ${row.flight}`, 20, 75);
    doc.text(`Seat: ${row.seat}`, 20, 90);
    doc.text(`Class: Economy`, 20, 105);

    doc.text(`Departure: Colombo (CMB) - 10:00 AM`, 120, 45);
    doc.text(`Arrival: Dubai (DXB) - 1:30 PM`, 120, 60);
    doc.text(`Date: October 15, 2050`, 120, 75);

    // Payment & Extras
    doc.setFontSize(13);
    doc.setTextColor(25, 118, 210);
    doc.text("Payment & Extras", 20, 125);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Ticket Price: LKR ${row.price}`, 20, 140);
    doc.text(`Payment Method: ${row.method}`, 20, 155);
    doc.text(`Status: ${row.status}`, 20, 170);

    doc.text(`🛄 Baggage: LKR ${baggageCost}`, 120, 140);
    doc.text(`🍱 Meal: LKR ${mealCost}`, 120, 155);
    doc.text(`🎟️ Taxes: LKR ${taxes}`, 120, 170);

    doc.setFontSize(13);
    doc.setTextColor(200, 0, 0);
    doc.text(`💰 TOTAL PAYMENT: LKR ${finalPrice.toFixed(2)}`, 20, 190);

    // QR
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text("E-Ticket Copy", 230, 40);
    doc.addImage(qrImageUrl, "PNG", 230, 60, 45, 45);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(
      "This e-receipt is generated electronically. Please carry a valid ID with this ticket. Safe Travels!",
      20,
      210
    );

    doc.save(`ticket_${row.id}.pdf`);
  };

  return (
    <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, mt: 3, overflow: "hidden" }}>
      <Table>
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

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => {
              const baggage = Number(row.totalBaggagePrice || 0);
              const meals = Number(row.totalMealsPrice || 0);
              const basePrice = Number(row.price || 0) + baggage + meals;

              const { finalPrice, discount, demandMarkup } = calculateDynamicPrice(
                basePrice,
                row.loyaltyTier,
                demandFactor
              );

              return (
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

                  {/* Real-time price */}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: discount > 0 ? "green" : demandMarkup > 0 ? "red" : "inherit",
                    }}
                  >
                    LKR {finalPrice.toFixed(2)}
                    {discount > 0 && (
                      <Typography variant="caption" color="green" display="block">
                        -{(discount * 100).toFixed(0)}% Loyalty
                      </Typography>
                    )}
                    {demandMarkup > 0 && (
                      <Typography variant="caption" color="red" display="block">
                        +{(demandMarkup * 100).toFixed(0)}% Demand
                      </Typography>
                    )}
                  </TableCell>

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
                    <Tooltip title="View Price Breakdown">
                      <IconButton color="secondary" onClick={() => showBreakdown(row)}>
                        <ReceiptLongIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  {/* QR */}
                  <TableCell align="center">
                    <QRCodeCanvas
                      value={JSON.stringify(row)}
                      size={60}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  </TableCell>

                  {/* PDF */}
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
              );
            })
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
