import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SeatIcon from "@mui/icons-material/EventSeat";
import BadgeIcon from "@mui/icons-material/Badge";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { useState, useRef, useEffect } from "react";
import Logo from "../Images/logo.png";

// Helper: load any image (local asset or URL) as dataURL for jsPDF
const loadImageAsDataURL = async (src) => {
  try {
    if (!src) return null;
    if (typeof src === "string" && src.startsWith("data:")) return src;
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// MODERN PDF GENERATOR FUNCTION WITH PROPER A4 ALIGNMENT
const generateCheckPDF = async (row) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth(); // 210
  const pageH = doc.internal.pageSize.getHeight(); // 297
  const margin = 15;

  // Theme
  const primary = [0, 90, 156]; // #005a9c
  const secondary = [3, 136, 209]; // #0388d1
  const lightGray = [245, 245, 245];
  const darkGray = [51, 51, 51];

  // Safe data
  const safeRow = {
    passengerName: String(row.passengerName || ""),
    passportNumber: String(row.passportNumber || ""),
    nationality: String(row.nationality || ""),
    flightNumber: String(row.flightNumber || ""),
    seatNumber: String(row.seatNumber || ""),
    status: String(row.status || ""),
    checkId: String(row.checkId || "")
  };

  // Normalize status label for display
  const statusDisplay = safeRow.status.replace(/firstclass/i, "First Class");
  const statusKey = statusDisplay.toLowerCase().replace(/\s+/g, "");
  let statusColor = primary;
  if (statusKey === "firstclass") statusColor = [156, 39, 176]; // Purple
  else if (statusKey === "economy") statusColor = [46, 125, 50]; // Green
  else if (statusKey === "business") statusColor = primary; // Blue

  // Header band (full width)
  const headerH = 30;
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageW, headerH, "F");

  // Logo (left)
  const logoSize = 18;
  const logoX = margin;
  const logoY = (headerH - logoSize) / 2;
  try {
    const logoData = await loadImageAsDataURL(Logo);
    if (logoData) {
      doc.addImage(logoData, "PNG", logoX, logoY, logoSize, logoSize);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO", logoX, logoY + 12);
    }
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO", logoX, logoY + 12);
  }

  // Header text (centered)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AIRGO AIRLINES", pageW / 2, logoY + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Digital Boarding Pass", pageW / 2, logoY + 16, { align: "center" });

  // Meta (right)
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, headerH - 6, {
    align: "right"
  });
  doc.text(`Check ID: ${safeRow.checkId || "-"}`, pageW - margin, headerH - 2, {
    align: "right"
  });

  // Boarding pass title card
  const titleY = headerH + 8;
  const titleH = 16;
  const titleW = pageW - 2 * margin;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(margin, titleY, titleW, titleH, 3, 3, "F");
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, titleY, titleW, titleH, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(
    `BOARDING PASS: ${safeRow.passengerName ? safeRow.passengerName.toUpperCase() : "-"}`,
    pageW / 2,
    titleY + titleH / 2 + 4,
    { align: "center" }
  );

  // Flight details section
  const flightTitleY = titleY + titleH + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("FLIGHT DETAILS", margin, flightTitleY);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, flightTitleY + 2, margin + 60, flightTitleY + 2);

  // Flight cards
  const gap = 10;
  const cardW = (pageW - 2 * margin - gap) / 2;
  const cardH = 30;
  const cardY = flightTitleY + 8;

  // Left card: Flight Number
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(margin, cardY, cardW, cardH, 4, 4, "F");
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, cardW, cardH, 4, 4, "S");

  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FLIGHT NUMBER", margin + cardW / 2, cardY + 10, { align: "center" });
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.text(safeRow.flightNumber || "-", margin + cardW / 2, cardY + 22, { align: "center" });

  // Right card: Seat Number
  const rightX = margin + cardW + gap;
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(rightX, cardY, cardW, cardH, 4, 4, "F");
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.roundedRect(rightX, cardY, cardW, cardH, 4, 4, "S");

  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SEAT NUMBER", rightX + cardW / 2, cardY + 10, { align: "center" });
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.text(safeRow.seatNumber || "-", rightX + cardW / 2, cardY + 22, { align: "center" });

  // Passenger information
  const passengerTitleY = cardY + cardH + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("PASSENGER INFORMATION", margin, passengerTitleY);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, passengerTitleY + 2, margin + 90, passengerTitleY + 2);

  const detailsY = passengerTitleY + 8;
  const detailsH = 48;
  const detailsW = pageW - 2 * margin;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, detailsY, detailsW, detailsH, 4, 4, "F");
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, detailsY, detailsW, detailsH, 4, 4, "S");

  // Left column labels
  const leftX = margin + 8;
  const valX = margin + 60;
  let lineY = detailsY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("FULL NAME:", leftX, lineY);
  doc.text("PASSPORT NO:", leftX, lineY + 10);
  doc.text("NATIONALITY:", leftX, lineY + 20);
  doc.text("CHECK-IN ID:", leftX, lineY + 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(safeRow.passengerName || "-", valX, lineY);
  doc.text(safeRow.passportNumber || "-", valX, lineY + 10);
  doc.text(safeRow.nationality || "-", valX, lineY + 20);
  doc.text(safeRow.checkId || "-", valX, lineY + 30);

  // Right column (Class + Status)
  const rightLblX = margin + detailsW - 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("CLASS:", rightLblX, lineY);
  doc.text("STATUS:", rightLblX, lineY + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusDisplay || "-", rightLblX + 25, lineY);
  doc.setTextColor(46, 125, 50);
  doc.text("CONFIRMED", rightLblX + 25, lineY + 10);

  // QR section
  const qrTitleY = detailsY + detailsH + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("DIGITAL BOARDING PASS", margin, qrTitleY);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, qrTitleY + 2, margin + 80, qrTitleY + 2);

  // Generate QR
  try {
    const qrData = {
      checkId: safeRow.checkId,
      passengerName: safeRow.passengerName,
      passportNumber: safeRow.passportNumber,
      nationality: safeRow.nationality,
      flightNumber: safeRow.flightNumber,
      seatNumber: safeRow.seatNumber,
      status: statusDisplay,
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines"
    };
    const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 240,
      margin: 1,
      color: { dark: "#005a9c", light: "#FFFFFF" }
    });

    const qrSize = 38; // mm
    const qrX = pageW - margin - qrSize;
    const qrY = qrTitleY - 4;
    doc.addImage(qrUrl, "PNG", qrX, qrY, qrSize, qrSize);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Scan at boarding", qrX + qrSize / 2, qrY + qrSize + 6, { align: "center" });
  } catch {
    // Silent fail for QR
  }

  // Boarding instructions
  const boardTitleY = qrTitleY + 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("BOARDING INSTRUCTIONS", margin, boardTitleY);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, boardTitleY + 2, margin + 90, boardTitleY + 2);

  const infoY = boardTitleY + 8;
  const infoH = 32;
  const infoW = pageW - 2 * margin;
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(margin, infoY, infoW, infoH, 4, 4, "F");
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(margin, infoY, infoW, infoH, 4, 4, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  const lines = [
    "✓ Boarding starts 45 minutes before departure",
    "✓ Have passport and boarding pass ready",
    "✓ Proceed to security check with QR code"
  ];
  const liY = infoY + 10;
  lines.forEach((t, i) => doc.text(t, margin + 6, liY + i * 8));

  // Footer (full width band)
  const footerH = 16;
  const footerY = pageH - footerH;
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, footerY, pageW, footerH, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("AIRGO Airlines - Elevate Your Journey", pageW / 2, footerY + 6, { align: "center" });
  doc.text("support@airgo.com | +1 (800) AIRGO-00 | www.airgo.com", pageW / 2, footerY + 11, {
    align: "center"
  });

  // Security code
  const security = `${safeRow.checkId}${safeRow.passportNumber.slice(-4)}`;
  doc.setFontSize(6);
  doc.setTextColor(230, 230, 230);
  doc.text(`Security Code: ${security}`, pageW / 2, footerY - 2, { align: "center" });

  // Page border (inset 5mm)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(5, 5, pageW - 10, pageH - 10);

  const fileName = `AIRGO_BP_${safeRow.passengerName.replace(/\s+/g, "_")}_${safeRow.flightNumber}_${safeRow.seatNumber}.pdf`;
  doc.save(fileName);
};

// DOWNLOAD BOARDING PASS AS QR CODE
const downloadBoardingPassQR = async (row) => {
  try {
    const safeRow = {
      passengerName: String(row.passengerName || ""),
      passportNumber: String(row.passportNumber || ""),
      nationality: String(row.nationality || ""),
      flightNumber: String(row.flightNumber || ""),
      seatNumber: String(row.seatNumber || ""),
      status: String(row.status || ""),
      checkId: String(row.checkId || "")
    };

    const qrData = {
      checkId: safeRow.checkId,
      passengerName: safeRow.passengerName,
      passportNumber: safeRow.passportNumber,
      nationality: safeRow.nationality,
      flightNumber: safeRow.flightNumber,
      seatNumber: safeRow.seatNumber,
      status: safeRow.status.replace(/firstclass/i, "First Class"),
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines",
      type: "BoardingPass"
    };

    const qrDataString = JSON.stringify(qrData);

    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrDataString, {
      width: 300,
      margin: 2,
      color: { dark: "#005a9c", light: "#ffffff" }
    });

    const boardingPassCanvas = document.createElement("canvas");
    const ctx = boardingPassCanvas.getContext("2d");
    boardingPassCanvas.width = 600;
    boardingPassCanvas.height = 800;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, boardingPassCanvas.width, boardingPassCanvas.height);

    const gradient = ctx.createLinearGradient(0, 0, boardingPassCanvas.width, 0);
    gradient.addColorStop(0, "#005a9c");
    gradient.addColorStop(1, "#0288d1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 120);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("AIRGO AIRLINES", boardingPassCanvas.width / 2, 45);
    ctx.font = "bold 20px Arial";
    ctx.fillText("BOARDING PASS", boardingPassCanvas.width / 2, 75);
    ctx.font = "14px Arial";
    ctx.fillText("Elevate Your Journey", boardingPassCanvas.width / 2, 95);

    ctx.fillStyle = "#005a9c";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "left";
    ctx.fillText("PASSENGER INFORMATION", 40, 150);

    ctx.strokeStyle = "#005a9c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 160);
    ctx.lineTo(300, 160);
    ctx.stroke();

    ctx.fillStyle = "#333333";
    ctx.font = "bold 16px Arial";
    ctx.fillText(safeRow.passengerName, 40, 190);

    ctx.font = "14px Arial";
    ctx.fillText(`Passport: ${safeRow.passportNumber}`, 40, 220);
    ctx.fillText(`Nationality: ${safeRow.nationality}`, 40, 245);

    ctx.fillStyle = "#005a9c";
    ctx.font = "bold 22px Arial";
    ctx.fillText("FLIGHT INFORMATION", 40, 290);

    ctx.beginPath();
    ctx.moveTo(40, 300);
    ctx.lineTo(300, 300);
    ctx.stroke();

    ctx.fillStyle = "#333333";
    ctx.font = "bold 18px Arial";
    ctx.fillText(safeRow.flightNumber, 40, 330);

    ctx.font = "16px Arial";
    ctx.fillText(`Seat: ${safeRow.seatNumber}`, 40, 360);
    ctx.fillText(`Class: ${safeRow.status.replace(/firstclass/i, "First Class")}`, 40, 385);

    ctx.fillStyle = "#005a9c";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCAN BOARDING PASS", boardingPassCanvas.width / 2, 450);

    const qrSize = 300;
    const qrX = (boardingPassCanvas.width - qrSize) / 2;
    ctx.drawImage(canvas, qrX, 470, qrSize, qrSize);

    ctx.fillStyle = "#005a9c";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("BOARDING INFORMATION", 40, 680);

    ctx.fillStyle = "#666666";
    ctx.font = "12px Arial";
    const boardingInfo = [
      "• Boarding starts 45 minutes before departure",
      "• Have passport and boarding pass ready",
      "• Proceed to security check with this QR code"
    ];
    boardingInfo.forEach((info, index) => ctx.fillText(info, 40, 710 + index * 20));

    ctx.fillStyle = "#005a9c";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Check-in ID: ${safeRow.checkId} | Generated: ${new Date().toLocaleString()}`,
      boardingPassCanvas.width / 2,
      770
    );
    ctx.fillText("AIRGO Airlines - Elevate Your Journey", boardingPassCanvas.width / 2, 785);

    ctx.strokeStyle = "#005a9c";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, boardingPassCanvas.width - 20, boardingPassCanvas.height - 20);

    const link = document.createElement("a");
    link.download = `AIRGO_BoardingPass_${safeRow.passengerName}_${safeRow.flightNumber}.png`;
    link.href = boardingPassCanvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating QR boarding pass:", error);
    try {
      const safeRow = {
        passengerName: String(row.passengerName || ""),
        flightNumber: String(row.flightNumber || ""),
        seatNumber: String(row.seatNumber || ""),
        checkId: String(row.checkId || "")
      };
      const qrData = {
        checkId: safeRow.checkId,
        passengerName: safeRow.passengerName,
        flightNumber: safeRow.flightNumber,
        seatNumber: safeRow.seatNumber,
        timestamp: new Date().toISOString()
      };
      const url = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 400,
        margin: 2,
        color: { dark: "#005a9c", light: "#ffffff" }
      });
      const link = document.createElement("a");
      link.download = `AIRGO_QR_${safeRow.passengerName}_${safeRow.flightNumber}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error("Fallback QR generation failed:", fallbackError);
      alert("Error generating boarding pass. Please try again.");
    }
  }
};

// MAIN COMPONENT (Keep the same as before)
const ChecksTable = ({ rows = [], users = [], selectedCheck, deleteCheck }) => {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const qrCanvasRef = useRef(null);

  const getUserPhoto = (row) => {
    return row.profilePhoto || "";
  };

  useEffect(() => {
    if (selectedQrData) {
      generateQRCode();
    }
  }, [selectedQrData]);

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const safeQrData = {
        checkId: String(selectedQrData.checkId || ""),
        passengerName: String(selectedQrData.passengerName || ""),
        passportNumber: String(selectedQrData.passportNumber || ""),
        nationality: String(selectedQrData.nationality || ""),
        flightNumber: String(selectedQrData.flightNumber || ""),
        seatNumber: String(selectedQrData.seatNumber || ""),
        status: String(selectedQrData.status || ""),
        profilePhoto: selectedQrData.profilePhoto || "",
        timestamp: selectedQrData.timestamp || new Date().toISOString(),
        airline: "AIRGO Airlines",
        type: "BoardingPass"
      };

      const qrDataString = JSON.stringify(safeQrData);

      const url = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: { dark: "#005a9c", light: "#ffffff" }
      });
      setQrCodeImage(url);

      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, qrDataString, {
          width: 400,
          margin: 3,
          color: { dark: "#005a9c", light: "#ffffff" }
        });
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement("a");
      link.download = `AIRGO_BoardingPass_${String(selectedQrData.passengerName)}_${String(
        selectedQrData.seatNumber
      )}.png`;
      link.href = qrCanvasRef.current.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>AIRGO Boarding Pass - ${String(selectedQrData.passengerName)}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .boarding-pass { max-width: 400px; margin: 0 auto; border: 2px solid #005a9c; padding: 20px; border-radius: 10px; }
            .header { background: #005a9c; color: white; padding: 15px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
            .qr-code { margin: 20px 0; }
            .details { text-align: left; background: #f5f5f5; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="boarding-pass">
            <div class="header">
              <h2>✈ AIRGO AIRLINES</h2>
              <h3>Boarding Pass</h3>
            </div>
            <div class="passenger-info">
              <h3>${String(selectedQrData.passengerName)}</h3>
              <p><strong>Flight:</strong> ${String(selectedQrData.flightNumber)} | <strong>Seat:</strong> ${String(
      selectedQrData.seatNumber
    )}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeImage}" alt="QR Code" style="width: 250px; height: 250px;" />
            </div>
            <div class="details">
              <p><strong>Passport:</strong> ${String(selectedQrData.passportNumber)}</p>
              <p><strong>Nationality:</strong> ${String(selectedQrData.nationality)}</p>
              <p><strong>Class:</strong> ${String(selectedQrData.status).replace(/firstclass/i, "First Class")}</p>
              <p><strong>Generated:</strong> ${new Date(selectedQrData.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateBoardingPassQR = (row) => {
    const safeRow = {
      checkId: String(row.checkId || ""),
      passengerName: String(row.passengerName || ""),
      passportNumber: String(row.passportNumber || ""),
      nationality: String(row.nationality || ""),
      flightNumber: String(row.flightNumber || ""),
      seatNumber: String(row.seatNumber || ""),
      status: String(row.status || ""),
      profilePhoto: row.profilePhoto || "",
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines",
      type: "BoardingPass"
    };

    setSelectedQrData(safeRow);
    setQrDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const key = String(status || "").toLowerCase().replace(/\s+/g, "");
    switch (key) {
      case "business":
        return "primary";
      case "firstclass":
        return "secondary";
      case "economy":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {rows.length > 0 ? (
          rows.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.checkId}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      src={getUserPhoto(row)}
                      sx={{ width: 60, height: 60, border: "3px solid #005a9c" }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {String(row.passengerName || "N/A")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {String(row.checkId || "N/A")}
                      </Typography>
                      <Chip
                        label={String(row.status || "N/A").replace(/firstclass/i, "First Class")}
                        color={getStatusColor(row.status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <BadgeIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        <strong>Passport:</strong> {String(row.passportNumber || "N/A")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <FlightIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        <strong>Flight:</strong> {String(row.flightNumber || "N/A")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <SeatIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="body2">
                        <strong>Seat:</strong> {String(row.seatNumber || "N/A")}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Nationality:</strong> {String(row.nationality || "N/A")}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => selectedCheck(row)} size="small">
                      Update Check-in
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteCheck({ checkId: row.checkId })}
                      size="small"
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => generateCheckPDF(row)}
                      size="small"
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<QrCodeIcon />}
                      onClick={() => generateBoardingPassQR(row)}
                      size="small"
                      sx={{ background: "linear-gradient(45deg, #00c853, #64dd17)" }}
                    >
                      Boarding Pass QR
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadBoardingPassQR(row)}
                      size="small"
                      sx={{
                        borderColor: "#005a9c",
                        color: "#005a9c",
                        "&:hover": {
                          backgroundColor: "#005a9c",
                          color: "white"
                        }
                      }}
                    >
                      Download QR Pass
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card sx={{ textAlign: "center", p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No check-ins available
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(45deg, #005a9c, #0288d1)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">AIRGO Boarding Pass</Typography>
          </Box>
          <IconButton onClick={() => setQrDialogOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedQrData && (
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mb: 3,
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2
                }}
              >
                <Avatar
                  src={selectedQrData.profilePhoto}
                  sx={{ width: 80, height: 80, border: "3px solid #005a9c" }}
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {String(selectedQrData.passengerName)}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    Flight: {String(selectedQrData.flightNumber)} | Seat: {String(selectedQrData.seatNumber)}
                  </Typography>
                  <Chip
                    label={String(selectedQrData.status).replace(/firstclass/i, "First Class")}
                    color={getStatusColor(selectedQrData.status)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary.main">
                      Scan Boarding Pass
                    </Typography>

                    {isGeneratingQR ? (
                      <Box
                        sx={{
                          width: 300,
                          height: 300,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px dashed #ccc",
                          borderRadius: 2,
                          mb: 2
                        }}
                      >
                        <Typography>Generating QR Code...</Typography>
                      </Box>
                    ) : (
                      <>
                        {qrCodeImage && (
                          <Box sx={{ mb: 2 }}>
                            <img
                              src={qrCodeImage}
                              alt="Boarding Pass QR Code"
                              style={{
                                width: "100%",
                                maxWidth: 300,
                                height: "auto",
                                border: "2px solid #e0e0e0",
                                borderRadius: 8
                              }}
                            />
                          </Box>
                        )}

                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", mb: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadQRCode}
                            disabled={!qrCodeImage}
                            size="small"
                            sx={{
                              background: "linear-gradient(45deg, #005a9c, #0288d1)",
                              minWidth: "140px"
                            }}
                          >
                            DOWNLOAD QR
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={printQRCode}
                            disabled={!qrCodeImage}
                            size="small"
                            sx={{ borderColor: "#005a9c", color: "#005a9c", minWidth: "100px" }}
                          >
                            PRINT
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() =>
                              navigator.share?.({
                                title: `Boarding Pass - ${String(selectedQrData.passengerName)}`,
                                text: `AIRGO Airlines Boarding Pass for ${String(selectedQrData.passengerName)}`,
                                url: qrCodeImage
                              })
                            }
                            disabled={!qrCodeImage || !navigator.share}
                            size="small"
                            sx={{ borderColor: "#005a9c", color: "#005a9c", minWidth: "100px" }}
                          >
                            SHARE
                          </Button>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadBoardingPassQR(selectedQrData)}
                          disabled={!qrCodeImage}
                          size="medium"
                          sx={{
                            background: "linear-gradient(45deg, #00c853, #64dd17)",
                            mb: 2,
                            minWidth: "200px"
                          }}
                        >
                          Download Full Boarding Pass
                        </Button>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Scan this QR code at the boarding gate or download for offline use
                        </Typography>
                      </>
                    )}
                    <canvas ref={qrCanvasRef} style={{ display: "none" }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: "grey.50", height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ textAlign: "center", color: "primary.main" }}>
                        Passenger Details
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography>
                            <strong>Name:</strong> {String(selectedQrData.passengerName)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography>
                            <strong>Passport:</strong> {String(selectedQrData.passportNumber)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <FlightIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography>
                            <strong>Flight:</strong> {String(selectedQrData.flightNumber)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                          <SeatIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
                          <Typography>
                            <strong>Seat:</strong> {String(selectedQrData.seatNumber)}
                          </Typography>
                        </Box>
                        <Typography>
                          <strong>Nationality:</strong> {String(selectedQrData.nationality)}
                        </Typography>
                        <Typography>
                          <strong>Class:</strong> {String(selectedQrData.status).replace(/firstclass/i, "First Class")}
                        </Typography>
                        <Typography>
                          <strong>Check-in ID:</strong> {String(selectedQrData.checkId)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Generated: {new Date(selectedQrData.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" display="block" color="primary.main" sx={{ mt: 1 }}>
                          ✈ AIRGO Airlines - Elevate Your Journey
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "grey.50" }}>
          <Button
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: "#005a9c", color: "#005a9c" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecksTable;