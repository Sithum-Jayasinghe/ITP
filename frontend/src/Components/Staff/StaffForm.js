import { useState, useEffect } from "react";
import { Grid, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem, Paper, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const roles = ["Manager", "Cashier", "Cleaner", "Technician"];
const schedules = ["Morning", "Evening", "Night"];
const statuses = ["Active", "Inactive", "On Leave"];

const StaffForm = ({ addStaff, updateStaff, submitted, data, isEdit }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [num, setNum] = useState('');
  const [email, setEmail] = useState('');
  const [certificate, setCertificate] = useState('');
  const [schedule, setSchedule] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { 
    if (!submitted) clearFormFields(); 
  }, [submitted]);

  useEffect(() => {
    if (data && data.id) {
      setId(data.id || '');
      setName(data.name || '');
      setRole(data.role || '');
      setNum(data.num || '');
      setEmail(data.email || '');
      setCertificate(data.certificate || '');
      setSchedule(data.schedule || '');
      setStatus(data.status || '');
    }
  }, [data]);

  const clearFormFields = () => {
    setId(''); setName(''); setRole(''); setNum('');
    setEmail(''); setCertificate(''); setSchedule(''); setStatus('');
  };

  const handleSubmit = () => {
    const staffData = { id, name, role, num, email, certificate, schedule, status };
    isEdit ? updateStaff(staffData) : addStaff(staffData);
  };

  return (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3, backgroundColor: '#f9f9f9' }} elevation={6}>
      <Typography variant="h5" sx={{ mb: 3, color: '#007acc', fontWeight: 600 }}>
        {isEdit ? 'Update Staff' : 'Add New Staff'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Employee ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            InputProps={{ startAdornment: <BadgeIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Contact Number"
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Certificate / License #"
            value={certificate}
            onChange={(e) => setCertificate(e.target.value)}
            InputProps={{ startAdornment: <AssignmentIndIcon sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Schedule</InputLabel>
            <Select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
              {schedules.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#00c6e6', '&:hover': { backgroundColor: '#009bbf' } }}
              onClick={handleSubmit}
            >
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StaffForm;
