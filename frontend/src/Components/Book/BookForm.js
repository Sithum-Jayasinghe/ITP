import { 
  Box, Grid, Typography, TextField, Select, MenuItem, FormControl, 
  RadioGroup, FormControlLabel, Radio, Checkbox, Button, InputLabel, 
  InputAdornment, Snackbar, Alert, Slide, Avatar, FormHelperText
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import { useEffect, useState, useMemo } from "react";

// Countries
const countries = [
  "United States","Canada","United Kingdom","Germany","France","Australia",
  "Japan","India","Brazil","South Africa","China","Italy","Spain",
  "Netherlands","Sweden"
];

// Slide transition for Snackbar
const TransitionUp = (props) => <Slide {...props} direction="down" />;

// Travel class options with images
const classOptions = [
  { value: "Economy", label: "Economy", img: "https://cdn-icons-png.flaticon.com/512/1042/1042339.png" },
  { value: "Business", label: "Business", img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
  { value: "First", label: "First Class", img: "https://cdn-icons-png.flaticon.com/512/854/854894.png" }
];

// ✅ Max flight capacity
const MAX_PASSENGERS = 300;

const BookForm = ({ addBooking, updateBooking, submitted, data, isEdit, darkMode, bookings = [] }) => {
  const [id, setId] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("Economy");
  const [tripType, setTripType] = useState("round");
  const [flexibleDates, setFlexibleDates] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ✅ Today’s real date
  const today = new Date().toISOString().split("T")[0];

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
    setErrors({});
  };

  // ✅ Validation before submit
  const validateForm = () => {
    const newErrors = {};

    if (!from) newErrors.from = "Please select a departure country.";
    if (!to) newErrors.to = "Please select a destination country.";

    if (!departure) {
      newErrors.departure = "Please select a departure date.";
    } else if (departure > today) {
      newErrors.departure = "Departure date cannot be in the future.";
    }

    if (tripType === "round") {
      if (!returnDate) {
        newErrors.returnDate = "Please select a return date.";
      } else if (returnDate < departure) {
        newErrors.returnDate = "Return date cannot be before departure.";
      }
    }

    if (passengers < 1) newErrors.passengers = "Passengers must be a positive number.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showAlert("❌ Please fix the errors in the form.", "error");
      return false;
    }
    return true;
  };

  // ✅ Remaining seats in real-time
  const remainingSeats = useMemo(() => {
    const existingPassengers = bookings
      .filter(b => b.from === from && b.to === to && b.departure === departure)
      .reduce((sum, b) => sum + Number(b.passengers), 0);

    return MAX_PASSENGERS - existingPassengers;
  }, [bookings, from, to, departure]);

  const isFlightFull = () => remainingSeats - passengers < 0;

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
          <FormControl fullWidth sx={inputStyle} error={!!errors.from}>
            <InputLabel>From</InputLabel>
            <Select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {selected ? (
                    <Avatar 
                      src={`https://flagcdn.com/w40/${getCountryCode(selected)}.png`} 
                      alt={selected} 
                      sx={{ width: 28, height: 28 }}
                    />
                  ) : <FlightTakeoffIcon />}
                  <Typography variant="body1">{selected || "Select Country"}</Typography>
                </Box>
              )}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={`https://flagcdn.com/w40/${getCountryCode(c)}.png`} alt={c} sx={{ width: 32, height: 32 }} />
                    <Typography>{c}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.from && <FormHelperText>{errors.from}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* To */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={inputStyle} error={!!errors.to}>
            <InputLabel>To</InputLabel>
            <Select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {selected ? (
                    <Avatar 
                      src={`https://flagcdn.com/w40/${getCountryCode(selected)}.png`} 
                      alt={selected} 
                      sx={{ width: 28, height: 28 }}
                    />
                  ) : <FlightLandIcon />}
                  <Typography variant="body1">{selected || "Select Country"}</Typography>
                </Box>
              )}
            >
              {countries.map((c) => (
                <MenuItem key={c} value={c}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={`https://flagcdn.com/w40/${getCountryCode(c)}.png`} alt={c} sx={{ width: 32, height: 32 }} />
                    <Typography>{c}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.to && <FormHelperText>{errors.to}</FormHelperText>}
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
            error={!!errors.departure}
            helperText={errors.departure}
            inputProps={{ max: today }}   // ✅ Departure ≤ today
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
            error={!!errors.returnDate}
            helperText={errors.returnDate}
            inputProps={{ min: departure || today }}   // ✅ Return ≥ departure
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
            error={!!errors.passengers || remainingSeats <= 0}
            helperText={
              errors.passengers
                ? errors.passengers
                : remainingSeats > 0
                  ? `Seats left: ${remainingSeats}`
                  : "❌ Flight fully booked"
            }
            InputProps={{
              startAdornment: <InputAdornment position="start"><PeopleIcon /></InputAdornment>,
              inputProps: { min: 1 }
            }}
          />
        </Grid>

        {/* Class */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth sx={inputStyle}>
            <InputLabel>Class</InputLabel>
            <Select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              renderValue={(selected) => {
                const cls = classOptions.find(c => c.value === selected);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={cls.img} alt={cls.label} sx={{ width: 24, height: 24 }} />
                    <span>{cls.label}</span>
                  </Box>
                );
              }}
              startAdornment={<InputAdornment position="start"><ClassIcon /></InputAdornment>}
            >
              {classOptions.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={c.img} alt={c.label} sx={{ width: 24, height: 24 }} />
                    <span>{c.label}</span>
                  </Box>
                </MenuItem>
              ))}
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

        {/* Submit */}
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
            disabled={remainingSeats <= 0}
            onClick={() => {
              if (!validateForm()) return;

              if (!isEdit && isFlightFull()) {
                showAlert("❌ This flight is fully booked. Please choose another flight.", "error");
                return;
              }

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

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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

// ✅ Country name → code for flag
const getCountryCode = (countryName) => {
  const codes = {
    "United States": "us", "Canada": "ca", "United Kingdom": "gb",
    "Germany": "de", "France": "fr", "Australia": "au",
    "Japan": "jp", "India": "in", "Brazil": "br",
    "South Africa": "za", "China": "cn", "Italy": "it",
    "Spain": "es", "Netherlands": "nl", "Sweden": "se"
  };
  return codes[countryName] || "us";
};

export default BookForm;
