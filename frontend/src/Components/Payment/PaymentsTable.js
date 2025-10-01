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
import Logo from '../Images/logo.png';

// Replace this import with your actual 3D airline image
// For example: import AirlineBanner from "../Images/airline-3d-banner.jpg";
// Using a placeholder for demonstration
const AirlineBanner = "https://placehold.co/1200x400/1976d2/white?text=AIRGO+Travel+Airlines";

// Convert the imported logo to base64 for PDF usage
let logoBase64 = null;

// Function to convert image to base64
const convertImageToBase64 = (img) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgElement = new Image();
    
    imgElement.onload = () => {
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      ctx.drawImage(imgElement, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    
    imgElement.src = img;
  });
};

// Preload the logo
const preloadLogo = async () => {
  try {
    logoBase64 = await convertImageToBase64(Logo);
  } catch (error) {
    console.warn('Could not convert logo to base64, using fallback:', error);
  }
};

// Preload the logo on component import
preloadLogo();

// Fallback logo drawing function
const drawAIRGOLogo = (doc, x, y, width = 50, height = 20) => {
  // Draw a blue rectangle as logo background
  doc.setFillColor(25, 118, 210);
  doc.rect(x, y, width, height, 'F');
  
  // Add white text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AIRGO', x + width/2, y + height/2 + 2, { align: 'center' });
  doc.setFont('helvetica', 'normal');
};

// CSS styles for animations
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes glow {
    0%, 100% { text-shadow: 2px 2px 10px rgba(0,0,0,0.8); }
    50% { text-shadow: 3px 3px 15px rgba(255,255,255,0.3); }
  }
  
  .animated-banner {
    animation: fadeIn 0.8s ease-out, pulse 8s infinite ease-in-out;
    transition: transform 0.3s ease;
  }
  
  .animated-banner:hover {
    transform: translateY(-5px);
  }
  
  .animated-float {
    animation: float 3s infinite ease-in-out;
  }
  
  .animated-glow {
    animation: glow 4s infinite ease-in-out;
  }
  
  .table-row-animated {
    animation: slideIn 0.4s ease-out;
    transition: all 0.3s ease;
  }
  
  .table-row-animated:hover {
    transform: scale(1.01) rotate(0.5deg);
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  }
  
  .table-row-animated:active {
    transform: scale(0.995);
  }
  
  .card-3d {
    transition: all 0.3s ease;
    transform-style: preserve-3d;
  }
  
  .card-3d:hover {
    transform: perspective(1000px) rotateY(5deg) scale(1.05);
    box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  }
  
  .button-3d {
    transition: all 0.2s ease;
  }
  
  .button-3d:hover {
    transform: scale(1.05) rotateY(5deg);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  }
  
  .button-3d:active {
    transform: scale(0.95);
  }
  
  .icon-hover:hover {
    transform: scale(1.2) rotate(5deg);
    transition: transform 0.2s ease;
  }
  
  .chip-hover:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
  
  .collapse-animated {
    transition: height 0.4s ease, opacity 0.4s ease;
  }
`;

const PaymentsTable = ({ rows = [], selectedPayment, deletePayment }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [openRow, setOpenRow] = useState(null);

  // Inject CSS styles
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");
      
      // Add AIRGO Logo
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 20, 15, 40, 15);
        } catch (logoError) {
          console.warn('Logo image error, using fallback:', logoError);
          drawAIRGOLogo(doc, 20, 15, 40, 15);
        }
      } else {
        drawAIRGOLogo(doc, 20, 15, 40, 15);
      }
      
      doc.setFontSize(20);
      doc.setTextColor(25, 118, 210);
      doc.text("All Payments Report", 70, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 70, 40);
      
      let yPosition = 60;
      doc.setFontSize(10);
      
      // Table headers
      doc.setFillColor(25, 118, 210);
      doc.setTextColor(255, 255, 255);
      doc.rect(20, yPosition, 160, 8, 'F');
      doc.text("ID", 25, yPosition + 6);
      doc.text("Passenger", 40, yPosition + 6);
      doc.text("Flight", 80, yPosition + 6);
      doc.text("Price", 120, yPosition + 6);
      doc.text("Status", 150, yPosition + 6);
      
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      
      rows.forEach((row, i) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(row.id.toString(), 25, yPosition);
        doc.text(row.passenger, 40, yPosition);
        doc.text(row.flight, 80, yPosition);
        doc.text(`LKR ${row.price}`, 120, yPosition);
        doc.text(row.status, 150, yPosition);
        yPosition += 10;
      });
      
      doc.save("all_payments.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // === Single PDF ===
  const generatePDF = async (row) => {
    try {
      const doc = new jsPDF("landscape");
      doc.setFont("helvetica", "normal");

      const qrData = JSON.stringify(row);
      const qrImageUrl = await QRCode.toDataURL(qrData);

      const baggageCost = 8000;
      const mealCost = 2500;
      const taxes = 1500;
      const total = Number(row.price) + baggageCost + mealCost + taxes;

      // Add AIRGO Logo at the top
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 20, 15, 50, 20);
        } catch (logoError) {
          console.warn('Logo image error, using fallback:', logoError);
          drawAIRGOLogo(doc, 20, 15, 50, 20);
        }
      } else {
        drawAIRGOLogo(doc, 20, 15, 50, 20);
      }

      // Header Banner
      doc.setFillColor(25, 118, 210);
      doc.rect(0, 0, 297, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("AIRGO Travel Airlines - E-Ticket & Receipt", 85, 8);

      // Company Info
      doc.setTextColor(25, 118, 210);
      doc.setFontSize(10);
      doc.text("AIRGO Travel Airlines Ltd.", 200, 20);
      doc.text("123 Aviation Avenue, Colombo 03", 200, 26);
      doc.text("Sri Lanka", 200, 32);
      doc.text("Tel: +94 11 234 5678", 200, 38);
      doc.text("Email: info@airgo.com", 200, 44);

      // Passenger & Flight Info Section
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.line(20, 50, 280, 50);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("PASSENGER & FLIGHT INFORMATION", 20, 60);
      doc.setFont(undefined, 'normal');
      
      doc.text(`Passenger Name: ${row.passenger}`, 20, 70);
      doc.text(`Ticket Number: TK-${row.id}`, 20, 78);
      doc.text(`Flight: ${row.flight}`, 20, 86);
      doc.text(`Seat: ${row.seat}`, 20, 94);
      doc.text(`Class: Economy`, 20, 102);

      doc.text(`Departure: Colombo (CMB) - 10:00 AM`, 120, 70);
      doc.text(`Arrival: Dubai (DXB) - 1:30 PM`, 120, 78);
      doc.text(`Date: October 15, 2050`, 120, 86);
      doc.text(`Gate: B15`, 120, 94);
      doc.text(`Boarding Time: 09:15 AM`, 120, 102);

      // Payment Section
      doc.setFont(undefined, 'bold');
      doc.text("PAYMENT DETAILS", 20, 120);
      doc.setFont(undefined, 'normal');
      
      doc.text(`Ticket Price: LKR ${row.price}`, 20, 130);
      doc.text(`Payment Method: ${row.method}`, 20, 138);
      doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 20, 146);
      doc.text(`Transaction ID: TXN-${row.id}${Date.now()}`, 20, 154);

      doc.text(`Baggage (30kg): LKR ${baggageCost}`, 120, 130);
      doc.text(`Meal: LKR ${mealCost}`, 120, 138);
      doc.text(`Taxes & Fee: LKR ${taxes}`, 120, 146);
      doc.text(`Insurance: LKR 0`, 120, 154);

      // Total
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text(`TOTAL PAYMENT: LKR ${total}`, 20, 170);

      // QR Code Section
      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      doc.setFont(undefined, 'bold');
      doc.text("E-TICKET QR CODE", 200, 120);
      doc.setFont(undefined, 'normal');
      
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.rect(200, 125, 80, 60);
      
      // Add QR code with error handling
      try {
        doc.addImage(qrImageUrl, "PNG", 215, 135, 50, 50);
      } catch (qrError) {
        console.warn("QR code image error, using text fallback:", qrError);
        doc.text("QR Code", 220, 150);
        doc.text("Not Available", 215, 160);
      }

      // Terms and Conditions
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text("Terms & Conditions:", 20, 190);
      doc.text("1. This e-ticket is non-transferable and must be presented with valid photo ID.", 20, 195);
      doc.text("2. Baggage allowance: 30kg checked + 7kg cabin baggage.", 20, 200);
      doc.text("3. Check-in closes 45 minutes before departure.", 20, 205);
      doc.text("4. No refunds for no-shows or cancellations within 24 hours of departure.", 20, 210);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(25, 118, 210);
      doc.text("Thank you for choosing AIRGO Travel Airlines!", 20, 220);
      doc.setTextColor(100, 100, 100);
      doc.text("Safe travels and we look forward to serving you again!", 20, 225);

      // Page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, 287, 200);

      doc.save(`airgo_ticket_${row.id}_${row.passenger.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <>
      {/* Airline Banner with 3D effect - Now using the actual logo */}
      <div className="animated-banner">
        <Box
          sx={{
            width: "100%",
            height: 220,
            position: "relative",
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
          }}
        >
          <Box
            component="img"
            src={AirlineBanner}
            alt="Airline Banner"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.7)",
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
              background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(25,118,210,0.5))",
            }}
          >
            <div className="animated-float">
              <Box
                component="img"
                src={Logo}
                alt="AIRGO Logo"
                sx={{
                  height: 60,
                  width: 'auto',
                  mb: 1,
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
                }}
              />
            </div>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                letterSpacing: 2,
              }}
              className="animated-glow"
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
      </div>

      {/* Toolbar */}
      <div style={{ animation: "fadeIn 0.5s ease-out" }}>
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
              startAdornment: (
                <div className="icon-hover">
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                </div>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <div className="button-3d">
              <Button variant="outlined" onClick={exportExcel} startIcon={<FlightTakeoffIcon />}>
                Excel Export
              </Button>
            </div>
            <div className="button-3d">
              <Button variant="outlined" onClick={exportAllPDF} startIcon={<FlightLandIcon />}>
                PDF Export
              </Button>
            </div>
          </Box>
        </Box>
      </div>

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
                  <div className="icon-hover">
                    <TableSortLabel
                      active={orderBy === header.id}
                      direction={orderBy === header.id ? order : "asc"}
                      onClick={() => handleSort(header.id)}
                      sx={{ color: "white !important" }}
                    >
                      {header.icon}
                      {header.label}
                    </TableSortLabel>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className="table-row-animated"
                      style={{ animationDelay: `${index * 0.05}s`, cursor: "pointer" }}
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
                        <div className="chip-hover">
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
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }} />
                          {row.phone}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Payment">
                          <div className="icon-hover">
                            <IconButton
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectedPayment(row);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                        <Tooltip title="Delete Payment">
                          <div className="icon-hover">
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePayment(row);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>

                      {/* Boarding Pass QR Card */}
                      <TableCell align="center">
                        <div className="card-3d">
                          <Card
                            sx={{
                              borderRadius: 3,
                              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                              p: 1,
                              background:
                                "linear-gradient(135deg,#ffffffcc,#e3f2fdcc)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                              <div className="animated-float">
                                <AirplanemodeActiveIcon
                                  sx={{ color: "#1976d2", mb: 1 }}
                                />
                              </div>
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
                        </div>
                      </TableCell>

                      <TableCell align="center">
                        <div className="button-3d">
                          <Tooltip title="Download Receipt">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<PictureAsPdfIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                generatePDF(row);
                              }}
                            >
                              PDF
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details */}
                    <TableRow>
                      <TableCell colSpan={11} sx={{ p: 0 }}>
                        <Collapse in={openRow === row.id} timeout="auto" className="collapse-animated">
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
                    <div className="animated-float">
                      <Box
                        component="img"
                        src={Logo}
                        alt="AIRGO Logo"
                        sx={{
                          height: 40,
                          width: 'auto',
                          mb: 1,
                          opacity: 0.7,
                        }}
                      />
                    </div>
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