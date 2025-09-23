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

// Dropdown options
const nationalities = ["Sri Lankan", "Indian", "American", "Other"];
const flights = ["AI101", "UL202", "BA303"];
const seats = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"];
const statuses = ["Economy", "Business", "FirstClass"];

const CheckForm = ({
  addCheck,
  updateCheck,
  submitted,
  data,
  isEdit,
  existingChecks = [],
  registeredUsers = []
}) => {
  const [checkId, setCheckId] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [status, setStatus] = useState("");
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [errors, setErrors] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  useEffect(() => {
    if (!submitted) resetForm();
  }, [submitted]);

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
    setErrors({});
  };

  // Face scan simulation
  const handleFaceScan = () => {
    setScanning(true);
    setAlertOpen(false);

    setTimeout(() => {
      const success = Math.random() > 0.3;
      setFaceScanSuccess(success);
      setScanning(false);
      setAlertOpen(true);
      setAlertMessage(success ? "Face Verified Successfully!" : "Face Scan Failed!");
      setAlertSeverity(success ? "success" : "error");
    }, 2000);
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    // Check ID validation
    if (!checkId || Number(checkId) <= 0) {
      newErrors.checkId = "Check ID must be a positive number";
    } else if (
      !isEdit &&
      existingChecks.some((check) => check.checkId.toString() === checkId.toString())
    ) {
      newErrors.checkId = "Check ID already exists.";
    } else if (
      !registeredUsers.some((user) => user.id.toString() === checkId.toString())
    ) {
      newErrors.checkId = "Check ID must match a Registered User ID.";
    }

    if (!passengerName.trim() || !/^[A-Za-z\s]+$/.test(passengerName)) {
      newErrors.passengerName = "Passenger Name is required (letters only)";
    }
    if (!passportNumber.trim() || !/^[A-Za-z0-9]+$/.test(passportNumber)) {
      newErrors.passportNumber = "Passport Number is required (alphanumeric)";
    }
    if (!nationality) newErrors.nationality = "Select a nationality";
    if (!flightNumber) newErrors.flightNumber = "Select a flight number";
    if (!seatNumber) newErrors.seatNumber = "Select a seat number";
    if (!status) newErrors.status = "Select a status";
    if (!faceScanSuccess) newErrors.faceScan = "Face scan must be verified";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

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

    if (isEdit) updateCheck(checkData);
    else addCheck(checkData);

    resetForm();
  };

  return (
    <Box sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#f9f9f9", boxShadow: 3 }}>
      <Typography variant="h5" mb={2}>✈ Airline Check-In Form</Typography>

      <Grid container spacing={2}>
        {/* Check ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Check ID"
            type="number"
            fullWidth
            value={checkId}
            onChange={(e) => setCheckId(e.target.value)}
            error={!!errors.checkId}
            helperText={errors.checkId}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><BadgeIcon /></InputAdornment>
              ),
            }}
            disabled={isEdit}
          />
        </Grid>

        {/* Passenger Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passenger Name"
            fullWidth
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            error={!!errors.passengerName}
            helperText={errors.passengerName}
            InputProps={{
              startAdornment: <InputAdornment position="start"><FaceIcon /></InputAdornment>
            }}
          />
        </Grid>

        {/* Passport Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passport Number"
            fullWidth
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
            error={!!errors.passportNumber}
            helperText={errors.passportNumber}
          />
        </Grid>

        {/* Nationality */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Nationality"
            fullWidth
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            error={!!errors.nationality}
            helperText={errors.nationality}
          >
            {nationalities.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Flight Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Flight Number"
            fullWidth
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            error={!!errors.flightNumber}
            helperText={errors.flightNumber}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><FlightIcon /></InputAdornment>
              ),
            }}
          >
            {flights.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Seat Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Seat Number"
            fullWidth
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            error={!!errors.seatNumber}
            helperText={errors.seatNumber}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SeatIcon /></InputAdornment>
              ),
            }}
          >
            {seats.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Class Type"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            error={!!errors.status}
            helperText={errors.status}
          >
            {statuses.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Face Scan */}
        <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={handleFaceScan}
            color={faceScanSuccess ? "success" : "default"}
            disabled={scanning}
            sx={{ mr: 1 }}
          >
            {scanning ? <CircularProgress size={24} /> : <FaceIcon fontSize="large" />}
          </IconButton>
          <Typography color={errors.faceScan ? "error" : "inherit"}>
            {scanning
              ? "Scanning..."
              : faceScanSuccess
              ? "Face Verified"
              : errors.faceScan || "Scan Face"}
          </Typography>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5 }}
            onClick={handleSubmit}
          >
            {isEdit ? "Update Check-In" : "Check-In Passenger"}
          </Button>
        </Grid>
      </Grid>

      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert severity={alertSeverity} sx={{ width: "100%" }}>{alertMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckForm;
