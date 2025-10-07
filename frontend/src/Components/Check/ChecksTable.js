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
import Logo from '../Images/logo.png';

// MODERN PDF GENERATOR FUNCTION WITH PROPER ALIGNMENT
const generateCheckPDF = async (row) => {
  const doc = new jsPDF();

  // Create a modern color scheme
  const primaryColor = [0, 90, 156]; // #005a9c
  const secondaryColor = [3, 136, 209]; // #0388d1
  const lightGray = [245, 245, 245];
  const darkGray = [51, 51, 51];

  // Ensure all data is converted to strings
  const safeRow = {
    passengerName: String(row.passengerName || ''),
    passportNumber: String(row.passportNumber || ''),
    nationality: String(row.nationality || ''),
    flightNumber: String(row.flightNumber || ''),
    seatNumber: String(row.seatNumber || ''),
    status: String(row.status || ''),
    checkId: String(row.checkId || '')
  };

  // Premium Header with modern gradient
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 220, 80, "F");
  
  // Add AIRGO logo - with better error handling
  try {
    if (Logo) {
      doc.addImage(Logo, 'PNG', 20, 20, 35, 35);
    }
  } catch (error) {
    console.log('Logo not available, using text fallback');
    // Fallback elegant text logo
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("✈ AIRGO", 30, 40);
  }
  
  // Modern header text - PROPERLY ALIGNED
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("AIRGO AIRLINES", 110, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255, 0.9);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Boarding Pass", 110, 48, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text("Elevate Your Journey", 110, 58, { align: "center" });

  // Passenger ID section with modern card design
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(15, 90, 190, 25, 8, 8, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(15, 90, 190, 25, 8, 8, 'S');
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(`BOARDING PASS: ${safeRow.passengerName.toUpperCase()}`, 110, 102, { align: "center" });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 110, 110, { align: "center" });

  // Flight Information section with modern layout
  const flightY = 130;
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("FLIGHT DETAILS", 20, flightY);
  
  // Modern divider
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, flightY + 3, 80, flightY + 3);

  // Flight info cards - PROPERLY SPACED
  const cardY = flightY + 15;
  
  // Flight Number Card
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(25, cardY, 75, 35, 6, 6, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, cardY, 75, 35, 6, 6, 'S');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FLIGHT NUMBER", 62.5, cardY + 10, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(safeRow.flightNumber, 62.5, cardY + 25, { align: "center" });
  
  // Seat Number Card
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(120, cardY, 75, 35, 6, 6, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(120, cardY, 75, 35, 6, 6, 'S');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("SEAT NUMBER", 157.5, cardY + 10, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(safeRow.seatNumber, 157.5, cardY + 25, { align: "center" });

  // Passenger Details section - PROPERLY ALIGNED
  const passengerY = cardY + 50;
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("PASSENGER INFORMATION", 20, passengerY);
  doc.line(20, passengerY + 3, 110, passengerY + 3);

  // Modern details card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(25, passengerY + 10, 170, 50, 8, 8, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(25, passengerY + 10, 170, 50, 8, 8, 'S');

  const detailsStartY = passengerY + 22;
  
  // Left column - PROPERLY ALIGNED
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("FULL NAME:", 35, detailsStartY);
  doc.text("PASSPORT NO:", 35, detailsStartY + 10);
  doc.text("NATIONALITY:", 35, detailsStartY + 20);
  doc.text("CHECK-IN ID:", 35, detailsStartY + 30);

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont("helvetica", "normal");
  doc.text(safeRow.passengerName, 85, detailsStartY);
  doc.text(safeRow.passportNumber, 85, detailsStartY + 10);
  doc.text(safeRow.nationality, 85, detailsStartY + 20);
  doc.text(safeRow.checkId, 85, detailsStartY + 30);

  // Right column - Status with colored badge - PROPERLY ALIGNED
  const statusX = 120;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("CLASS:", statusX, detailsStartY);
  doc.text("STATUS:", statusX, detailsStartY + 10);

  // Status with color coding
  let statusColor = primaryColor;
  if (safeRow.status === "First Class") statusColor = [156, 39, 176]; // Purple
  else if (safeRow.status === "Economy") statusColor = [46, 125, 50]; // Green
  else if (safeRow.status === "Business") statusColor = [0, 90, 156]; // Blue
  
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text(safeRow.status, statusX + 25, detailsStartY);
  doc.setTextColor(76, 175, 80);
  doc.text("CONFIRMED", statusX + 25, detailsStartY + 10);

  // QR Code Section - PROPERLY POSITIONED
  const qrY = passengerY + 75;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("DIGITAL BOARDING PASS", 20, qrY);
  doc.line(20, qrY + 3, 95, qrY + 3);

  try {
    // Generate QR code for PDF
    const qrData = {
      checkId: safeRow.checkId,
      passengerName: safeRow.passengerName,
      passportNumber: safeRow.passportNumber,
      flightNumber: safeRow.flightNumber,
      seatNumber: safeRow.seatNumber,
      status: safeRow.status,
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines"
    };

    const qrDataString = JSON.stringify(qrData);
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      width: 120,
      margin: 1,
      color: {
        dark: "#005a9c",
        light: "#FFFFFF"
      },
    });

    // Add QR code to PDF - PROPERLY CENTERED
    doc.addImage(qrCodeDataURL, 'PNG', 150, qrY - 5, 40, 40);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Scan at boarding", 170, qrY + 40, { align: "center" });
  } catch (error) {
    console.log('QR code generation failed for PDF');
  }

  // Boarding Information with modern design
  const boardingY = qrY + 50;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("BOARDING INSTRUCTIONS", 20, boardingY);
  doc.line(20, boardingY + 3, 105, boardingY + 3);

  // Modern info box
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(25, boardingY + 10, 170, 35, 6, 6, 'F');
  doc.setDrawColor(255, 193, 7);
  doc.roundedRect(25, boardingY + 10, 170, 35, 6, 6, 'S');

  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  const boardingInfo = [
    "✓ Boarding starts 45 minutes before departure",
    "✓ Have passport and boarding pass ready",
    "✓ Proceed to security check with QR code"
  ];

  boardingInfo.forEach((info, index) => {
    doc.text(info, 30, boardingY + 22 + (index * 8));
  });

  // Footer with modern design
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 275, 220, 20, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("AIRGO Airlines - Elevate Your Journey", 110, 281, { align: "center" });
  doc.text("support@airgo.com | +1 (800) AIRGO-00 | www.airgo.com", 110, 287, { align: "center" });

  // Security features
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  const securityCode = `${safeRow.checkId}${safeRow.passportNumber.slice(-4)}`;
  doc.text(`Security Code: ${securityCode}`, 110, 293, { align: "center" });

  // Modern page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(5, 5, 200, 287);

  // Save with modern filename
  const fileName = `AIRGO_BP_${safeRow.passengerName.replace(/\s+/g, '_')}_${safeRow.flightNumber}_${safeRow.seatNumber}.pdf`;
  doc.save(fileName);
};

// DOWNLOAD BOARDING PASS AS QR CODE
const downloadBoardingPassQR = async (row) => {
  try {
    // Ensure all data is converted to strings
    const safeRow = {
      passengerName: String(row.passengerName || ''),
      passportNumber: String(row.passportNumber || ''),
      nationality: String(row.nationality || ''),
      flightNumber: String(row.flightNumber || ''),
      seatNumber: String(row.seatNumber || ''),
      status: String(row.status || ''),
      checkId: String(row.checkId || '')
    };

    // Create QR data
    const qrData = {
      checkId: safeRow.checkId,
      passengerName: safeRow.passengerName,
      passportNumber: safeRow.passportNumber,
      nationality: safeRow.nationality,
      flightNumber: safeRow.flightNumber,
      seatNumber: safeRow.seatNumber,
      status: safeRow.status,
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines",
      type: "BoardingPass"
    };

    const qrDataString = JSON.stringify(qrData);

    // Create canvas for QR code
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrDataString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#005a9c",
        light: "#ffffff",
      },
    });

    // Create a new canvas for the boarding pass with QR
    const boardingPassCanvas = document.createElement('canvas');
    const ctx = boardingPassCanvas.getContext('2d');
    
    // Set canvas size for mobile-friendly boarding pass
    boardingPassCanvas.width = 600;
    boardingPassCanvas.height = 800;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, boardingPassCanvas.width, boardingPassCanvas.height);
    
    // Header with gradient
    const gradient = ctx.createLinearGradient(0, 0, boardingPassCanvas.width, 0);
    gradient.addColorStop(0, '#005a9c');
    gradient.addColorStop(1, '#0288d1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, boardingPassCanvas.width, 120);
    
    // Airline title - CENTERED
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AIRGO AIRLINES', boardingPassCanvas.width / 2, 45);
    ctx.font = 'bold 20px Arial';
    ctx.fillText('BOARDING PASS', boardingPassCanvas.width / 2, 75);
    ctx.font = '14px Arial';
    ctx.fillText('Elevate Your Journey', boardingPassCanvas.width / 2, 95);
    
    // Passenger info section
    ctx.fillStyle = '#005a9c';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('PASSENGER INFORMATION', 40, 150);
    
    // Divider line
    ctx.strokeStyle = '#005a9c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 160);
    ctx.lineTo(300, 160);
    ctx.stroke();
    
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(safeRow.passengerName, 40, 190);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Passport: ${safeRow.passportNumber}`, 40, 220);
    ctx.fillText(`Nationality: ${safeRow.nationality}`, 40, 245);
    
    // Flight info section
    ctx.fillStyle = '#005a9c';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('FLIGHT INFORMATION', 40, 290);
    
    // Divider line
    ctx.beginPath();
    ctx.moveTo(40, 300);
    ctx.lineTo(300, 300);
    ctx.stroke();
    
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(safeRow.flightNumber, 40, 330);
    
    ctx.font = '16px Arial';
    ctx.fillText(`Seat: ${safeRow.seatNumber}`, 40, 360);
    ctx.fillText(`Class: ${safeRow.status}`, 40, 385);
    
    // QR Code section
    ctx.fillStyle = '#005a9c';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN BOARDING PASS', boardingPassCanvas.width / 2, 450);
    
    // Draw QR code (centered)
    const qrSize = 300;
    const qrX = (boardingPassCanvas.width - qrSize) / 2;
    ctx.drawImage(canvas, qrX, 470, qrSize, qrSize);
    
    // Boarding information
    ctx.fillStyle = '#005a9c';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('BOARDING INFORMATION', 40, 800 - 120);
    
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    const boardingInfo = [
      '• Boarding starts 45 minutes before departure',
      '• Have passport and boarding pass ready',
      '• Proceed to security check with this QR code'
    ];
    
    boardingInfo.forEach((info, index) => {
      ctx.fillText(info, 40, 800 - 90 + (index * 20));
    });
    
    // Footer
    ctx.fillStyle = '#005a9c';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Check-in ID: ${safeRow.checkId} | Generated: ${new Date().toLocaleString()}`, boardingPassCanvas.width / 2, 800 - 30);
    ctx.fillText('AIRGO Airlines - Elevate Your Journey', boardingPassCanvas.width / 2, 800 - 15);
    
    // Border
    ctx.strokeStyle = '#005a9c';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, boardingPassCanvas.width - 20, boardingPassCanvas.height - 20);
    
    // Download the image
    const link = document.createElement('a');
    link.download = `AIRGO_BoardingPass_${safeRow.passengerName}_${safeRow.flightNumber}.png`;
    link.href = boardingPassCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error generating QR boarding pass:', error);
    // Fallback: download simple QR code
    try {
      const safeRow = {
        passengerName: String(row.passengerName || ''),
        flightNumber: String(row.flightNumber || ''),
        seatNumber: String(row.seatNumber || ''),
        checkId: String(row.checkId || '')
      };

      const qrData = {
        checkId: safeRow.checkId,
        passengerName: safeRow.passengerName,
        flightNumber: safeRow.flightNumber,
        seatNumber: safeRow.seatNumber,
        timestamp: new Date().toISOString()
      };
      
      const qrDataString = JSON.stringify(qrData);
      const url = await QRCode.toDataURL(qrDataString, {
        width: 400,
        margin: 2,
        color: {
          dark: "#005a9c",
          light: "#ffffff",
        },
      });
      
      const link = document.createElement('a');
      link.download = `AIRGO_QR_${safeRow.passengerName}_${safeRow.flightNumber}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error('Fallback QR generation failed:', fallbackError);
      alert('Error generating boarding pass. Please try again.');
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

  // Use profilePhoto from row data first, then fallback to users lookup
  const getUserPhoto = (row) => {
    return row.profilePhoto || "";
  };

  // Generate QR code when selectedQrData changes
  useEffect(() => {
    if (selectedQrData) {
      generateQRCode();
    }
  }, [selectedQrData]);

  // Generate QR code
  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Ensure all data is converted to strings for QR generation
      const safeQrData = {
        checkId: String(selectedQrData.checkId || ''),
        passengerName: String(selectedQrData.passengerName || ''),
        passportNumber: String(selectedQrData.passportNumber || ''),
        nationality: String(selectedQrData.nationality || ''),
        flightNumber: String(selectedQrData.flightNumber || ''),
        seatNumber: String(selectedQrData.seatNumber || ''),
        status: String(selectedQrData.status || ''),
        profilePhoto: selectedQrData.profilePhoto || '',
        timestamp: selectedQrData.timestamp || new Date().toISOString(),
        airline: "AIRGO Airlines",
        type: "BoardingPass"
      };

      const qrDataString = JSON.stringify(safeQrData);

      // Generate for display
      const url = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#005a9c",
          light: "#ffffff",
        },
      });
      setQrCodeImage(url);

      // Generate for download (on canvas)
      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, qrDataString, {
          width: 400,
          margin: 3,
          color: {
            dark: "#005a9c",
            light: "#ffffff",
          },
        });
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR code as PNG image
  const downloadQRCode = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement("a");
      link.download = `AIRGO_BoardingPass_${String(selectedQrData.passengerName)}_${String(selectedQrData.seatNumber)}.png`;
      link.href = qrCanvasRef.current.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print QR Code
  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
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
              <p><strong>Flight:</strong> ${String(selectedQrData.flightNumber)} | <strong>Seat:</strong> ${String(selectedQrData.seatNumber)}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeImage}" alt="QR Code" style="width: 250px; height: 250px;" />
            </div>
            <div class="details">
              <p><strong>Passport:</strong> ${String(selectedQrData.passportNumber)}</p>
              <p><strong>Nationality:</strong> ${String(selectedQrData.nationality)}</p>
              <p><strong>Class:</strong> ${String(selectedQrData.status)}</p>
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

  // Generate QR code data and show dialog
  const generateBoardingPassQR = (row) => {
    // Ensure all data is converted to strings
    const safeRow = {
      checkId: String(row.checkId || ''),
      passengerName: String(row.passengerName || ''),
      passportNumber: String(row.passportNumber || ''),
      nationality: String(row.nationality || ''),
      flightNumber: String(row.flightNumber || ''),
      seatNumber: String(row.seatNumber || ''),
      status: String(row.status || ''),
      profilePhoto: row.profilePhoto || '',
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines",
      type: "BoardingPass"
    };

    setSelectedQrData(safeRow);
    setQrDialogOpen(true);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case "Business": return "primary";
      case "First Class": return "secondary";
      case "Economy": return "success";
      default: return "default";
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
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Passenger Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      src={getUserPhoto(row)}
                      sx={{ width: 60, height: 60, border: '3px solid #005a9c' }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {String(row.passengerName || 'N/A')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {String(row.checkId || 'N/A')}
                      </Typography>
                      <Chip 
                        label={String(row.status || 'N/A')} 
                        color={getStatusColor(row.status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Passenger Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Passport:</strong> {String(row.passportNumber || 'N/A')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FlightIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Flight:</strong> {String(row.flightNumber || 'N/A')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SeatIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Seat:</strong> {String(row.seatNumber || 'N/A')}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Nationality:</strong> {String(row.nationality || 'N/A')}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => selectedCheck(row)}
                      size="small"
                    >
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
                      sx={{ background: 'linear-gradient(45deg, #00c853, #64dd17)' }}
                    >
                      Boarding Pass QR
                    </Button>
                    {/* NEW: Direct QR Download Button */}
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadBoardingPassQR(row)}
                      size="small"
                      sx={{ 
                        borderColor: '#005a9c', 
                        color: '#005a9c',
                        '&:hover': {
                          backgroundColor: '#005a9c',
                          color: 'white'
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
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No check-ins available
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Modern QR Code Dialog */}
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
            background: 'linear-gradient(45deg, #005a9c, #0288d1)',
            color: 'white'
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">AIRGO Boarding Pass</Typography>
          </Box>
          <IconButton onClick={() => setQrDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedQrData && (
            <Box sx={{ p: 3 }}>
              {/* Passenger Header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Avatar 
                  src={selectedQrData.profilePhoto} 
                  sx={{ width: 80, height: 80, border: '3px solid #005a9c' }}
                />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {String(selectedQrData.passengerName)}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    Flight: {String(selectedQrData.flightNumber)} | Seat: {String(selectedQrData.seatNumber)}
                  </Typography>
                  <Chip 
                    label={String(selectedQrData.status)} 
                    color={getStatusColor(selectedQrData.status)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              {/* QR Code Section */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
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
                                width: '100%', 
                                maxWidth: 300, 
                                height: 'auto',
                                border: '2px solid #e0e0e0',
                                borderRadius: 8
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* Action Buttons - Matching your design */}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadQRCode}
                            disabled={!qrCodeImage}
                            size="small"
                            sx={{ 
                              background: 'linear-gradient(45deg, #005a9c, #0288d1)',
                              minWidth: '140px'
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
                            sx={{ 
                              borderColor: '#005a9c', 
                              color: '#005a9c',
                              minWidth: '100px'
                            }}
                          >
                            PRINT
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() => navigator.share?.({
                              title: `Boarding Pass - ${String(selectedQrData.passengerName)}`,
                              text: `AIRGO Airlines Boarding Pass for ${String(selectedQrData.passengerName)}`,
                              url: qrCodeImage
                            })}
                            disabled={!qrCodeImage || !navigator.share}
                            size="small"
                            sx={{ 
                              borderColor: '#005a9c', 
                              color: '#005a9c',
                              minWidth: '100px'
                            }}
                          >
                            SHARE
                          </Button>
                        </Box>

                        {/* Enhanced Download Button */}
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadBoardingPassQR(selectedQrData)}
                          disabled={!qrCodeImage}
                          size="medium"
                          sx={{ 
                            background: 'linear-gradient(45deg, #00c853, #64dd17)',
                            mb: 2,
                            minWidth: '200px'
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
                  <Card sx={{ bgcolor: 'grey.50', height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
                        Passenger Details
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography><strong>Name:</strong> {String(selectedQrData.passengerName)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BadgeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography><strong>Passport:</strong> {String(selectedQrData.passportNumber)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FlightIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography><strong>Flight:</strong> {String(selectedQrData.flightNumber)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SeatIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography><strong>Seat:</strong> {String(selectedQrData.seatNumber)}</Typography>
                        </Box>
                        <Typography><strong>Nationality:</strong> {String(selectedQrData.nationality)}</Typography>
                        <Typography><strong>Class:</strong> {String(selectedQrData.status)}</Typography>
                        <Typography><strong>Check-in ID:</strong> {String(selectedQrData.checkId)}</Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ textAlign: 'center' }}>
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
        
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setQrDialogOpen(false)}
            variant="outlined"
            sx={{ borderColor: '#005a9c', color: '#005a9c' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecksTable;