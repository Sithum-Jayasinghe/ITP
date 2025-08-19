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

const nationalities = ["Sri Lankan", "Indian", "American", "Other"];
const flights = ["AI101", "UL202", "BA303"];
const seats = ["1A", "1B", "2A", "2B"];
const statuses = ["Checked-In", "Pending", "Boarded"];

const CheckForm = ({ addCheck, updateCheck, submitted, data, isEdit }) => {
  const [checkId, setCheckId] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [status, setStatus] = useState("");
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

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
  };

  const handleFaceScan = () => {
    setScanning(true);
    setAlertOpen(false);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setFaceScanSuccess(success);
      setScanning(false);
      setAlertOpen(true);
    }, 2000);
  };

  return (
    <Box sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#f9f9f9", boxShadow: 3 }}>
      <Typography variant="h5" mb={2}>✈ Airline Check-In Form</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Check ID"
            type="number"
            fullWidth
            value={checkId}
            onChange={(e) => setCheckId(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passenger Name"
            fullWidth
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><FaceIcon /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Passport Number"
            fullWidth
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
          />
        </Grid>
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
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Flight Number"
            fullWidth
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><FlightIcon /></InputAdornment> }}
          >
            {flights.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Seat Number"
            fullWidth
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SeatIcon /></InputAdornment> }}
          >
            {seats.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select label="Status" fullWidth value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Grid>

        {/* Face Scan */}
        <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleFaceScan} color={faceScanSuccess ? "success" : "default"} disabled={scanning}>
            {scanning ? <CircularProgress size={36} /> : <FaceIcon fontSize="large" />}
          </IconButton>
          <Typography sx={{ ml: 1 }}>
            {scanning ? "Scanning..." : faceScanSuccess ? "Face Verified" : "Scan Face"}
          </Typography>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5 }}
            onClick={() =>
              isEdit
                ? updateCheck({ checkId, passengerName, passportNumber, nationality, flightNumber, seatNumber, status, faceScanSuccess })
                : addCheck({ checkId, passengerName, passportNumber, nationality, flightNumber, seatNumber, status, faceScanSuccess })
            }
            disabled={!faceScanSuccess}
          >
            {isEdit ? "Update Check-In" : "Check-In Passenger"}
          </Button>
        </Grid>
      </Grid>

      <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)}>
        <Alert severity={faceScanSuccess ? "success" : "error"} sx={{ width: "100%" }}>
          {faceScanSuccess ? "Face Verified Successfully!" : "Face Scan Failed!"}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckForm;
