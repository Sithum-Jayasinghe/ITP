import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Typography,
  Button,
  Paper,
  Box,
  MenuItem,
  InputAdornment,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Sample options
const roles = ["Manager", "Cashier", "Cleaner", "Technician", "Pilot", "Cabin Crew"];
const schedules = ["Morning", "Evening", "Night"];
const statuses = ["Active", "Inactive", "On Leave"];

const StaffForm = ({ addStaff, updateStaff, submitted, data, isEdit }) => {
  const theme = useTheme();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [num, setNum] = useState("");
  const [email, setEmail] = useState("");
  const [certificate, setCertificate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("");
  const [shiftStartDate, setShiftStartDate] = useState(dayjs());
  const [shiftStartTime, setShiftStartTime] = useState(dayjs().hour(9).minute(0));
  const [shiftEndDate, setShiftEndDate] = useState(dayjs());
  const [shiftEndTime, setShiftEndTime] = useState(dayjs().hour(17).minute(0));
  const [errors, setErrors] = useState({});

  const now = dayjs();

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
      setShiftStartDate(data.shiftStartDate ? dayjs(data.shiftStartDate) : dayjs());
      setShiftStartTime(data.shiftStartTime ? dayjs(data.shiftStartTime, "HH:mm") : dayjs().hour(9));
      setShiftEndDate(data.shiftEndDate ? dayjs(data.shiftEndDate) : dayjs());
      setShiftEndTime(data.shiftEndTime ? dayjs(data.shiftEndTime, "HH:mm") : dayjs().hour(17));
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
    setShiftStartDate(dayjs());
    setShiftStartTime(dayjs().hour(9).minute(0));
    setShiftEndDate(dayjs());
    setShiftEndTime(dayjs().hour(17).minute(0));
    setErrors({});
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    switch (field) {
      case "id":
        if (!value) newErrors.id = "Employee ID is required.";
        else if (!/^\d+$/.test(value)) newErrors.id = "Must be a valid number.";
        else if (Number(value) <= 0) newErrors.id = "Must be greater than 0.";
        else delete newErrors.id;
        break;
      case "name":
        if (!value.trim()) newErrors.name = "Full Name is required.";
        else if (!/^[A-Za-z\s]+$/.test(value)) newErrors.name = "Only letters and spaces allowed.";
        else delete newErrors.name;
        break;
      case "role":
        if (!value) newErrors.role = "Role is required.";
        else delete newErrors.role;
        break;
      case "num":
        if (!value) newErrors.num = "Contact Number is required.";
        else if (!/^\d{10}$/.test(value)) newErrors.num = "Must be 10 digits.";
        else delete newErrors.num;
        break;
      case "email":
        if (!value) newErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors.email = "Enter a valid email.";
        else delete newErrors.email;
        break;
      case "certificate":
        if (!value.trim()) newErrors.certificate = "Certificate is required.";
        else if (value.trim().length < 8) newErrors.certificate = "Min 8 characters.";
        else delete newErrors.certificate;
        break;


        
      case "schedule":
        if (!value) newErrors.schedule = "Schedule is required.";
        else delete newErrors.schedule;
        break;
      case "status":
        if (!value) newErrors.status = "Status is required.";
        else delete newErrors.status;
        break;
      case "shiftStartDate":
        if (!value) newErrors.shiftStartDate = "Start Date is required.";
        else if (value.isBefore(now, "day")) newErrors.shiftStartDate = "Cannot select past date.";
        else delete newErrors.shiftStartDate;
        break;
      case "shiftStartTime":
        if (!value) newErrors.shiftStartTime = "Start Time is required.";
        else if (shiftStartDate.isSame(now, "day") && value.isBefore(now)) newErrors.shiftStartTime = "Cannot select past time.";
        else delete newErrors.shiftStartTime;
        break;
      case "shiftEndDate":
        if (!value) newErrors.shiftEndDate = "End Date is required.";
        else if (value.isBefore(shiftStartDate, "day")) newErrors.shiftEndDate = "End date cannot be before start date.";
        else delete newErrors.shiftEndDate;
        break;
      case "shiftEndTime":
        if (!value) newErrors.shiftEndTime = "End Time is required.";
        else if (shiftEndDate.isSame(shiftStartDate, "day") && value.isBefore(shiftStartTime)) newErrors.shiftEndTime = "End time cannot be before start time.";
        else delete newErrors.shiftEndTime;
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const validateForm = () => {
    const fields = [
      ["id", id],
      ["name", name],
      ["role", role],
      ["num", num],
      ["email", email],
      ["certificate", certificate],
      ["schedule", schedule],
      ["status", status],
      ["shiftStartDate", shiftStartDate],
      ["shiftStartTime", shiftStartTime],
      ["shiftEndDate", shiftEndDate],
      ["shiftEndTime", shiftEndTime],
    ];
    fields.forEach(([field, value]) => validateField(field, value));
    return Object.keys(errors).length === 0;
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
      shiftStartDate: shiftStartDate.format("YYYY-MM-DD"),
      shiftStartTime: shiftStartTime.format("HH:mm"),
      shiftEndDate: shiftEndDate.format("YYYY-MM-DD"),
      shiftEndTime: shiftEndTime.format("HH:mm"),
    };

    isEdit ? updateStaff(staffData) : addStaff(staffData);
    clearFormFields();
  };

  return (
    <Paper
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f9f9f9",
        color: theme.palette.text.primary,
      }}
      elevation={6}
    >
      <Typography variant="h5" sx={{ mb: 3, color: "#007acc", fontWeight: 600 }}>
        {isEdit ? "Update Staff" : "Add New Staff"}
      </Typography>

      <Grid container spacing={3}>
        {/* Employee ID */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Employee ID"
            variant="outlined"
            value={id || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setId(val);
              validateField("id", val);
            }}
            error={!!errors.id}
            helperText={errors.id}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
            disabled={isEdit}
          />
        </Grid>

        {/* Full Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            value={name || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^A-Za-z\s]/g, ""); // disallow punctuation
              setName(val);
              validateField("name", val);
            }}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Role */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Role"
            value={role || ""}
            onChange={(e) => {
              setRole(e.target.value);
              validateField("role", e.target.value);
            }}
            variant="outlined"
            error={!!errors.role}
            helperText={errors.role}
          >
            <MenuItem value=""><em>Select Role</em></MenuItem>
            {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
        </Grid>

        {/* Contact Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Number"
            variant="outlined"
            value={num || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) {
                setNum(val);
                validateField("num", val);
              }
            }}
            error={!!errors.num}
            helperText={errors.num}
            InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email || ""}
            onChange={(e) => {
              setEmail(e.target.value);
              validateField("email", e.target.value);
            }}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Certificate */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Certificate / License #"
            variant="outlined"
            value={certificate || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^A-Za-z0-9\s]/g, ""); // disallow punctuation
              setCertificate(val);
              validateField("certificate", val);
            }}
            error={!!errors.certificate}
            helperText={errors.certificate}
            InputProps={{ startAdornment: <InputAdornment position="start"><AssignmentIndIcon /></InputAdornment> }}
          />
        </Grid>

        {/* Schedule */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Schedule"
            value={schedule || ""}
            onChange={(e) => {
              setSchedule(e.target.value);
              validateField("schedule", e.target.value);
            }}
            variant="outlined"
            error={!!errors.schedule}
            helperText={errors.schedule}
          >
            <MenuItem value=""><em>Select Schedule</em></MenuItem>
            {schedules.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Status"
            value={status || ""}
            onChange={(e) => {
              setStatus(e.target.value);
              validateField("status", e.target.value);
            }}
            variant="outlined"
            error={!!errors.status}
            helperText={errors.status}
          >
            <MenuItem value=""><em>Select Status</em></MenuItem>
            {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>

        {/* Shift Start Date */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Shift Start Date"
              value={shiftStartDate || null}
              onChange={(newValue) => {
                setShiftStartDate(newValue);
                validateField("shiftStartDate", newValue);
              }}
              minDate={now}
              slotProps={{ textField: { fullWidth: true, variant: "outlined", error: !!errors.shiftStartDate, helperText: errors.shiftStartDate } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Shift Start Time */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Shift Start Time"
              value={shiftStartTime || null}
              onChange={(newValue) => {
                setShiftStartTime(newValue);
                validateField("shiftStartTime", newValue);
              }}
              minTime={shiftStartDate.isSame(now, "day") ? now : null}
              slotProps={{ textField: { fullWidth: true, variant: "outlined", error: !!errors.shiftStartTime, helperText: errors.shiftStartTime } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Shift End Date */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Shift End Date"
              value={shiftEndDate || null}
              onChange={(newValue) => {
                setShiftEndDate(newValue);
                validateField("shiftEndDate", newValue);
              }}
              minDate={shiftStartDate}
              slotProps={{ textField: { fullWidth: true, variant: "outlined", error: !!errors.shiftEndDate, helperText: errors.shiftEndDate } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Shift End Time */}
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Shift End Time"
              value={shiftEndTime || null}
              onChange={(newValue) => {
                setShiftEndTime(newValue);
                validateField("shiftEndTime", newValue);
              }}
              minTime={shiftStartDate.isSame(shiftEndDate, "day") ? shiftStartTime : null}
              slotProps={{ textField: { fullWidth: true, variant: "outlined", error: !!errors.shiftEndTime, helperText: errors.shiftEndTime } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#00c6e6", "&:hover": { backgroundColor: "#009bbf" } }}
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
