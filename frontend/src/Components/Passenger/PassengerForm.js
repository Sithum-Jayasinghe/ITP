import {
  Button,
  Grid,
  Typography,
  MenuItem,
  TextField,
  Box,
  FormHelperText,
  Paper,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Fade,
  InputAdornment,
  Alert,
  Snackbar,
  Slide
} from "@mui/material";
import {
  Person,
  Luggage,
  Restaurant,
  EventSeat,
  Add,
  Edit,
  CheckCircle,
  Info
} from "@mui/icons-material";
import { useEffect, useState } from "react";

// Slide transition for Snackbar
const TransitionUp = (props) => <Slide {...props} direction="down" />;

const baggageOptions = [
  { value: "10kg", label: "10kg", price: 1000, icon: "🧳" },
  { value: "15kg", label: "15kg", price: 1500, icon: "🧳" },
  { value: "20kg", label: "20kg", price: 2000, icon: "🧳" },
  { value: "25kg", label: "25kg", price: 2500, icon: "🧳" },
  { value: "30kg", label: "30kg", price: 3000, icon: "🧳" }
];

const mealOptions = [
  { value: "Veg", label: "Vegetarian", price: 500, icon: "🥗" },
  { value: "Non-Veg", label: "Non-Vegetarian", price: 700, icon: "🍗" },
  { value: "Vegan", label: "Vegan", price: 600, icon: "🌱" },
  { value: "Gluten-Free", label: "Gluten-Free", price: 650, icon: "🌾" }
];

const seatClasses = [
  { type: "First Class", rows: 4, seatsPerRow: 4, color: "#FFD700", icon: "⭐" },
  { type: "Business", rows: 6, seatsPerRow: 6, color: "#90CAF9", icon: "💼" },
  { type: "Economy", rows: 15, seatsPerRow: 6, color: "#A5D6A7", icon: "💺" }
];

// Helpers to sanitize input
const onlyLetters = (v) => v.replace(/[^A-Za-z\s]/g, "");
const digitsOnly = (v) => v.replace(/\D/g, "");

const PassengerForm = ({
  addPassenger,
  updatePassenger,
  submitted,
  data,
  isEdit,
  showAlert,
  darkMode = false
}) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [passport, setPassport] = useState("");
  const [baggage, setBaggage] = useState("");
  const [meal, setMeal] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Generate seat layout
  const generateSeatLayout = () => {
    let seatNumber = 1;
    const layout = [];
    
    seatClasses.forEach((classInfo) => {
      for (let row = 1; row <= classInfo.rows; row++) {
        const rowSeats = [];
        for (let seat = 1; seat <= classInfo.seatsPerRow; seat++) {
          rowSeats.push({
            number: seatNumber,
            class: classInfo.type,
            color: classInfo.color,
            icon: classInfo.icon
          });
          seatNumber++;
        }
        layout.push(rowSeats);
      }
      // Add aisle (empty array as spacer/aisle between classes)
      if (classInfo.type !== "First Class") {
        layout.push([]);
      }
    });
    
    return layout;
  };

  const seatLayout = generateSeatLayout();

  const showFormAlert = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (!submitted) resetForm();
  }, [submitted]);

  useEffect(() => {
    if (data && data.id) {
      setId(String(data.id));
      setName(data.name || "");
      setAge(data.age ? String(data.age) : "");
      setPassport(data.passport ? String(data.passport) : "");
      setBaggage(data.baggage || "");
      setMeal(data.meal || "");
      setSelectedSeats(data.seats || []);
    }
  }, [data]);

  const resetForm = () => {
    setId("");
    setName("");
    setAge("");
    setPassport("");
    setBaggage("");
    setMeal("");
    setSelectedSeats([]);
    setErrors({});
  };

  const handleSeatClick = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
    setErrors((prev) => ({ ...prev, seats: "" }));
  };

  const getSeatInfo = (seatNumber) => {
    for (const row of seatLayout) {
      for (const seat of row) {
        if (seat.number === seatNumber) {
          return seat;
        }
      }
    }
    return null;
  };

  const calculateTotal = () => {
    const baggageObj = baggageOptions.find(b => b.value === baggage);
    const mealObj = mealOptions.find(m => m.value === meal);
    return (baggageObj?.price || 0) + (mealObj?.price || 0);
  };

  const validateForm = () => {
    const newErrors = {};

    // ID: exactly 10 digits
    if (!id || !/^\d{10}$/.test(id)) {
      newErrors.id = "Passenger ID must be exactly 10 digits.";
    }
    // Name: letters and spaces, min 3 chars
    if (!name || name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Name can only contain letters and spaces.";
    }
    // Age: 1–99
    if (!age || !/^\d+$/.test(age) || Number(age) < 1 || Number(age) >= 100) {
      newErrors.age = "Please enter a valid age (1-99).";
    }
    // Passport: exactly 12 digits
    if (!passport || !/^\d{12}$/.test(passport)) {
      newErrors.passport = "Passport number must be exactly 12 digits.";
    }
    if (!baggage) newErrors.baggage = "Please select baggage option.";
    if (!meal) newErrors.meal = "Please select meal option.";
    if (selectedSeats.length === 0) newErrors.seats = "Please select at least one seat.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showFormAlert("❌ Please fix the errors in the form.", "error");
      return;
    }

    const baggageObj = baggageOptions.find(b => b.value === baggage);
    const mealObj = mealOptions.find(m => m.value === meal);
    
    const passengerData = {
      id,
      name,
      age,
      passport,
      baggage,
      baggagePrice: baggageObj?.price || 0,
      meal,
      mealPrice: mealObj?.price || 0,
      seats: selectedSeats,
      seatDetails: selectedSeats.map(seatNumber => getSeatInfo(seatNumber)),
      total: calculateTotal()
    };

    if (isEdit) {
      updatePassenger(passengerData);
      showFormAlert("Passenger updated successfully! ✅", "success");
    } else {
      addPassenger(passengerData);
      showFormAlert("Passenger added successfully! ✅", "success");
    }
    resetForm();
  };

  const formStyle = {
    p: 4,
    mb: 4,
    borderRadius: 4,
    background: darkMode 
      ? "linear-gradient(145deg, #2d2d2d, #252525)" 
      : "linear-gradient(145deg, #ffffff, #f8fbff)",
    boxShadow: darkMode ? 3 : 2,
    border: darkMode ? "1px solid #444" : "1px solid #e0e0e0"
  };

  const inputStyle = {
    backgroundColor: darkMode ? "#333" : "#fff",
    color: darkMode ? "#fff" : "#000",
    borderRadius: 2,
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: darkMode ? "#555" : "#ccc" },
      "&:hover fieldset": { borderColor: "#00e5ff" },
      "&.Mui-focused fieldset": { borderColor: "#00e5ff" },
    },
    "& .MuiInputBase-input": { color: darkMode ? "#fff" : "#000" },
  };

  const labelStyle = { 
    color: darkMode ? "#fff" : "#000", 
    mb: 1, 
    display: "flex", 
    alignItems: "center", 
    gap: 1 
  };

  return (
    <Paper elevation={0} sx={formStyle}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar sx={{ 
          bgcolor: darkMode ? "#00c6e6" : "#007acc", 
          width: 56, 
          height: 56 
        }}>
          <Person sx={{ fontSize: 32 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: darkMode ? "#fff" : "#007acc",
            background: darkMode ? "linear-gradient(45deg, #00c6e6, #00b0d9)" : "linear-gradient(45deg, #007acc, #005a9e)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Passenger Details
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? "#ccc" : "#666" }}>
            {isEdit ? "Update passenger information" : "Add new passenger to flight"}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 4, borderColor: darkMode ? "#444" : "#e0e0e0" }} />

      <Grid container spacing={3}>
        {/* ID */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Passenger ID"
            fullWidth
            value={id}
            onChange={(e) => {
              const val = digitsOnly(e.target.value).slice(0, 10); // exactly 10 digits
              setId(val);
              setErrors((prev) => ({ ...prev, id: "" }));
            }}
            error={!!errors.id}
            helperText={errors.id || "Enter exactly 10 digits"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color={darkMode ? "disabled" : "action"} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </Grid>

        {/* Name */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Full Name"
            fullWidth
            value={name}
            onChange={(e) => {
              const val = onlyLetters(e.target.value);
              setName(val);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            sx={inputStyle}
          />
        </Grid>

        {/* Age */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Age"
            fullWidth
            value={age}
            onChange={(e) => {
              const val = digitsOnly(e.target.value).slice(0, 2); // up to 2 digits
              setAge(val);
              setErrors((prev) => ({ ...prev, age: "" }));
            }}
            error={!!errors.age}
            helperText={errors.age || "Enter 1–99"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 2 }}
            sx={inputStyle}
          />
        </Grid>

        {/* Passport */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passport Number"
            fullWidth
            value={passport}
            onChange={(e) => {
              const val = digitsOnly(e.target.value).slice(0, 12); // exactly 12 digits
              setPassport(val);
              setErrors((prev) => ({ ...prev, passport: "" }));
            }}
            error={!!errors.passport}
            helperText={errors.passport || "Enter exactly 12 digits"}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 12 }}
            sx={inputStyle}
          />
        </Grid>

        {/* Baggage */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Baggage"
            fullWidth
            value={baggage}
            onChange={(e) => {
              setBaggage(e.target.value);
              setErrors((prev) => ({ ...prev, baggage: "" }));
            }}
            error={!!errors.baggage}
            helperText={errors.baggage}
            sx={inputStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Luggage color={darkMode ? "disabled" : "action"} />
                </InputAdornment>
              ),
            }}
          >
            {baggageOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  <Chip label={`LKR ${opt.price}`} size="small" color="primary" />
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Meal */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Meal Preference"
            fullWidth
            value={meal}
            onChange={(e) => {
              setMeal(e.target.value);
              setErrors((prev) => ({ ...prev, meal: "" }));
            }}
            error={!!errors.meal}
            helperText={errors.meal}
            sx={inputStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Restaurant color={darkMode ? "disabled" : "action"} />
                </InputAdornment>
              ),
            }}
          >
            {mealOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  <Chip label={`LKR ${opt.price}`} size="small" color="secondary" />
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Seat Selection */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: darkMode ? "#333" : "#f8fbff", 
            borderRadius: 3,
            boxShadow: 2
          }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <EventSeat color="primary" />
                <Typography variant="h6" sx={{ color: darkMode ? "#fff" : "#000" }}>
                  Seat Selection
                </Typography>
                <Tooltip title="Select one or more seats">
                  <Info color="action" fontSize="small" />
                </Tooltip>
              </Box>
              
              {/* Seat Class Legend */}
              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                {seatClasses.map((classInfo) => (
                  <Chip
                    key={classInfo.type}
                    icon={<span>{classInfo.icon}</span>}
                    label={classInfo.type}
                    sx={{ 
                      backgroundColor: classInfo.color,
                      color: "#000",
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>

              {/* Horizontal Seat Layout */}
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: darkMode ? "#2a2a2a" : "#f0f8ff",
                border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`
              }}>
                {/* Cockpit label for horizontal orientation */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? "#bbb" : "#666" }}>
                    Cockpit ➡️
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    alignItems: "flex-start",
                    overflowX: "auto",
                    pb: 1
                  }}
                >
                  {seatLayout.map((row, rowIndex) => (
                    <Box
                      key={rowIndex}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: "center",
                        minWidth: row.length > 0 ? "auto" : 16 // small spacer for aisle
                      }}
                    >
                      {row.length > 0 ? (
                        row.map((seat) => (
                          <Tooltip 
                            key={seat.number} 
                            title={seat.class}
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                width: 40,
                                height: 40,
                                minWidth: 40,
                                borderRadius: "8px",
                                backgroundColor: selectedSeats.includes(seat.number) 
                                  ? "#00c6e6" 
                                  : seat.color,
                                color: selectedSeats.includes(seat.number) ? "#fff" : "#000",
                                fontWeight: 600,
                                "&:hover": { 
                                  transform: "scale(1.1)",
                                  backgroundColor: selectedSeats.includes(seat.number) 
                                    ? "#00b0d9" 
                                    : seat.color
                                },
                                transition: "all 0.2s ease"
                              }}
                              onClick={() => handleSeatClick(seat.number)}
                            >
                              {seat.number}
                            </Button>
                          </Tooltip>
                        ))
                      ) : (
                        // Empty column for aisle
                        <Box sx={{ width: 16 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
              
              {errors.seats && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.seats}
                </FormHelperText>
              )}
              
              {selectedSeats.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary">
                    ✅ Selected Seats: {selectedSeats.sort((a, b) => a - b).join(", ")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? "#ccc" : "#666", mt: 0.5 }}>
                    Class: {selectedSeats.map(seat => {
                      const info = getSeatInfo(seat);
                      return info ? info.class : "Unknown";
                    }).join(", ")}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Total Calculation */}
        {selectedSeats.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ 
              backgroundColor: darkMode ? "#2a2a2a" : "#e8f5e8", 
              borderRadius: 3,
              border: `2px dashed ${darkMode ? "#4caf50" : "#4caf50"}`
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: darkMode ? "#4caf50" : "#2e7d32", 
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}>
                  <CheckCircle /> Booking Summary
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Baggage:</Typography>
                      <Typography fontWeight={600}>
                        LKR {baggageOptions.find(b => b.value === baggage)?.price || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Meal:</Typography>
                      <Typography fontWeight={600}>
                        LKR {mealOptions.find(m => m.value === meal)?.price || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: darkMode ? "#333" : "#fff", 
                      borderRadius: 2,
                      textAlign: "center"
                    }}>
                      <Typography variant="body2" color="textSecondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h5" color="primary" fontWeight={700}>
                        LKR {calculateTotal()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Submit Button */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(45deg, #00c6e6, #007acc)",
              px: 6,
              py: 1.5,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: 3,
              fontSize: "1.1rem",
              "&:hover": {
                background: "linear-gradient(45deg, #00b0d9, #005a9e)",
                transform: "translateY(-2px)",
                boxShadow: 6
              },
              transition: "all 0.3s ease"
            }}
            onClick={handleSubmit}
            startIcon={isEdit ? <Edit /> : <Add />}
          >
            {isEdit ? "Update Passenger" : "Add Passenger"}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar for form alerts */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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
            alignItems: "center"
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PassengerForm;