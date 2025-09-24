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

  // Modern PDF generation
  const generatePDF = (booking) => {
    const doc = new jsPDF();
    
    // Add background color
    doc.setFillColor(23, 107, 135);
    doc.rect(0, 0, 220, 50, 'F');
    
    // Add logo/header
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AIRGO", 105, 25, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.text("Flight Booking Confirmation", 105, 35, { align: "center" });
    
    // Booking ID with styling
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(15, 60, 180, 15, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`BOOKING REFERENCE: ${booking.id}`, 105, 70, { align: "center" });
    
    // Flight details section
    doc.setFontSize(16);
    doc.setTextColor(23, 107, 135);
    doc.text("FLIGHT DETAILS", 20, 90);
    
    // Draw line separator
    doc.setDrawColor(23, 107, 135);
    doc.line(20, 93, 80, 93);
    
    // Flight route visualization
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(booking.from, 30, 110);
    doc.text("➜", 105, 110);
    doc.text(booking.to, 160, 110);
    
    // Date information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Departure: ${booking.departure}`, 30, 125);
    if (booking.returnDate) {
      doc.text(`Return: ${booking.returnDate}`, 140, 125);
    }
    
    // Passenger details
    doc.setFontSize(16);
    doc.setTextColor(23, 107, 135);
    doc.text("PASSENGER INFORMATION", 20, 145);
    doc.line(20, 148, 95, 148);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Passengers: ${booking.passengers}`, 30, 160);
    doc.text(`Class: ${booking.travelClass}`, 30, 170);
    doc.text(`Trip Type: ${booking.tripType}`, 30, 180);
    doc.text(`Flexible Dates: ${booking.flexibleDates ? "Yes" : "No"}`, 30, 190);
    
    // Travel tips section
    doc.setFontSize(16);
    doc.setTextColor(23, 107, 135);
    doc.text("TRAVEL TIPS", 20, 210);
    doc.line(20, 213, 55, 213);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const insight = generateInsight(booking);
    doc.text(`• ${insight.msg}`, 30, 225);
    doc.text("• Check-in online 24 hours before departure", 30, 235);
    doc.text("• Arrive at airport at least 2 hours before flight", 30, 245);
    doc.text("• Keep identification documents handy", 30, 255);
    
    // Footer with QR code placeholder
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 270, 220, 30, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing AirGo Airlines", 105, 280, { align: "center" });
    doc.text("For assistance, contact: support@airgo.com | +1 (800) 123-4567", 105, 285, { align: "center" });
    
    // QR code placeholder
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.rect(180, 265, 30, 30, 'S');
    doc.text("QR CODE", 195, 280, { align: "center" });
    
    // Page border
    doc.setDrawColor(200, 200, 200);
    doc.rect(5, 5, 200, 287);
    
    // Save the PDF
    doc.save(`AirGo_Booking_${booking.id}.pdf`);
    
    showAlert(`PDF for Booking #${booking.id} generated!`, "success");
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