import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const seatOptions = [
  { label: "Economy", value: "economy" },
  { label: "Business", value: "business" },
  { label: "First Class", value: "first" },
];

const locations = [
  "Colombo",
  "Dubai",
  "London",
  "Singapore",
  "Paris",
  "New York",
];

const BookForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    from: "",
    to: "",
    seatType: "",
    travelDate: dayjs(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, travelDate: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobile || !form.from || !form.to || !form.seatType) {
      alert("Please fill in all required fields.");
      return;
    }

    if (onSubmit) {
      onSubmit(form);
    }

    alert("Booking submitted!");
    setForm({
      name: "",
      email: "",
      mobile: "",
      from: "",
      to: "",
      seatType: "",
      travelDate: dayjs(),
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 5,
        p: 4,
        boxShadow: 3,
        borderRadius: 3,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Book Your Flight
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
            type="tel"
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            fullWidth
            label="From"
            name="from"
            value={form.from}
            onChange={handleChange}
            required
          >
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            fullWidth
            label="To"
            name="to"
            value={form.to}
            onChange={handleChange}
            required
          >
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <DatePicker
            label="Travel Date"
            value={form.travelDate}
            onChange={handleDateChange}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Seat Type"
            name="seatType"
            value={form.seatType}
            onChange={handleChange}
            required
          >
            {seatOptions.map((seat) => (
              <MenuItem key={seat.value} value={seat.value}>
                {seat.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" fullWidth type="submit">
            Book Ticket
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookForm;
