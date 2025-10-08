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
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Logo from "../Images/logo.png";

// Replace this import with your actual 3D airline image
const AirlineBanner = "https://placehold.co/1200x400/1976d2/white?text=AIRGO+Travel+Airlines";

// Convert the imported logo to base64 for PDF usage
let logoBase64 = null;

// Function to convert image to base64
const convertImageToBase64 = (img) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.onload = () => {
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      ctx.drawImage(imgElement, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    imgElement.src = img;
  });
};

// Preload the logo
const preloadLogo = async () => {
  try {
    logoBase64 = await convertImageToBase64(Logo);
  } catch (error) {
    console.warn("Could not convert logo to base64, using fallback:", error);
  }
};
preloadLogo();

// Fallback logo drawing function
const drawAIRGOLogo = (doc, x, y, width = 40, height = 15) => {
  doc.setFillColor(25, 118, 210);
  doc.rect(x, y, width, height, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AIRGO", x + width / 2, y + height / 2 + 2, { align: "center" });
  doc.setFont("helvetica", "normal");
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
  .animated-banner { animation: fadeIn 0.8s ease-out, pulse 8s infinite ease-in-out; transition: transform 0.3s ease; }
  .animated-banner:hover { transform: translateY(-5px); }
  .animated-float { animation: float 3s infinite ease-in-out; }
  .animated-glow { animation: glow 4s infinite ease-in-out; }
  .table-row-animated { animation: slideIn 0.4s ease-out; transition: all 0.3s ease; }
  .table-row-animated:hover { transform: scale(1.01) rotate(0.5deg); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
  .table-row-animated:active { transform: scale(0.995); }
  .card-3d { transition: all 0.3s ease; transform-style: preserve-3d; }
  .card-3d:hover { transform: perspective(1000px) rotateY(5deg) scale(1.05); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
  .button-3d { transition: all 0.2s ease; }
  .button-3d:hover { transform: scale(1.05) rotateY(5deg); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }
  .button-3d:active { transform: scale(0.95); }
  .icon-hover:hover { transform: scale(1.2) rotate(5deg); transition: transform 0.2s ease; }
  .chip-hover:hover { transform: scale(1.1); transition: transform 0.2s ease; }
  .collapse-animated { transition: height 0.4s ease, opacity 0.4s ease; }
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

  // Sorting
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

  // Search / Filter
  const filteredRows = sortedRows.filter(
    (row) =>
      String(row.passenger).toLowerCase().includes(search.toLowerCase()) ||
      String(row.flight).toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Export to Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  };

  // Export All to A4 PDF (header/footer + margins + border)
  const exportAllPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth(); // 210
      const pageH = doc.internal.pageSize.getHeight(); // 297
      const margin = 12;
      const primary = [25, 118, 210];
      const headerH = 20;

      const drawHeader = () => {
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.rect(0, 0, pageW, headerH, "F");

        // Logo
        const logoW = 24;
        const logoH = 9;
        const logoX = margin;
        const logoY = (headerH - logoH) / 2;
        try {
          if (logoBase64) {
            doc.addImage(logoBase64, "PNG", logoX, logoY, logoW, logoH);
          } else {
            drawAIRGOLogo(doc, logoX, logoY, logoW, logoH);
          }
        } catch {
          drawAIRGOLogo(doc, logoX, logoY, logoW, logoH);
        }

        // Title + generated
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("All Payments Report", pageW / 2, 7, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, 13, { align: "center" });
      };

      const drawFooter = () => {
        const footerY = pageH - 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("AIRGO Travel Airlines", margin, footerY);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageW - margin, footerY, { align: "right" });
      };

      const drawBorder = () => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.rect(5, 5, pageW - 10, pageH - 10);
      };

      drawHeader();
      drawBorder();

      const head = [["ID", "Passenger", "Flight", "Seat", "Price (LKR)", "Method", "Status", "Phone"]];
      const body = rows.map((r) => [
        String(r.id ?? ""),
        String(r.passenger ?? ""),
        String(r.flight ?? ""),
        String(r.seat ?? ""),
        String(r.price ?? ""),
        String(r.method ?? ""),
        String(r.status ?? ""),
        String(r.phone ?? "")
      ]);

      autoTable(doc, {
        head,
        body,
        theme: "striped",
        styles: { font: "helvetica", fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: primary, textColor: 255, halign: "center" },
        bodyStyles: { valign: "middle" },
        margin: { top: headerH + 6, bottom: 20, left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 14, halign: "center" },
          1: { cellWidth: 38 },
          2: { cellWidth: 28, halign: "center" },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 26, halign: "right" },
          5: { cellWidth: 18, halign: "center" },
          6: { cellWidth: 20, halign: "center" },
          7: { cellWidth: "auto" }
        },
        didDrawPage: () => {
          drawHeader();
          drawBorder();
          drawFooter();
        }
      });

      // Summary box
      const finalY = doc.lastAutoTable?.finalY || headerH + 6;
      const totalCount = rows.length;
      const totalPaid = rows.filter((r) => r.status === "Paid").length;
      const totalPending = rows.filter((r) => r.status === "Pending").length;
      const totalFailed = rows.filter((r) => r.status === "Failed").length;
      const sumPrice = rows.reduce((s, r) => s + Number(r.price || 0), 0);

      let y = finalY + 8;
      if (y > pageH - 35) {
        doc.addPage();
        drawBorder();
        y = headerH + 10;
      }

      const boxW = pageW - 2 * margin;
      const boxH = 18;
      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(margin, y, boxW, boxH, 3, 3, "F");
      doc.roundedRect(margin, y, boxW, boxH, 3, 3, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Summary", margin + 4, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      doc.text(`Total Records: ${totalCount}`, margin + 4, y + 13);
      doc.text(`Paid: ${totalPaid} | Pending: ${totalPending} | Failed: ${totalFailed}`, margin + 50, y + 13);
      doc.text(`Total Amount: LKR ${sumPrice}`, pageW - margin - 4, y + 13, { align: "right" });

      doc.save("payments_report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Single Receipt PDF (A4, fixed layout and margins)
  const generatePDF = async (row) => {
    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth(); // 210
      const pageH = doc.internal.pageSize.getHeight(); // 297
      const margin = 12;
      const primary = [25, 118, 210];

      const headerH = 22;
      const footerH = 14;

      const label = (txt, x, y) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.text(txt, x, y);
      };
      const value = (txt, x, y) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        doc.text(txt, x, y);
      };

      // QR data
      const qrData = JSON.stringify(row);
      const qrImageUrl = await QRCode.toDataURL(qrData);

      // Costs
      const baggageCost = 8000;
      const mealCost = 2500;
      const taxes = 1500;
      const total = Number(row.price || 0) + baggageCost + mealCost + taxes;

      // Page border
      const drawBorder = () => {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.rect(5, 5, pageW - 10, pageH - 10);
      };

      // Header band
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, pageW, headerH, "F");

      // Logo
      const logoW = 26;
      const logoH = 10;
      const logoX = margin;
      const logoY = (headerH - logoH) / 2;
      try {
        if (logoBase64) {
          doc.addImage(logoBase64, "PNG", logoX, logoY, logoW, logoH);
        } else {
          drawAIRGOLogo(doc, logoX, logoY, logoW, logoH);
        }
      } catch {
        drawAIRGOLogo(doc, logoX, logoY, logoW, logoH);
      }

      // Title (center)
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("AIRGO Travel Airlines - E-Ticket & Receipt", pageW / 2, 7, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageW / 2, 13, { align: "center" });

      // Company info (right)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("AIRGO Travel Airlines Ltd.", pageW - margin, 6, { align: "right" });
      doc.text("123 Aviation Avenue, Colombo 03", pageW - margin, 10, { align: "right" });
      doc.text("Sri Lanka | info@airgo.com | +94 11 234 5678", pageW - margin, 14, { align: "right" });

      drawBorder();

      // Passenger & Flight Information
      const contentW = pageW - 2 * margin;
      const colGap = 10;
      const colW = (contentW - colGap) / 2;
      const sectionTop = headerH + 10;
      const safeBottom = pageH - footerH - margin;

      doc.setDrawColor(230);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, sectionTop, contentW, 46, 4, 4, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Passenger & Flight Information", margin + 4, sectionTop - 2);

      // Left column
      let y = sectionTop + 12;
      label("Passenger Name:", margin + 6, y);
      value(String(row.passenger || "-"), margin + 40, y);

      y += 8;
      label("Ticket Number:", margin + 6, y);
      value(`TK-${String(row.id || "")}`, margin + 40, y);

      y += 8;
      label("Flight:", margin + 6, y);
      value(String(row.flight || "-"), margin + 40, y);

      y += 8;
      label("Seat:", margin + 6, y);
      value(String(row.seat || "-"), margin + 40, y);

      y += 8;
      label("Class:", margin + 6, y);
      value(String(row.class || "Economy"), margin + 40, y);

      // Right column
      const rx = margin + colW + colGap;
      y = sectionTop + 12;

      label("Departure:", rx + 6, y);
      value("Colombo (CMB) - 10:00 AM", rx + 38, y);

      y += 8;
      label("Arrival:", rx + 6, y);
      value("Dubai (DXB) - 1:30 PM", rx + 38, y);

      y += 8;
      label("Date:", rx + 6, y);
      value(new Date().toLocaleDateString(), rx + 38, y);

      y += 8;
      label("Gate:", rx + 6, y);
      value("B15", rx + 38, y);

      y += 8;
      label("Boarding Time:", rx + 6, y);
      value("09:15 AM", rx + 38, y);

      // Payment Details
      const payTop = sectionTop + 52;
      doc.setDrawColor(230);
      doc.roundedRect(margin, payTop, contentW, 50, 4, 4, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Payment Details", margin + 4, payTop - 2);

      // Left payment column
      y = payTop + 12;
      label("Ticket Price:", margin + 6, y);
      value(`LKR ${String(row.price || 0)}`, margin + 40, y);

      y += 8;
      label("Payment Method:", margin + 6, y);
      value(String(row.method || "-"), margin + 40, y);

      y += 8;
      label("Payment Date:", margin + 6, y);
      value(new Date().toLocaleDateString(), margin + 40, y);

      y += 8;
      label("Transaction ID:", margin + 6, y);
      value(`TXN-${String(row.id || "")}${Date.now()}`, margin + 40, y);

      // Right payment column
      y = payTop + 12;
      label("Baggage (30kg):", rx + 6, y);
      value(`LKR ${baggageCost}`, rx + 42, y);

      y += 8;
      label("Meal:", rx + 6, y);
      value(`LKR ${mealCost}`, rx + 42, y);

      y += 8;
      label("Taxes & Fee:", rx + 6, y);
      value(`LKR ${taxes}`, rx + 42, y);

      y += 8;
      label("Insurance:", rx + 6, y);
      value(`LKR 0`, rx + 42, y);

      // QR code box (right side)
      const qrSize = 36;
      const qrX = pageW - margin - qrSize - 4;
      const qrY = payTop + 6;
      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, "S");
      try {
        doc.addImage(qrImageUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("QR Not Available", qrX + qrSize / 2, qrY + qrSize / 2, { align: "center" });
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("E-TICKET QR CODE", qrX + qrSize / 2, qrY + qrSize + 6, { align: "center" });

      // TOTAL PAYMENT pill
      const totalY = payTop + 58;
      const pillW = 120; // wide pill, still within content area
      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.setLineWidth(0.7);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, totalY, pillW, 12, 4, 4, "F");
      doc.roundedRect(margin, totalY, pillW, 12, 4, 4, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`TOTAL PAYMENT: LKR ${total}`, margin + 6, totalY + 8);

      // Terms & Conditions
      let termsTop = totalY + 18;
      if (termsTop > safeBottom - 24) {
        doc.addPage();
        // header/footer/border automatically good for single page; border needed again
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.rect(0, 0, pageW, headerH, "F");
        drawBorder();
        termsTop = headerH + 12;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Terms & Conditions", margin, termsTop);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      const terms = [
        "1. This e-ticket is non-transferable and must be presented with valid photo ID.",
        "2. Baggage allowance: 30kg checked + 7kg cabin baggage.",
        "3. Check-in closes 45 minutes before departure.",
        "4. No refunds for no-shows or cancellations within 24 hours of departure."
      ];
      terms.forEach((t, i) => doc.text(t, margin, termsTop + 6 + i * 6));

      // Footer band (always inside A4)
      const footerY = pageH - footerH;
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, footerY, pageW, footerH, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Thank you for choosing AIRGO Travel Airlines!", pageW / 2, footerY + 5, { align: "center" });
      doc.text("Safe travels — we look forward to serving you again!", pageW / 2, footerY + 10, { align: "center" });

      doc.save(`airgo_receipt_${String(row.id)}_${String(row.passenger).replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <>
      {/* Airline Banner with 3D effect */}
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
                  width: "auto",
                  mb: 1,
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.5))",
                }}
              />
            </div>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", letterSpacing: 2 }}
              className="animated-glow"
            >
              ✈️ AIRGO Travel
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 1, textShadow: "1px 1px 6px rgba(0,0,0,0.7)", fontStyle: "italic" }}
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
      <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ background: "linear-gradient(90deg,#1976d2,#42a5f5)" }}>
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
                      onClick={() => setOpenRow(openRow === row.id ? null : row.id)}
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
                              background: "linear-gradient(135deg,#ffffffcc,#e3f2fdcc)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                              <div className="animated-float">
                                <AirplanemodeActiveIcon sx={{ color: "#1976d2", mb: 1 }} />
                              </div>
                              <QRCodeCanvas value={JSON.stringify(row)} size={70} />
                              <Typography variant="caption" sx={{ mt: 1, display: "block", fontWeight: 600 }}>
                                {row.passenger}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
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
                        sx={{ height: 40, width: "auto", mb: 1, opacity: 0.7 }}
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