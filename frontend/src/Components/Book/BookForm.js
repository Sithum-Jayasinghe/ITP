import { Box, Grid, Typography, TextField, Select, MenuItem, FormControl, RadioGroup, FormControlLabel, Radio, Checkbox, Button, InputLabel, InputAdornment, Snackbar, Alert, Slide } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import { useEffect, useState } from "react";

// International countries list
const countries = ["United States","Canada","United Kingdom","Germany","France","Australia","Japan","India","Brazil","South Africa","China","Italy","Spain","Netherlands","Sweden"];

// Slide transition for Snackbar
const TransitionUp = (props) => <Slide {...props} direction="down" />;

const BookForm = ({ addBooking, updateBooking, submitted, data, isEdit, darkMode }) => {
  const [id, setId] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("Economy");
  const [tripType, setTripType] = useState("round");
  const [flexibleDates, setFlexibleDates] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Show modern alert
  const showAlert = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => { if (!submitted) resetForm(); }, [submitted]);

  useEffect(() => {
    if (data && data.from) {
      setId(data.id || null);
      setFrom(data.from);
      setTo(data.to);
      setDeparture(data.departure);
      setReturnDate(data.returnDate);
      setPassengers(data.passengers);
      setTravelClass(data.travelClass);
      setTripType(data.tripType);
      setFlexibleDates(data.flexibleDates);
    }
  }, [data]);

  const resetForm = () => {
    setId(null);
    setFrom("");
    setTo("");
    setDeparture("");
    setReturnDate("");
    setPassengers(1);
    setTravelClass("Economy");
    setTripType("round");
    setFlexibleDates(false);
  };

  const inputStyle = {
    backgroundColor: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#fff" : "#000",
    borderRadius: 2,
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: darkMode ? "#555" : "#ccc" },
      "&:hover fieldset": { borderColor: "#00e5ff" },
      "&.Mui-focused fieldset": { borderColor: "#00e5ff" },
    },
    "& .MuiInputBase-input": { color: darkMode ? "#fff" : "#000" },
  };

  const labelStyle = { color: darkMode ? "#fff" : "#000", mb: 0.5, display: "flex", alignItems: "center", gap: 1 };

  return (
    <Box sx={{ p: 4, mb: 5, borderRadius: 3, backgroundColor: darkMode ? "#1e1e1e" : "#fefefe", boxShadow: darkMode ? 5 : 3 }}>
      <Typography variant="h5" sx={{ mb: 4, color: darkMode ? "#00e5ff" : "#007acc", fontWeight: 600 }}>✈️ AirGo Booking</Typography>
      <Grid container spacing={3}>
        {/* From */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={inputStyle}>
            <InputLabel sx={{ color: darkMode ? "#fff" : "#000" }}>From</InputLabel>
            <Select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              startAdornment={<InputAdornment position="start"><FlightTakeoffIcon /></InputAdornment>}
            >
              {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        {/* To */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={inputStyle}>
            <InputLabel sx={{ color: darkMode ? "#fff" : "#000" }}>To</InputLabel>
            <Select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              startAdornment={<InputAdornment position="start"><FlightLandIcon /></InputAdornment>}
            >
              {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        {/* Departure */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Departure Date"
            type="date"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={inputStyle}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Return */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Return Date"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={inputStyle}
            disabled={tripType === "oneway"}
            InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Passengers */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passengers"
            type="number"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            fullWidth
            sx={inputStyle}
            InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Class */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={inputStyle}>
            <InputLabel>Class</InputLabel>
            <Select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              startAdornment={<InputAdornment position="start"><ClassIcon /></InputAdornment>}
            >
              <MenuItem value="Economy">Economy</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="First">First</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Trip Type */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography sx={labelStyle}>Trip Type</Typography>
            <RadioGroup row value={tripType} onChange={(e) => setTripType(e.target.value)}>
              <FormControlLabel value="round" control={<Radio />} label="Round Trip" sx={{ color: darkMode ? "#fff" : "#000" }} />
              <FormControlLabel value="oneway" control={<Radio />} label="One Way" sx={{ color: darkMode ? "#fff" : "#000" }} />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Flexible Dates */}
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={flexibleDates} onChange={(e) => setFlexibleDates(e.target.checked)} />}
            label="Flexible Dates"
            sx={{ color: darkMode ? "#fff" : "#000" }}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #00c6e6, #007acc)",
              color: "#fff",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              "&:hover": { opacity: 0.85 }
            }}
            onClick={() => {
              if (isEdit) {
                updateBooking({ id, from, to, departure, returnDate, passengers, travelClass, tripType, flexibleDates });
                showAlert(`Booking #${id} updated successfully!`, "info");
              } else {
                const newBooking = { from, to, departure, returnDate, passengers, travelClass, tripType, flexibleDates, id: Date.now() };
                addBooking(newBooking);
                showAlert(`Booking added successfully!`, "success");
                resetForm();
              }
            }}
          >
            {isEdit ? "Update Booking" : "Book Flight"}
          </Button>
        </Grid>
      </Grid>

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
          sx={{ width: "100%", borderRadius: 3, fontWeight: 600, fontSize: "1rem", boxShadow: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookForm;
