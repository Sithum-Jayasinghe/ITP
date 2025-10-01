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

// MODERN PDF GENERATOR FUNCTION
const generateCheckPDF = (row) => {
  const doc = new jsPDF();

  // Premium Header with gradient effect
  doc.setFillColor(0, 90, 156);
  doc.rect(0, 0, 220, 70, "F");
  
  // Add AIRGO logo
  try {
    doc.addImage(Logo, 'PNG', 20, 15, 30, 30);
  } catch (error) {
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO", 35, 30);
  }
  
  // Company header
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("AIRGO AIRLINES", 105, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(220, 220, 220);
  doc.text("Boarding Pass & Passenger Details", 105, 45, { align: "center" });
  
  doc.setFontSize(9);
  doc.text("Elevate Your Journey", 105, 52, { align: "center" });

  // Passenger ID section
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, 75, 180, 20, 5, 5, 'F');
  doc.setDrawColor(0, 90, 156);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 75, 180, 20, 5, 5, 'S');
  
  doc.setFontSize(14);
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");
  doc.text(`BOARDING PASS: ${row.passengerName.toUpperCase()}`, 105, 85, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 92, { align: "center" });

  // Flight Information section
  doc.setFontSize(16);
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");
  doc.text("FLIGHT INFORMATION", 20, 112);
  doc.setDrawColor(0, 90, 156);
  doc.setLineWidth(0.8);
  doc.line(20, 115, 95, 115);

  // Flight route
  const flightY = 132;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  
  // Departure
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, 'F');
  doc.setTextColor(0, 90, 156);
  doc.setFontSize(12);
  doc.text("FLIGHT", 30, flightY);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(row.flightNumber, 30, flightY + 8);
  
  // Seat
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(125, flightY - 8, 60, 25, 3, 3, 'F');
  doc.setTextColor(0, 90, 156);
  doc.setFontSize(12);
  doc.text("SEAT", 130, flightY);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(row.seatNumber, 130, flightY + 8);

  // Passenger Details section
  const passengerY = 170;
  doc.setFontSize(16);
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");
  doc.text("PASSENGER DETAILS", 20, passengerY);
  doc.line(20, passengerY + 3, 95, passengerY + 3);

  // Details card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(25, passengerY + 10, 160, 45, 4, 4, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(25, passengerY + 10, 160, 45, 4, 4, 'S');

  const detailsStartY = passengerY + 20;
  doc.setFontSize(11);
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");

  // Left column
  doc.text("Passenger Name:", 35, detailsStartY);
  doc.text("Passport Number:", 35, detailsStartY + 10);
  doc.text("Nationality:", 35, detailsStartY + 20);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(row.passengerName, 85, detailsStartY);
  doc.text(row.passportNumber, 85, detailsStartY + 10);
  doc.text(row.nationality, 85, detailsStartY + 20);

  // Right column
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");
  doc.text("Check-in ID:", 120, detailsStartY);
  doc.text("Status:", 120, detailsStartY + 10);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(row.checkId, 155, detailsStartY);
  
  // Status with color
  if (row.status === "Business") doc.setTextColor(0, 90, 156);
  else if (row.status === "First Class") doc.setTextColor(156, 39, 176);
  else doc.setTextColor(46, 125, 50);
  doc.text(row.status, 155, detailsStartY + 10);

  // Boarding Information
  const boardingY = 235;
  doc.setFontSize(16);
  doc.setTextColor(0, 90, 156);
  doc.setFont("helvetica", "bold");
  doc.text("BOARDING INFORMATION", 20, boardingY);
  doc.line(20, boardingY + 3, 110, boardingY + 3);

  doc.setFillColor(255, 253, 231);
  doc.roundedRect(25, boardingY + 10, 160, 25, 4, 4, 'F');
  doc.setDrawColor(255, 213, 79);
  doc.roundedRect(25, boardingY + 10, 160, 25, 4, 4, 'S');

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const boardingInfo = [
    "• Boarding starts 45 minutes before departure",
    "• Have passport and boarding pass ready",
    "• Proceed to Gate 15 for security check"
  ];

  boardingInfo.forEach((info, index) => {
    doc.text(info, 30, boardingY + 20 + (index * 7));
  });

  // Footer
  doc.setFillColor(0, 90, 156);
  doc.rect(0, 275, 220, 15, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00", 105, 281, { align: "center" });

  // Page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  doc.save(`AIRGO_BoardingPass_${row.passengerName}_${row.checkId}.pdf`);
};

// MAIN COMPONENT
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
      const qrDataString = JSON.stringify(selectedQrData);

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
      link.download = `AIRGO_BoardingPass_${selectedQrData.passengerName}_${selectedQrData.seatNumber}.png`;
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
          <title>AIRGO Boarding Pass - ${selectedQrData.passengerName}</title>
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
              <h3>${selectedQrData.passengerName}</h3>
              <p><strong>Flight:</strong> ${selectedQrData.flightNumber} | <strong>Seat:</strong> ${selectedQrData.seatNumber}</p>
            </div>
            <div class="qr-code">
              <img src="${qrCodeImage}" alt="QR Code" style="width: 250px; height: 250px;" />
            </div>
            <div class="details">
              <p><strong>Passport:</strong> ${selectedQrData.passportNumber}</p>
              <p><strong>Nationality:</strong> ${selectedQrData.nationality}</p>
              <p><strong>Class:</strong> ${selectedQrData.status}</p>
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
    const qrData = {
      checkId: row.checkId,
      passengerName: row.passengerName,
      passportNumber: row.passportNumber,
      nationality: row.nationality,
      flightNumber: row.flightNumber,
      seatNumber: row.seatNumber,
      status: row.status,
      profilePhoto: row.profilePhoto,
      timestamp: new Date().toISOString(),
      airline: "AIRGO Airlines",
      type: "BoardingPass"
    };

    setSelectedQrData(qrData);
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
                        {row.passengerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {row.checkId}
                      </Typography>
                      <Chip 
                        label={row.status} 
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
                        <strong>Passport:</strong> {row.passportNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FlightIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Flight:</strong> {row.flightNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SeatIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Seat:</strong> {row.seatNumber}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>Nationality:</strong> {row.nationality}
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
                    {selectedQrData.passengerName}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    Flight: {selectedQrData.flightNumber} | Seat: {selectedQrData.seatNumber}
                  </Typography>
                  <Chip 
                    label={selectedQrData.status} 
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
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={downloadQRCode}
                            disabled={!qrCodeImage}
                            size="small"
                          >
                            Download QR
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={printQRCode}
                            disabled={!qrCodeImage}
                            size="small"
                          >
                            Print
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() => navigator.share?.({
                              title: `Boarding Pass - ${selectedQrData.passengerName}`,
                              text: `AIRGO Airlines Boarding Pass for ${selectedQrData.passengerName}`,
                              url: qrCodeImage
                            })}
                            disabled={!qrCodeImage || !navigator.share}
                            size="small"
                          >
                            Share
                          </Button>
                        </Box>
                      </>
                    )}
                    <canvas ref={qrCanvasRef} style={{ display: "none" }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
                        Passenger Details
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography><strong>Name:</strong> {selectedQrData.passengerName}</Typography>
                        <Typography><strong>Passport:</strong> {selectedQrData.passportNumber}</Typography>
                        <Typography><strong>Nationality:</strong> {selectedQrData.nationality}</Typography>
                        <Typography><strong>Flight:</strong> {selectedQrData.flightNumber}</Typography>
                        <Typography><strong>Seat:</strong> {selectedQrData.seatNumber}</Typography>
                        <Typography><strong>Class:</strong> {selectedQrData.status}</Typography>
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
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecksTable;