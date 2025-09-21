// src/components/Payments/PaymentsTable.js
import React, { useState } from "react";
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
  Box,
  TextField,
  Collapse,
  TablePagination,
  TableSortLabel,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FlightIcon from "@mui/icons-material/Flight";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Plane5 from "../Images/sky.jpg";

const PaymentsTable = ({ rows = [], selectedPayment, deletePayment }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [openRow, setOpenRow] = useState(null);

  // === Sorting ===
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // === Search / Filter ===
  const filteredRows = sortedRows.filter(
    (row) =>
      row.passenger.toLowerCase().includes(search.toLowerCase()) ||
      row.flight.toLowerCase().includes(search.toLowerCase())
  );

  // === Pagination ===
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // === Export to Excel ===
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  // === Export All to PDF ===
  const exportAllPDF = async () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.text("All Payments Report", 20, 20);
    rows.forEach((row, i) => {
      doc.text(`${i + 1}. ${row.passenger} - LKR ${row.price}`, 20, 40 + i * 10);
    });
    doc.save("all_payments.pdf");
  };

  // === Single PDF ===
  const generatePDF = async (row) => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica", "normal");

    const qrData = JSON.stringify(row);
    const qrImageUrl = await QRCode.toDataURL(qrData);

    const baggageCost = 8000;
    const mealCost = 2500;
    const taxes = 1500;
    const total = Number(row.price) + baggageCost + mealCost + taxes;

    // Header Banner
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 297, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("AIRGO Travel Airlines - E-Receipt", 10, 17);

    // Passenger & Flight Info
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

    // Payment Section
    doc.setFontSize(13);
    doc.setTextColor(25, 118, 210);
    doc.text("Payment & Extras", 20, 125);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Ticket Price: LKR ${row.price}`, 20, 140);
    doc.text(`Payment Method: ${row.method}`, 20, 155);
    doc.text(`Status: ${row.status}`, 20, 170);

    doc.text(`Baggage (30kg): LKR ${baggageCost}`, 120, 140);
    doc.text(`Meal: LKR ${mealCost}`, 120, 155);
    doc.text(`Taxes & Fee: LKR ${taxes}`, 120, 170);

    // Total
    doc.setFontSize(13);
    doc.setTextColor(200, 0, 0);
    doc.text(`TOTAL PAYMENT: LKR ${total}`, 20, 190);

    // QR Code
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text("E-Ticket Copy", 230, 40);

    doc.addImage(qrImageUrl, "PNG", 230, 60, 45, 45);

    // Footer
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
    <>
      {/* Airline Banner */}
      <Box
        sx={{
          width: "100%",
          height: 220,
          position: "relative",
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <Box
          component="img"
          src={Plane5}
          alt="Airline Banner"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.5)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <FlightIcon sx={{ fontSize: 50, mb: 1, color: "white" }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              textShadow: "2px 2px 10px rgba(0,0,0,0.8)",
              letterSpacing: 2,
            }}
          >
            ✈️ AIRGO Travel
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 1,
              textShadow: "1px 1px 6px rgba(0,0,0,0.7)",
              fontStyle: "italic",
            }}
          >
            Modern Payments & Booking Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          alignItems: "center",
        }}
      >
        <TextField
          label="Search Passenger / Flight"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "40%", borderRadius: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={exportExcel} startIcon={<FlightTakeoffIcon />}>
            Excel Export
          </Button>
          <Button variant="outlined" onClick={exportAllPDF} startIcon={<FlightLandIcon />}>
            PDF Export
          </Button>
        </Box>
      </Box>

      {/* Payments Table */}
      <TableContainer
        component={Paper}
        elevation={6}
        sx={{ borderRadius: 4, overflow: "hidden" }}
      >
        <Table>
          <TableHead
            sx={{
              background: "linear-gradient(90deg,#1976d2,#42a5f5)",
            }}
          >
            <TableRow>
              {[
                { id: "id", label: "ID", icon: <FlightIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "flight", label: "FLIGHT", icon: <FlightTakeoffIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "passenger", label: "PASSENGER", icon: <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "seat", label: "SEAT", icon: <AirlineSeatReclineNormalIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "price", label: "PRICE", icon: <PaymentIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "method", label: "METHOD", icon: null },
                { id: "status", label: "STATUS", icon: null },
                { id: "phone", label: "PHONE", icon: <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
                { id: "actions", label: "ACTIONS", icon: null },
                { id: "ticket", label: "BOARDING PASS", icon: null },
                { id: "receipt", label: "RECEIPT", icon: null },
              ].map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  <TableSortLabel
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : "asc"}
                    onClick={() => handleSort(header.id)}
                    sx={{ color: "white !important" }}
                  >
                    {header.icon}
                    {header.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      hover
                      sx={{
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgba(25,118,210,0.08)",
                          transform: "scale(1.01)",
                        },
                      }}
                      onClick={() =>
                        setOpenRow(openRow === row.id ? null : row.id)
                      }
                    >
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FlightTakeoffIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                          {row.flight}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                          {row.passenger}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <AirlineSeatReclineNormalIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                          {row.seat}
                        </Box>
                      </TableCell>
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
                          variant="filled"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                          {row.phone}
                        </Box>
                      </TableCell>
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
                          <IconButton
                            color="error"
                            onClick={() => deletePayment(row)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      {/* Boarding Pass QR Card */}
                      <TableCell align="center">
                        <Card
                          sx={{
                            borderRadius: 3,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                            p: 1,
                            background:
                              "linear-gradient(135deg,#ffffffcc,#e3f2fdcc)",
                            backdropFilter: "blur(10px)",
                            transition: "0.3s",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        >
                          <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                            <AirplanemodeActiveIcon
                              sx={{ color: "#1976d2", mb: 1 }}
                            />
                            <QRCodeCanvas
                              value={JSON.stringify(row)}
                              size={70}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 1,
                                display: "block",
                                fontWeight: 600,
                              }}
                            >
                              {row.passenger}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.flight}
                            </Typography>
                          </CardContent>
                        </Card>
                      </TableCell>

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

                    {/* Expandable Details */}
                    <TableRow>
                      <TableCell colSpan={11} sx={{ p: 0 }}>
                        <Collapse in={openRow === row.id} timeout="auto">
                          <Box sx={{ p: 2, bgcolor: "#f9f9f9" }}>
                            <Typography variant="body2">
                              <FlightIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "text-bottom" }} />
                              Booking Reference: #{row.id}
                            </Typography>
                            <Typography variant="body2">
                              <PhoneIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "text-bottom" }} />
                              Contact: {row.phone}
                            </Typography>
                            <Typography variant="body2">
                              <FlightTakeoffIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "text-bottom" }} />
                              Payment Verified and recorded
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Box sx={{ py: 3 }}>
                    <FlightIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No Payments Found.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </>
  );
};

export default PaymentsTable;