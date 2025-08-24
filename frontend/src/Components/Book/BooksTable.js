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

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TransitionUp = (props) => <Slide {...props} direction="down" />;

const BooksTable = ({ rows = [], selectedBooking, deleteBooking, darkMode, addedBooking }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Show modern alert
  const showAlert = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle delete
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

  // Handle update
  const handleUpdateClick = (booking) => {
    selectedBooking(booking);
    showAlert(`Booking #${booking.id} ready to update!`, "info");
  };

  // Handle add booking alert
  if (addedBooking) {
    showAlert(`Booking #${addedBooking.id} added successfully!`, "success");
  }

  // Generate PDF
  const generatePDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Booking Details", 20, 20);
    doc.setFontSize(12);
    doc.text(`ID: ${booking.id}`, 20, 40);
    doc.text(`From: ${booking.from}`, 20, 50);
    doc.text(`To: ${booking.to}`, 20, 60);
    doc.text(`Departure: ${booking.departure}`, 20, 70);
    doc.text(`Return: ${booking.returnDate}`, 20, 80);
    doc.text(`Passengers: ${booking.passengers}`, 20, 90);
    doc.text(`Class: ${booking.travelClass}`, 20, 100);
    doc.text(`Trip Type: ${booking.tripType}`, 20, 110);
    doc.text(`Flexible Dates: ${booking.flexibleDates ? "Yes" : "No"}`, 20, 120);
    doc.save(`Booking_${booking.id}.pdf`);
  };

  return (
    <>
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
              {["ID", "From", "To", "Departure", "Return", "Passengers", "Class", "Trip Type", "Flexible", "Action"].map((head) => (
                <TableCell key={head} sx={{ color: "#fff" }}>{head}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} hover sx={{ backgroundColor: darkMode ? "#2a2a2a" : "#fff" }}>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><TagIcon fontSize="small" /> {row.id}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><FlightTakeoffIcon fontSize="small" /> {row.from}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><FlightLandIcon fontSize="small" /> {row.to}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><EventIcon fontSize="small" /> {row.departure}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><EventIcon fontSize="small" /> {row.returnDate}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><PeopleIcon fontSize="small" /> {row.passengers}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><ChairIcon fontSize="small" /> {row.travelClass}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><RepeatIcon fontSize="small" /> {row.tripType}</TableCell>
                  <TableCell sx={{ color: darkMode ? "#fff" : "#000" }}><CalendarTodayIcon fontSize="small" /> {row.flexibleDates ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button startIcon={<EditIcon />} sx={{ mr: 1, textTransform: "none", borderRadius: 2 }} variant="contained" color="info" size="small" onClick={() => handleUpdateClick(row)}>Update</Button>
                    <Button startIcon={<DeleteIcon />} sx={{ mr: 1, textTransform: "none", borderRadius: 2, color: "#fff", background: "linear-gradient(90deg, #ff4d4d, #ff0000)" }} size="small" onClick={() => handleDeleteClick(row)}>Delete</Button>
                    <Button startIcon={<PictureAsPdfIcon />} sx={{ textTransform: "none", borderRadius: 2, background: "linear-gradient(90deg, #4caf50, #2e7d32)", color: "#fff" }} size="small" onClick={() => generatePDF(row)}>PDF</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ color: darkMode ? "#fff" : "#000" }}>No Bookings Available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 3, p: 2, background: darkMode ? "#2a2a2a" : "#fff" } }}>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>⚠️ Are you sure you want to delete this booking?</Typography>
          <Typography sx={{ mb: 1 }}>Booking: {bookingToDelete?.from} → {bookingToDelete?.to} | ID: {bookingToDelete?.id}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2, color: darkMode ? "#fff" : "#000" }}>Cancel</Button>
          <Button variant="contained" onClick={confirmDelete} sx={{ borderRadius: 2, background: "linear-gradient(90deg, #ff4d4d, #ff0000)" }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Modern Snackbar for Add/Update/Delete */}
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
