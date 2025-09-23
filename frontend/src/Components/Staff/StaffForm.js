import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

// ✅ Added Pilot and Cabin Crew
const roles = ["Manager", "Cashier", "Cleaner", "Technician", "Pilot", "Cabin Crew"];
const schedules = ["Morning", "Evening", "Night"];
const statuses = ["Active", "Inactive", "On Leave"];

const StaffForm = ({ addStaff, updateStaff, submitted, data, isEdit }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [certificate, setCertificate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!submitted) clearFormFields();
  }, [submitted]);

  useEffect(() => {
    if (data && data.id) {
      setId(data.id || "");
      setName(data.name || "");
      setRole(data.role || "");
      setNum(data.num || "");
      setEmail(data.email || "");
      setCertificate(data.certificate || "");
      setSchedule(data.schedule || "");
      setStatus(data.status || "");
    }
  }, [data]);

  const clearFormFields = () => {
    setId("");
    setName("");
    setRole("");
    setNum("");
    setEmail("");
    setCertificate("");
    setSchedule("");
    setStatus("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Employee ID
    if (!id) newErrors.id = "Employee ID is required.";
    else if (!/^\d+$/.test(id)) newErrors.id = "Employee ID must be a valid number.";
    else if (Number(id) <= 0)
      newErrors.id = "Employee ID must be greater than 0.";

    // Full Name
    if (!name.trim()) newErrors.name = "Full Name is required.";
    else if (!/^[A-Za-z\s]+$/.test(name))
      newErrors.name = "Full Name can only contain letters and spaces.";

    // Role
    if (!role) newErrors.role = "Role is required.";

    // Contact Number
    if (!num) newErrors.num = "Contact Number is required.";
    else if (!/^\d{10}$/.test(num))
      newErrors.num = "Contact Number must be 10 digits.";

    // Email
    if (!email) newErrors.email = "Email is required.";
    else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) newErrors.email = "Enter a valid email address.";
    }

    // Certificate
    if (!certificate.trim()) newErrors.certificate = "Certificate/License is required.";
    else if (certificate.trim().length < 3)
      newErrors.certificate = "Certificate/License must be at least 3 characters.";

    // Schedule
    if (!schedule) newErrors.schedule = "Schedule is required.";

    // Status
    if (!status) newErrors.status = "Status is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const staffData = {
      id,
      name,
      role,
      num,
      email,
      certificate,
      schedule,
      status,
    };

    isEdit ? updateStaff(staffData) : addStaff(staffData);
    clearFormFields();
  };

  return (
    <Paper
      sx={{ p: 4, mb: 4, borderRadius: 3, backgroundColor: "#f9f9f9" }}
      elevation={6}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, color: "#007acc", fontWeight: 600 }}
      >
        {isEdit ? "Update Staff" : "Add New Staff"}
      </Typography>

      <Grid container spacing={3}>
        {/* Employee ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="text"
            label="Employee ID "
            value={id}
            onChange={(e) => setId(e.target.value)}
            error={!!errors.id}
            helperText={errors.id}
            InputProps={{ startAdornment: <BadgeIcon sx={{ mr: 1 }} /> }}
            disabled={isEdit}
          />
        </Grid>

        {/* Full Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        {/* Role */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            {errors.role && (
              <Typography variant="caption" color="error">
                {errors.role}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Contact Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Number"
            type="text"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            error={!!errors.num}
            helperText={errors.num}
            InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        {/* Certificate */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Certificate / License #"
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            error={!!errors.certificate}
            helperText={errors.certificate}
            InputProps={{ startAdornment: <AssignmentIndIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        {/* Schedule */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.schedule}>
            <InputLabel>Schedule</InputLabel>
            <Select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            >
              {schedules.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
            {errors.schedule && (
              <Typography variant="caption" color="error">
                {errors.schedule}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <Typography variant="caption" color="error">
                {errors.status}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#00c6e6",
                "&:hover": { backgroundColor: "#009bbf" },
              }}
              onClick={handleSubmit}
            >
              {isEdit ? "Update" : "Add"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StaffForm;
