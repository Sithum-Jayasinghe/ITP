import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box
} from "@mui/material";

import FaceIcon from "@mui/icons-material/Face";
import FlightIcon from "@mui/icons-material/Flight";
import SeatIcon from "@mui/icons-material/EventSeat";
import BadgeIcon from "@mui/icons-material/Badge";

import { useEffect, useState } from "react";

// Dropdown options for the form
const nationalities = ["Sri Lankan", "Indian", "American", "Other"];
const flights = ["AI101", "UL202", "BA303"];
const seats = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
const statuses = ["Checked-In", "Pending", "Boarded"];

// Main functional component for the check-in form
const CheckForm = ({ addCheck, updateCheck, submitted, data, isEdit }) => {
  // State variables for form inputs
  const [checkId, setCheckId] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [status, setStatus] = useState("");

  // State for face scan process
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Snackbar alert control
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Reset form when submission is complete
  useEffect(() => {
    if (!submitted) resetForm();
  }, [submitted]);

  // Populate form fields if editing existing passenger data
  useEffect(() => {
    if (data && data.checkId) {
      setCheckId(data.checkId);
      setPassengerName(data.passengerName);
      setPassportNumber(data.passportNumber);
      setNationality(data.nationality);
      setFlightNumber(data.flightNumber);
      setSeatNumber(data.seatNumber);
      setStatus(data.status);
      setFaceScanSuccess(data.faceScanSuccess || false);
    }
  }, [data]);

  // Reset all form fields to empty/default values
  const resetForm = () => {
    setCheckId("");
    setPassengerName("");
    setPassportNumber("");
    setNationality("");
    setFlightNumber("");
    setSeatNumber("");
    setStatus("");
    setFaceScanSuccess(false);
    setScanning(false);
  };

  // Simulate a face scan with random success/failure
  const handleFaceScan = () => {
    setScanning(true);
    setAlertOpen(false);

    // Mock async scan delay (2 seconds)
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success chance
      setFaceScanSuccess(success);
      setScanning(false);
      setAlertOpen(true);
      setAlertMessage(success ? "Face Verified Successfully!" : "Face Scan Failed!");
      setAlertSeverity(success ? "success" : "error");
    }, 2000);
  };

  const handleSubmit = () => {
    const checkData = {
      checkId,
      passengerName,
      passportNumber,
      nationality,
      flightNumber,
      seatNumber,
      status,
      faceScanSuccess
    };

    if (isEdit) {
      updateCheck(checkData);
    } else {
      addCheck(checkData);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        backgroundColor: "#f9f9f9",
        boxShadow: 3
      }}
    >
      {/* Title */}
      <Typography variant="h5" mb={2}>✈ Airline Check-In Form</Typography>

      {/* Grid container for form fields */}
      <Grid container spacing={2}>

        {/* Check ID field */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Check ID"
            type="number"
            fullWidth
            value={checkId}
            onChange={(e) => setCheckId(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Passenger Name field */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passenger Name"
            fullWidth
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaceIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Passport Number field */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passport Number"
            fullWidth
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
          />
        </Grid>

        {/* Nationality dropdown */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Nationality"
            fullWidth
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            {nationalities.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Flight Number dropdown */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Flight Number"
            fullWidth
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FlightIcon />
                </InputAdornment>
              )
            }}
          >
            {flights.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Seat Number dropdown */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Seat Number"
            fullWidth
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SeatIcon />
                </InputAdornment>
              )
            }}
          >
            {seats.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status dropdown */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statuses.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Face Scan button and indicator */}
        <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleFaceScan}
            color={faceScanSuccess ? "success" : "default"}
            disabled={scanning}
            sx={{ mr: 1 }}
          >
            {scanning ? <CircularProgress size={24} /> : <FaceIcon fontSize="large" />}
          </IconButton>
          <Typography>
            {scanning
              ? "Scanning..."
              : faceScanSuccess
              ? "Face Verified"
              : "Scan Face"}
          </Typography>
        </Grid>

        {/* Submit button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5 }}
            onClick={handleSubmit}
            disabled={!faceScanSuccess} // Only allow submit after successful face scan
          >
            {isEdit ? "Update Check-In" : "Check-In Passenger"}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar alert for scan result */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckForm;