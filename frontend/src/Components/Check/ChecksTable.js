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
  IconButton
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SeatIcon from "@mui/icons-material/EventSeat";
import BadgeIcon from "@mui/icons-material/Badge";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { useState, useRef, useEffect } from "react";

const ChecksTable = ({ rows = [], users = [], selectedCheck, deleteCheck }) => {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const qrCanvasRef = useRef(null);

  const getUserPhoto = (name) => {
    const user = users.find((u) => u.name === name);
    return user?.profilePhoto || "";
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
        width: 256,
        margin: 2,
        color: {
          dark: '#1976d2',
          light: '#ffffff'
        }
      });
      setQrCodeImage(url);
      
      // Generate for download (on canvas)
      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, qrDataString, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1976d2',
            light: '#ffffff'
          }
        });
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Download QR code as PNG image
  const downloadQRCode = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement('a');
      link.download = `boarding_pass_${selectedQrData.checkId || 'passenger'}.png`;
      link.href = qrCanvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Generate PDF for a single check-in row
  const generateCheckPDF = (row) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Check-In Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Check ID: ${row.checkId}`, 14, 40);
    doc.text(`Passenger: ${row.passengerName}`, 14, 50);
    doc.text(`Passport: ${row.passportNumber}`, 14, 60);
    doc.text(`Nationality: ${row.nationality}`, 14, 70);
    doc.text(`Flight: ${row.flightNumber}`, 14, 80);
    doc.text(`Seat: ${row.seatNumber}`, 14, 90);
    doc.text(`Status: ${row.status}`, 14, 100);

    doc.save(`checkin_${row.checkId}.pdf`);
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
      timestamp: new Date().toISOString()
    };
    
    setSelectedQrData(qrData);
    setQrDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 4 }}>
        {rows.length > 0 ? (
          rows.map((row) => (
            <Paper
              key={row.checkId}
              sx={{ p: 2.5, minWidth: 320, flex: "1 1 320px", borderRadius: 3, boxShadow: 3 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Avatar
                  src={row.profilePhoto || getUserPhoto(row.passengerName)}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6">{row.passengerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {row.checkId}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography>
                  <BadgeIcon fontSize="small" sx={{ mr: 1 }} /> Passport: {row.passportNumber}
                </Typography>
                <Typography>Nationality: {row.nationality}</Typography>
                <Typography>
                  <FlightIcon fontSize="small" sx={{ mr: 1 }} /> Flight: {row.flightNumber}
                </Typography>
                <Typography>
                  <SeatIcon fontSize="small" sx={{ mr: 1 }} /> Seat: {row.seatNumber}
                </Typography>
                <Typography>Status: {row.status}</Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                <Button variant="contained" color="info" onClick={() => selectedCheck(row)}>
                  Update
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteCheck({ checkId: row.checkId })}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => generateCheckPDF(row)}
                >
                  PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<QrCodeIcon />}
                  onClick={() => generateBoardingPassQR(row)}
                >
                  Boarding Pass
                </Button>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography>No check-ins available</Typography>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            Boarding Pass QR Code
          </Box>
          <IconButton onClick={() => setQrDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedQrData && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              {/* QR Code Display */}
              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {isGeneratingQR ? (
                  <Box sx={{ width: 256, height: 256, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #ccc" }}>
                    <Typography>Generating QR Code...</Typography>
                  </Box>
                ) : (
                  <>
                    {qrCodeImage && (
                      <img 
                        src={qrCodeImage} 
                        alt="QR Code" 
                        style={{ width: 256, height: 256, marginBottom: '16px' }} 
                      />
                    )}
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={downloadQRCode}
                      disabled={!qrCodeImage}
                    >
                      Download QR Code
                    </Button>
                  </>
                )}
                <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
              </Box>
              
              <Box sx={{ width: '100%', height: '1px', backgroundColor: '#e0e0e0', my: 2 }} />
              
              {/* Passenger Details */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  Passenger Details
                </Typography>
                <Typography><strong>Name:</strong> {selectedQrData.passengerName}</Typography>
                <Typography><strong>Passport:</strong> {selectedQrData.passportNumber}</Typography>
                <Typography><strong>Nationality:</strong> {selectedQrData.nationality}</Typography>
                <Typography><strong>Flight:</strong> {selectedQrData.flightNumber}</Typography>
                <Typography><strong>Seat:</strong> {selectedQrData.seatNumber}</Typography>
                <Typography><strong>Status:</strong> {selectedQrData.status}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Generated: {new Date(selectedQrData.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChecksTable;