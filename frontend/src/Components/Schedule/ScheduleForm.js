
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

  // Load data when editing
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

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    const today = dayjs().startOf("day");

    // ✅ Flight ID validation
    if (!id) newErrors.id = "Flight ID is required.";
    else if (!/^[0-9]+$/.test(id)) newErrors.id = "Flight ID must contain only numbers.";
    else if (Number(id) <= 0) newErrors.id = "Flight ID must be greater than 0.";

    // ✅ Flight Name validation
    if (!flightName.trim()) newErrors.flightName = "Flight Name is required.";
    else if (!/^[A-Za-z0-9]+$/.test(flightName))
      newErrors.flightName = "Flight Name can only contain letters and numbers (no spaces or symbols).";

    // Airports validation
    if (!departure.trim()) newErrors.departure = "Select a departure airport.";
    if (!arrival.trim()) newErrors.arrival = "Select an arrival airport.";
    if (departure && arrival && departure === arrival)
      newErrors.arrival = "Arrival cannot be the same as departure.";

    // ✅ Departure validation — today or future only
    if (!dtime) newErrors.dtime = "Select departure date & time.";
    else if (dtime.startOf("day").isBefore(today))
      newErrors.dtime = "Departure date cannot be in the past.";

    // ✅ Arrival validation — must be after departure
    if (!atime) newErrors.atime = "Select arrival date & time.";
    else if (dtime && dayjs(atime).isBefore(dtime))
      newErrors.atime = "Arrival time must be after departure time.";

    // ✅ Aircraft
    if (!aircraft.trim()) newErrors.aircraft = "Select an aircraft type.";

    // ✅ Seats validation
    if (!seats) newErrors.seats = "Seats are required.";
    else if (!/^[0-9]+$/.test(seats)) newErrors.seats = "Seats must be a valid number.";
    else if (Number(seats) > 300) newErrors.seats = "Seats cannot exceed 300.";

    // ✅ Status
    if (!status.trim()) newErrors.status = "Select flight status.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartureChange = (newDtime) => {
    setDtime(newDtime);
    if (errors.dtime) setErrors({ ...errors, dtime: "" });
    if (atime && newDtime && dayjs(atime).isBefore(newDtime)) {
      setAtime(null);
    }
  };

  const handleArrivalChange = (newAtime) => {
    setAtime(newAtime);
    if (errors.atime) setErrors({ ...errors, atime: "" });
  };

  const shouldDisableDepartureDate = (date) =>
    dayjs(date).isBefore(dayjs().startOf("day"));

  const shouldDisableArrivalDate = (date) => {
    if (!dtime) return dayjs(date).isBefore(dayjs().startOf("day"));
    return dayjs(date).isBefore(dtime, "minute");
  };

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

  const clearError = (field) => {
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* 🎬 Header Video */}
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
          }}
        >
          Flight Scheduling
        </Typography>
      </Box>

      {/* 🧾 Form */}
      <Box
        sx={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 4,
          borderRadius: 3,
          boxShadow: 4,
          background: "linear-gradient(90deg, #ffffffff 0%, #ffffffff 100%)",
          color: "#fff",
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Flight Schedule Management
        </Typography>

        <Grid container spacing={3}>
          {/* Flight ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight ID"
              value={id}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setId(e.target.value);
                clearError("id");
              }}
              fullWidth
              required
              error={!!errors.id}
              helperText={errors.id || "Only numbers allowed"}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Flight Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Name / Number"
              value={flightName}
              onChange={(e) => {
                if (/^[A-Za-z0-9]*$/.test(e.target.value)) setFlightName(e.target.value);
                clearError("flightName");
              }}
              fullWidth
              required
              error={!!errors.flightName}
              helperText={errors.flightName || "Only letters and numbers"}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Departure */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Departure Airport"
              select
              value={departure}
              onChange={(e) => {
                setDeparture(e.target.value);
                clearError("departure");
              }}
              fullWidth
              required
              error={!!errors.departure}
              helperText={errors.departure}
              InputProps={{style: { backgroundColor: "#fff" },
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoffIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              {airports.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Arrival */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Arrival Airport"
              select
              value={arrival}
              onChange={(e) => {
                setArrival(e.target.value);
                clearError("arrival");
              }}
              fullWidth
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
              {airports.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Departure Date */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Departure Date & Time"
              value={dtime}
              onChange={handleDepartureChange}
              shouldDisableDate={shouldDisableDepartureDate}
              minDateTime={dayjs()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.dtime}
                  helperText={errors.dtime || "Today or future dates only"}
                  InputProps={{
                    ...params.InputProps,
                    style: { backgroundColor: "#fff" },
                  }}
                />
              )}
            />
          </Grid>

          {/* Arrival date */}
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Arrival Date & Time"
              value={atime}
              onChange={handleArrivalChange}
              shouldDisableDate={shouldDisableArrivalDate}
              minDateTime={dtime || dayjs()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!errors.atime}
                  helperText={errors.atime || "After departure only"}
                  InputProps={{
                    ...params.InputProps,
                    style: { backgroundColor: "#fff" },
                  }}
                />
              )}
            />
          </Grid>

          {/* AirCraft */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Aircraft Type"
              select
              value={aircraft}
              onChange={(e) => {
                setAircraft(e.target.value);
                clearError("aircraft");
              }}
              fullWidth
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
              {aircraftTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ Total Seats - RealTime Validation */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Total Seats"
              value={seats}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  const numValue = Number(value);
                  if (numValue <= 300) {
                    setSeats(value);
                    clearError("seats");
                  }
                }
              }}
              fullWidth
              required
              error={!!errors.seats}
              helperText={errors.seats || "Only numbers allowed (max 300)"}
              InputProps={{ style: { backgroundColor: "#fff" } }}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Status"
              select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                clearError("status");
              }}
              fullWidth
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

          {/* Submit */}
          <Grid item xs={12} sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitted}
              sx={{
                width: 220,
                backgroundColor: "#fff",
                color: "#1976d2",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {isEdit ? "Update Schedule" : "Add Schedule"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleForm;

