import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useEffect, useState } from "react";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SheduleVideo from "../Images/Schdule.mp4";

// Example airport list
const airports = [
  "Colombo Bandaranaike International Airport (CMB)",
  "London Heathrow Airport (LHR)",
  "Dubai International Airport (DXB)",
  "John F. Kennedy International Airport (JFK)",
  "Singapore Changi Airport (SIN)",
  "Tokyo Haneda Airport (HND)",
  "Frankfurt Airport (FRA)",
  "Paris Charles de Gaulle Airport (CDG)",
  "Sydney Kingsford Smith Airport (SYD)",
  "Hong Kong International Airport (HKG)",
  "Doha Hamad International Airport (DOH)",
  "Los Angeles International Airport (LAX)",
  "Toronto Pearson International Airport (YYZ)",
  "Amsterdam Schiphol Airport (AMS)",
  "Beijing Capital International Airport (PEK)",
  "Seoul Incheon International Airport (ICN)",
  "Bangkok Suvarnabhumi Airport (BKK)",
  "Kuala Lumpur International Airport (KUL)",
  "Istanbul Airport (IST)",
];

// Example aircraft types
const aircraftTypes = [
  "Airbus A320",
  "Boeing 737",
  "Boeing 777",
  "Airbus A380",
  "Boeing 787 Dreamliner",
];

// Flight status options
const flightStatuses = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "On Time", label: "On Time" },
  { value: "Delayed", label: "Delayed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Departed", label: "Departed" },
  { value: "Arrived", label: "Arrived" },
];

const ScheduleForm = ({ addSchedule, updateSchedule, submitted, data, isEdit }) => {
  const [id, setId] = useState("");
  const [flightName, setFlightName] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [dtime, setDtime] = useState(null);
  const [atime, setAtime] = useState(null);
  const [aircraft, setAircraft] = useState("");
  const [seats, setSeats] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form
  useEffect(() => {
    if (!submitted) resetForm();
  }, [submitted]);

  // Load existing schedule when editing
  useEffect(() => {
    if (data && data.id) {
      setId(data.id);
      setFlightName(data.flightName || "");
      setDeparture(data.departure || "");
      setArrival(data.arrival || "");
      setDtime(data.dtime ? dayjs(data.dtime) : null);
      setAtime(data.atime ? dayjs(data.atime) : null);
      setAircraft(data.aircraft || "");
      setSeats(data.seats || "");
      setStatus(data.status || "");
    }
  }, [data]);

  const resetForm = () => {
    setId("");
    setFlightName("");
    setDeparture("");
    setArrival("");
    setDtime(null);
    setAtime(null);
    setAircraft("");
    setSeats("");
    setStatus("");
    setErrors({});
  };

  // ✅ Enhanced validation with date constraints
  const validateForm = () => {
    const newErrors = {};
    const today = dayjs().startOf('day');
    
    // Flight ID validation
    if (!id) newErrors.id = "Flight ID is required.";
    else if (!/^\d+$/.test(id)) newErrors.id = "Flight ID must be a number.";
    else if (Number(id) <= 0) newErrors.id = "Flight ID must be greater than 0.";

    // Flight Name validation
    if (!flightName.trim()) newErrors.flightName = "Flight Name is required.";
    else if (!/^[A-Za-z0-9\s-]+$/.test(flightName))
      newErrors.flightName =
        "Flight Name can only contain letters, numbers, spaces, or dashes.";

    // Airport validation
    if (!departure.trim()) newErrors.departure = "Select a departure airport.";
    if (!arrival.trim()) newErrors.arrival = "Select an arrival airport.";
    if (departure && arrival && departure === arrival)
      newErrors.arrival = "Arrival cannot be the same as departure.";

    // ✅ Departure date validation - Only today or past dates allowed
    if (!dtime) {
      newErrors.dtime = "Select departure date & time.";
    } else {
      const departureDate = dtime.startOf('day');
      // Check if departure date is in the future
      if (departureDate.isAfter(today)) {
        newErrors.dtime = "Departure date cannot be in the future. Only today or past dates are allowed.";
      }
    }

    // ✅ Arrival date validation - Must be after departure
    if (!atime) {
      newErrors.atime = "Select arrival date & time.";
    } else if (dtime && dayjs(atime).isBefore(dtime)) {
      newErrors.atime = "Arrival time must be after departure time.";
    }

    // Aircraft validation
    if (!aircraft.trim()) newErrors.aircraft = "Select an aircraft type.";

    // Seats validation
    if (!seats) newErrors.seats = "Seats are required.";
    else if (!/^\d+$/.test(seats)) newErrors.seats = "Seats must be a number.";
    else if (Number(seats) <= 0) newErrors.seats = "Seats must be greater than 0.";

    // Status validation
    if (!status.trim()) newErrors.status = "Select flight status.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle departure date change with validation
  const handleDepartureChange = (newDtime) => {
    setDtime(newDtime);
    
    // Clear departure error when user selects a new date
    if (errors.dtime) {
      setErrors({ ...errors, dtime: "" });
    }
    
    // If arrival time exists and is before new departure time, clear it
    if (atime && newDtime && dayjs(atime).isBefore(newDtime)) {
      setAtime(null);
      if (errors.atime) {
        setErrors({ ...errors, atime: "" });
      }
    }
  };

  // ✅ Handle arrival date change with validation
  const handleArrivalChange = (newAtime) => {
    setAtime(newAtime);
    
    // Clear arrival error when user selects a new date
    if (errors.atime) {
      setErrors({ ...errors, atime: "" });
    }
  };

  // ✅ Custom validator for DateTimePicker - Disable future dates for departure
  const shouldDisableDepartureDate = (date) => {
    return dayjs(date).isAfter(dayjs(), 'day');
  };

  // ✅ Custom validator for DateTimePicker - Enable only dates after departure for arrival
  const shouldDisableArrivalDate = (date) => {
    if (!dtime) return false;
    return dayjs(date).isBefore(dtime, 'minute');
  };

  // Submit
  const handleSubmit = () => {
    if (!validateForm()) return;
    const scheduleData = {
      id,
      flightName,
      departure,
      arrival,
      dtime: dtime.toISOString(),
      atime: atime.toISOString(),
      aircraft,
      seats: Number(seats),
      status,
    };
    isEdit ? updateSchedule(scheduleData) : addSchedule(scheduleData);
    resetForm();
  };

  // ✅ Clear error when user starts typing in a field
  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Video Banner */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "280px",
          mb: 5,
          overflow: "hidden",
          borderRadius: "12px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
        }}
      >
        <video
          src={SheduleVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
          }}
        />
        <Typography
          variant="h3"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontWeight: "bold",
            textShadow: "3px 3px 12px rgba(0,0,0,0.8)",
            textAlign: "center",
          }}
        >
          Flight Scheduling
          <Typography
            variant="h6"
            sx={{ fontWeight: 400, mt: 1, opacity: 0.9 }}
          >
            Manage and track flights with ease
          </Typography>
        </Typography>
      </Box>

      {/* Form */}
      <Box
        sx={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 4,
          borderRadius: 3,
          boxShadow: 4,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          background: "linear-gradient(90deg, #4a83bbff 0%, #5089b7ff 100%)",
          color: "#fff",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="700"
          gutterBottom
          sx={{ color: "#fff" }}
        >
          Flight Schedule Management
        </Typography>

        <Grid container spacing={3}>
          {/* Flight ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight ID"
              type="text"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                clearError("id");
              }}
              fullWidth
              required
              disabled={isEdit}
              error={!!errors.id}
              helperText={errors.id || "Unique flight identifier"}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Flight Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Name / Number"
              value={flightName}
              onChange={(e) => {
                setFlightName(e.target.value);
                clearError("flightName");
              }}
              fullWidth
              required
              error={!!errors.flightName}
              helperText={errors.flightName}
              placeholder="e.g. UL123"
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Departure Airport */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Departure Airport"
              value={departure}
              onChange={(e) => {
                setDeparture(e.target.value);
                clearError("departure");
              }}
              fullWidth
              select
              required
              error={!!errors.departure}
              helperText={errors.departure}
              InputProps={{
                style: { backgroundColor: "#fff" },
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoffIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {airports.map((airport) => (
                <MenuItem key={airport} value={airport}>
                  {airport}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Arrival Airport */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Arrival Airport"
              value={arrival}
              onChange={(e) => {
                setArrival(e.target.value);
                clearError("arrival");
              }}
              fullWidth
              select
              required
              error={!!errors.arrival}
              helperText={errors.arrival}
              InputProps={{
                style: { backgroundColor: "#fff" },
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightLandIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {airports.map((airport) => (
                <MenuItem key={airport} value={airport}>
                  {airport}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Departure DateTime */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Departure Date & Time"
              value={dtime}
              onChange={handleDepartureChange}
              shouldDisableDate={shouldDisableDepartureDate}
              minDateTime={dayjs().subtract(1, 'year')} // Allow dates up to 1 year back
              maxDateTime={dayjs()} // Disable future dates
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.dtime}
                  helperText={errors.dtime || "Only today or past dates allowed"}
                  InputProps={{
                    ...params.InputProps,
                    style: { backgroundColor: "#fff" },
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Arrival DateTime */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Arrival Date & Time"
              value={atime}
              onChange={handleArrivalChange}
              shouldDisableDate={shouldDisableArrivalDate}
              minDateTime={dtime || dayjs().subtract(1, 'year')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.atime}
                  helperText={errors.atime || "Must be after departure time"}
                  InputProps={{
                    ...params.InputProps,
                    style: { backgroundColor: "#fff" },
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Aircraft Type */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Aircraft Type"
              value={aircraft}
              onChange={(e) => {
                setAircraft(e.target.value);
                clearError("aircraft");
              }}
              fullWidth
              select
              required
              error={!!errors.aircraft}
              helperText={errors.aircraft}
              InputProps={{
                style: { backgroundColor: "#fff" },
                startAdornment: (
                  <InputAdornment position="start">
                    <EventSeatIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {aircraftTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Seats */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Total Seats"
              type="text"
              value={seats}
              onChange={(e) => {
                setSeats(e.target.value);
                clearError("seats");
              }}
              fullWidth
              required
              error={!!errors.seats}
              helperText={errors.seats || "Number of passenger seats available"}
              inputProps={{ min: 1 }}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Flight Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                clearError("status");
              }}
              fullWidth
              select
              required
              error={!!errors.status}
              helperText={errors.status}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            >
              {flightStatuses.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ textAlign: "center", marginTop: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={submitted}
              sx={{
                width: 220,
                fontWeight: "bold",
                fontSize: "1.1rem",
                backgroundColor: "#fff",
                color: "#1976d2",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {isEdit ? "Update Schedule" : "Add Schedule"}
            </Button>
          </Grid>

          {/* ✅ Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 2,
                  borderRadius: 1,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  mt: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: "#ffeb3b", fontWeight: "bold" }}>
                  ⚠️ Please fix the following errors before submitting:
                </Typography>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "#ffeb3b" }}>
                  {Object.values(errors).map((error, index) => (
                    <li key={index} style={{ fontSize: "0.9rem" }}>
                      {error}
                    </li>
                  ))}
                </ul>
              </Box>
            </Grid>
          )}

          {/* ✅ Date Validation Info */}
          <Grid item xs={12}>
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: 2,
                borderRadius: 1,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                mt: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "#e3f2fd", fontWeight: "bold" }}>
                📋 Date Validation Rules:
              </Typography>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "#e3f2fd" }}>
                <li style={{ fontSize: "0.9rem" }}>• Departure date must be today or any past date</li>
                <li style={{ fontSize: "0.9rem" }}>• Arrival date must be after departure date</li>
                <li style={{ fontSize: "0.9rem" }}>• Future departure dates are not allowed</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleForm;