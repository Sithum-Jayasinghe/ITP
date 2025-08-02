import { Button, Grid, Input, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const StaffForm = ({ addStaff, updateStaff, submitted, data, isEdit }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [num, setNum] = useState('');
  const [email, setEmail] = useState('');
  const [certificate, setCertificate] = useState('');
  const [schedule, setSchedule] = useState('');
  const [status, setStatus] = useState('');

  // Reset form after submission
  useEffect(() => {
    if (!submitted) {
      resetForm();
    }
  }, [submitted]);

  // Fill form when editing
  useEffect(() => {
    if (data && data.id && data.id !== 0) {
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

  const resetForm = () => {
    setId('');
    setName('');
    setRole('');
    setNum('');
    setEmail('');
    setCertificate('');
    setSchedule('');
    setStatus('');
  };

  const handleSubmit = () => {
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
  };

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#fff', marginBottom: '30px', display: 'block' }}>
      <Grid item xs={12}>
        <Typography component={'h1'} sx={{ color: '#000' }}>
          Staff Form 
        </Typography>
      </Grid>

      {/* Employee ID */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="id" sx={labelStyle}>
          Employee ID 
        </Typography>
        <Input type="number" id="id" sx={inputStyle} value={id} onChange={(e) => setId(e.target.value)} />
      </Grid>

      {/* Full Name */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="name" sx={labelStyle}>
          Full Name
        </Typography>
        <Input type="text" id="name" sx={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
      </Grid>

      {/* Role */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="role" sx={labelStyle}>
          Role
        </Typography>
        <Input type="text" id="role" sx={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} />
      </Grid>

      {/* Contact Number */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="num" sx={labelStyle}>
          Contact Number
        </Typography>
        <Input type="number" id="num" sx={inputStyle} value={num} onChange={(e) => setNum(e.target.value)} />
      </Grid>

      {/* Email */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="email" sx={labelStyle}>
          Email
        </Typography>
        <Input type="text" id="email" sx={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
      </Grid>

      {/* Certificate/License */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="certificate" sx={labelStyle}>
          Certification / License #
        </Typography>
        <Input
          type="text"
          id="certificate"
          sx={inputStyle}
          value={certificate}
          onChange={(e) => setCertificate(e.target.value)}
        />
      </Grid>

      {/* Schedule */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="schedule" sx={labelStyle}>
          Schedule
        </Typography>
        <Input type="text" id="schedule" sx={inputStyle} value={schedule} onChange={(e) => setSchedule(e.target.value)} />
      </Grid>

      {/* Employment Status */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography component={'label'} htmlFor="status" sx={labelStyle}>
          Employment Status
        </Typography>
        <Input type="text" id="status" sx={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)} />
      </Grid>

      {/* Submit Button */}
      <Button
        sx={{
          margin: 'auto',
          marginBottom: '20px',
          backgroundColor: '#00c6e6',
          color: '#000',
          marginLeft: '15px',
          marginTop: '20px',
          '&:hover': { opacity: 0.7 },
        }}
        onClick={handleSubmit}
      >
        {isEdit ? 'Update' : 'Add'}
      </Button>
    </Grid>
  );
};

const labelStyle = {
  color: '#000',
  marginRight: '20px',
  fontSize: '16px',
  width: '200px',
  display: 'block',
};

const inputStyle = { width: '400px' };

export default StaffForm;
