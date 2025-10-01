// src/components/Books/BooksTable.js
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Snackbar,
  Alert,
  Slide,
  Chip,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TagIcon from "@mui/icons-material/Tag";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ChairIcon from "@mui/icons-material/Chair";
import RepeatIcon from "@mui/icons-material/Repeat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InsightsIcon from "@mui/icons-material/Insights";
import QrCodeIcon from "@mui/icons-material/QrCode";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Logo from '../Images/logo.png';

const TransitionUp = (props) => <Slide {...props} direction="down" />;

// === Predictive Recommendation Engine (dummy rules for now) ===
const generateInsight = (booking) => {
  if (booking.flexibleDates) {
    return { type: "Best Time", msg: "Better fares if booked 6–8 weeks early", color: "info" };
  }
  if (booking.passengers > 3) {
    return { type: "Group Offer", msg: "Eligible for group discount on baggage", color: "success" };
  }
  if (booking.tripType === "Round Trip") {
    return { type: "Upgrade", msg: "Business class upgrade trending 20% cheaper this week", color: "warning" };
  }
  return { type: "Disruption Alert", msg: "Evening flights may face congestion delays", color: "error" };
};

const BooksTable = ({ rows = [], selectedBooking, deleteBooking, darkMode, addedBooking }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);

  // Filter rows based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRows(rows);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = rows.filter((row) => {
      return (
        row.id?.toString().toLowerCase().includes(term) ||
        row.from?.toLowerCase().includes(term) ||
        row.to?.toLowerCase().includes(term) ||
        row.departure?.toLowerCase().includes(term) ||
        row.returnDate?.toLowerCase().includes(term) ||
        row.passengers?.toString().includes(term) ||
        row.travelClass?.toLowerCase().includes(term) ||
        row.tripType?.toLowerCase().includes(term) ||
        (row.flexibleDates ? "yes" : "no").includes(term)
      );
    });
    setFilteredRows(filtered);
  }, [searchTerm, rows]);

  const showAlert = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete?.id) {
      deleteBooking({ id: bookingToDelete.id });
      setOpenDialog(false);
      setBookingToDelete(null);
      showAlert("Booking deleted successfully!", "error");
    }
  };

  const handleUpdateClick = (booking) => {
    selectedBooking(booking);
    showAlert(`Booking #${booking.id} ready to update!`, "info");
  };

  // Reset addedBooking after showing alert to prevent infinite loops
  useEffect(() => {
    if (addedBooking) {
      showAlert(`Booking #${addedBooking.id} added successfully!`, "success");
    }
  }, [addedBooking]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Modern AIRGO Airlines PDF generation with logo
  const generatePDF = async (booking) => {
    const doc = new jsPDF();
    
    // Add premium background
    doc.setFillColor(0, 90, 156); // AIRGO blue
    doc.rect(0, 0, 220, 70, 'F');
    
    // Add logo (you'll need to handle the image loading properly)
    try {
      // For actual implementation, you might need to convert the image to base64
      // This is a simplified version - in production, you'd handle the image properly
      doc.addImage(Logo, 'PNG', 20, 15, 30, 30);
    } catch (error) {
      console.log('Logo not available, using text fallback');
      // Fallback if logo doesn't load
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO", 35, 30);
    }
    
    // Company header
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AIRGO AIRLINES", 105, 35, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text("Flight Booking Confirmation", 105, 45, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Elevate Your Journey", 105, 52, { align: "center" });
    
    // Booking ID section with premium styling
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 75, 180, 22, 5, 5, 'F');
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 75, 180, 22, 5, 5, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text(`BOOKING REFERENCE: AIRGO-${booking.id}`, 105, 86, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 93, { align: "center" });
    
    // Flight details section
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("FLIGHT DETAILS", 20, 115);
    
    // Decorative line
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.8);
    doc.line(20, 118, 85, 118);
    
    // Flight route with modern styling
    const flightY = 135;
    
    // Departure
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(25, flightY - 10, 65, 28, 4, 4, 'F');
    doc.setTextColor(0, 90, 156);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTURE", 30, flightY - 2);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(booking.from, 30, flightY + 8);
    
    // Arrow with plane icon representation
    doc.setFontSize(18);
    doc.setTextColor(0, 90, 156);
    doc.text("✈", 105, flightY + 2);
    
    // Destination
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(120, flightY - 10, 65, 28, 4, 4, 'F');
    doc.setTextColor(0, 90, 156);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DESTINATION", 125, flightY - 2);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(booking.to, 125, flightY + 8);
    
    // Date information
    const dateY = 175;
    doc.setFontSize(12);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTURE DATE:", 25, dateY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(booking.departure, 75, dateY);
    
    if (booking.returnDate) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 90, 156);
      doc.text("RETURN DATE:", 125, dateY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(booking.returnDate, 170, dateY);
    }
    
    // Passenger details section
    const passengerY = 195;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("PASSENGER INFORMATION", 20, passengerY);
    doc.line(20, passengerY + 3, 120, passengerY + 3);
    
    // Passenger details in modern card layout
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(25, passengerY + 10, 160, 50, 4, 4, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25, passengerY + 10, 160, 50, 4, 4, 'S');
    
    const infoStartY = passengerY + 22;
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    
    // Left column
    doc.text("Passengers:", 35, infoStartY);
    doc.text("Travel Class:", 35, infoStartY + 10);
    doc.text("Trip Type:", 35, infoStartY + 20);
    doc.text("Flexible Dates:", 35, infoStartY + 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`${booking.passengers} ${booking.passengers > 1 ? 'travelers' : 'traveler'}`, 85, infoStartY);
    doc.text(booking.travelClass, 85, infoStartY + 10);
    doc.text(booking.tripType, 85, infoStartY + 20);
    doc.text(booking.flexibleDates ? "Yes ✓" : "No ✗", 85, infoStartY + 30);
    
    // Right column - Additional details
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Status:", 120, infoStartY);
    doc.text("E-Ticket Number:", 120, infoStartY + 10);
    doc.text("Fare Type:", 120, infoStartY + 20);
    doc.text("Baggage Allowance:", 120, infoStartY + 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text("Confirmed ✓", 160, infoStartY);
    doc.text(`AIRGO-${booking.id}-ET`, 160, infoStartY + 10);
    doc.text("Standard", 160, infoStartY + 20);
    doc.text("23kg × 1", 160, infoStartY + 30);
    
    // Travel insights & recommendations section
    const tipsY = 260;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("TRAVEL INSIGHTS & RECOMMENDATIONS", 20, tipsY);
    doc.line(20, tipsY + 3, 140, tipsY + 3);
    
    doc.setFillColor(255, 253, 231);
    doc.roundedRect(25, tipsY + 10, 160, 40, 4, 4, 'F');
    doc.setDrawColor(255, 213, 79);
    doc.roundedRect(25, tipsY + 10, 160, 40, 4, 4, 'S');
    
    const insight = generateInsight(booking);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const tipsContent = [
      `🎯 ${insight.msg}`,
      "🕒 Online check-in opens 24-48 hours before departure",
      "⏰ Arrive 3 hours before international flights",
      "📱 Download AIRGO app for real-time updates",
      "🎒 Verify baggage allowance for your fare class"
    ];
    
    tipsContent.forEach((tip, index) => {
      doc.text(tip, 30, tipsY + 22 + (index * 7));
    });
    
    // Footer section
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 305, 220, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Thank you for choosing AIRGO Airlines - Elevate Your Journey", 105, 311, { align: "center" });
    doc.text("Customer Support: support@airgo.com | +1 (800) AIRGO-00 | www.airgo.com", 105, 317, { align: "center" });
    
    // Security features
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("SECURE E-TICKET | DIGITAL BOARDING PASS | VERIFIED DOCUMENT", 105, 300, { align: "center" });
    
    // Boarding pass QR code section
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(170, 255, 35, 35, 4, 4, 'F');
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.8);
    doc.roundedRect(170, 255, 35, 35, 4, 4, 'S');
    
    doc.setFontSize(7);
    doc.setTextColor(0, 90, 156);
    doc.text("BOARDING", 187.5, 265, { align: "center" });
    doc.text("PASS", 187.5, 270, { align: "center" });
    doc.setFontSize(12);
    doc.text("✈", 187.5, 280, { align: "center" });
    doc.setFontSize(6);
    doc.text("SCAN TO BOARD", 187.5, 287, { align: "center" });
    
    // Page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);
    
    // Save the PDF
    doc.save(`AIRGO_Booking_${booking.id}.pdf`);
    
    showAlert(`AIRGO Booking #${booking.id} PDF generated!`, "success");
  };

  return (
    <>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search bookings by ID, destination, date, class, etc..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={clearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Chip 
                label={`${filteredRows.length} booking${filteredRows.length !== 1 ? 's' : ''} found`}
                variant="outlined"
                color={searchTerm ? "primary" : "default"}
                sx={{ mr: 2 }}
              />
              {searchTerm && (
                <Button 
                  startIcon={<ClearIcon />}
                  onClick={clearSearch}
                  variant="outlined"
                  size="small"
                >
                  Clear Search
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 3,
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: darkMode ? "#333" : "#007acc" }}>
            <TableRow>
              {[
                "ID",
                "From",
                "To",
                "Departure",
                "Return",
                "Passengers",
                "Class",
                "Trip Type",
                "Flexible",
                "AI Insight",
                "Action",
              ].map((head) => (
                <TableCell key={head} sx={{ color: "#fff" }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => {
                const insight = generateInsight(row);
                return (
                  <TableRow key={row.id} hover sx={{ backgroundColor: darkMode ? "#2a2a2a" : "#fff" }}>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <TagIcon fontSize="small" /> {row.id}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <FlightTakeoffIcon fontSize="small" /> {row.from}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <FlightLandIcon fontSize="small" /> {row.to}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <EventIcon fontSize="small" /> {row.departure}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <EventIcon fontSize="small" /> {row.returnDate || "N/A"}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <PeopleIcon fontSize="small" /> {row.passengers}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <ChairIcon fontSize="small" /> {row.travelClass}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <RepeatIcon fontSize="small" /> {row.tripType}
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}>
                      <CalendarTodayIcon fontSize="small" /> {row.flexibleDates ? "Yes" : "No"}
                    </TableCell>

                    {/* AI Insight column */}
                    <TableCell>
                      <Tooltip title={insight.msg}>
                        <Chip
                          icon={<InsightsIcon />}
                          label={insight.type}
                          color={insight.color}
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Button
                        startIcon={<EditIcon />}
                        sx={{ mr: 1, textTransform: "none", borderRadius: 2 }}
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => handleUpdateClick(row)}
                      >
                        Update
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        sx={{
                          mr: 1,
                          textTransform: "none",
                          borderRadius: 2,
                          color: "#fff",
                          background: "linear-gradient(90deg, #ff4d4d, #ff0000)",
                        }}
                        size="small"
                        onClick={() => handleDeleteClick(row)}
                      >
                        Delete
                      </Button>
                      <Button
                        startIcon={<PictureAsPdfIcon />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          background: "linear-gradient(90deg, #4caf50, #2e7d32)",
                          color: "#fff",
                        }}
                        size="small"
                        onClick={() => generatePDF(row)}
                      >
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ color: darkMode ? "#fff" : "#000", py: 4 }}>
                  {searchTerm ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No bookings found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No results for "{searchTerm}". Try different keywords or clear the search.
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={clearSearch}
                        sx={{ mt: 2 }}
                      >
                        Clear Search
                      </Button>
                    </Box>
                  ) : (
                    "No Bookings Available"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 3, p: 2, background: darkMode ? "#2a2a2a" : "#fff" } }}>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            ⚠️ Are you sure you want to delete this booking?
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Booking: {bookingToDelete?.from} → {bookingToDelete?.to} | ID: {bookingToDelete?.id}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, color: darkMode ? "#fff" : "#000" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={confirmDelete} sx={{ borderRadius: 2, background: "linear-gradient(90deg, #ff4d4d, #ff0000)" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={TransitionUp}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: 3,
            fontWeight: 600,
            fontSize: "1rem",
            boxShadow: 3,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BooksTable;