import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Example airport list for Departure & Arrival
const airports = [
  'Colombo Bandaranaike International Airport (CMB)',
  'London Heathrow Airport (LHR)',
  'Dubai International Airport (DXB)',
  'John F. Kennedy International Airport (JFK)',
  'Singapore Changi Airport (SIN)',
  'Tokyo Haneda Airport (HND)',
  'Frankfurt Airport (FRA)',
  'Paris Charles de Gaulle Airport (CDG)',
  'Sydney Kingsford Smith Airport (SYD)',
  'Hong Kong International Airport (HKG)',
  'Doha Hamad International Airport (DOH)',
  'Los Angeles International Airport (LAX)',
  'Toronto Pearson International Airport (YYZ)',
  'Amsterdam Schiphol Airport (AMS)',
  'Beijing Capital International Airport (PEK)',
  'Seoul Incheon International Airport (ICN)',
  'Bangkok Suvarnabhumi Airport (BKK)',
  'Kuala Lumpur International Airport (KUL)',
  'Istanbul Airport (IST)',
];

// Example aircraft types
const aircraftTypes = [
  'Airbus A320',
  'Boeing 737',
  'Boeing 777',
  'Airbus A380',
  'Boeing 787 Dreamliner',
];

// Flight status options
const flightStatuses = [
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'On Time', label: 'On Time' },
  { value: 'Delayed', label: 'Delayed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Departed', label: 'Departed' },
  { value: 'Arrived', label: 'Arrived' },
];

const ScheduleForm = ({ addSchedule, updateSchedule, submitted, data, isEdit }) => {
  const [id, setId] = useState('');
  const [flightName, setFlightName] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [dtime, setDtime] = useState(null);
  const [atime, setAtime] = useState(null);
  const [aircraft, setAircraft] = useState('');
  const [seats, setSeats] = useState('');
  const [status, setStatus] = useState('');

  // Reset form when submission completes
  useEffect(() => {
    if (!submitted) {
      setId('');
      setFlightName('');
      setDeparture('');
      setArrival('');
      setDtime(null);
      setAtime(null);
      setAircraft('');
      setSeats('');
      setStatus('');
    }
  }, [submitted]);

  // Load existing schedule data when editing
  useEffect(() => {
    if (data && data.id) {
      setId(data.id);
      setFlightName(data.flightName || '');
      setDeparture(data.departure || '');
      setArrival(data.arrival || '');
      setDtime(data.dtime ? dayjs(data.dtime) : null);
      setAtime(data.atime ? dayjs(data.atime) : null);
      setAircraft(data.aircraft || '');
      setSeats(data.seats || '');
      setStatus(data.status || '');
    }
  }, [data]);

  // Validate form
  const isFormValid = () => {
    return (
      id &&
      flightName.trim() &&
      departure.trim() &&
      arrival.trim() &&
      dtime &&
      atime &&
      aircraft.trim() &&
      seats > 0 &&
      status.trim()
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid()) {
      alert('Please fill all fields correctly.');
      return;
    }

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

    if (isEdit) updateSchedule(scheduleData);
    else addSchedule(scheduleData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 700,
          margin: '40px auto',
          padding: 4,
          bgcolor: '#f5f9ff',
          borderRadius: 3,
          boxShadow: 4,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <Typography variant="h4" fontWeight="700" color="primary" gutterBottom>
          Flight Schedule Management
        </Typography>

        <Grid container spacing={3}>
          {/* Flight ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight ID"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              fullWidth
              required
              disabled={isEdit}
              helperText="Unique flight identifier"
            />
          </Grid>

          {/* Flight Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Name / Number"
              value={flightName}
              onChange={(e) => setFlightName(e.target.value)}
              fullWidth
              required
              placeholder="e.g. UL123"
            />
          </Grid>

          {/* Departure Airport */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Departure Airport"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              fullWidth
              select
              required
              InputProps={{
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
              onChange={(e) => setArrival(e.target.value)}
              fullWidth
              select
              required
              InputProps={{
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
              onChange={setDtime}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
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
              onChange={setAtime}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
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
              onChange={(e) => setAircraft(e.target.value)}
              fullWidth
              select
              required
              InputProps={{
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
              type="number"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Number of passenger seats available"
            />
          </Grid>

          {/* Flight Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Flight Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              select
              required
            >
              {flightStatuses.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ textAlign: 'center', marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitted}
              sx={{ width: 220, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {isEdit ? 'Update Schedule' : 'Add Schedule'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleForm;
