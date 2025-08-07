import { Button, Grid, Input, Typography, Avatar } from '@mui/material';
import { useEffect, useState } from 'react';

const RegisterForm = ({ addRegister, updateRegister, submitted, data, isEdit }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null); // stores file or base64
  const [preview, setPreview] = useState(null); // for image preview display

  useEffect(() => {
    if (!submitted) {
      setId('');
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setProfilePhoto(null);
      setPreview(null);
    }
  }, [submitted]);

  useEffect(() => {
    if (data && data.id && data.id !== 0) {
      setId(data.id);
      setName(data.name);
      setEmail(data.email || '');
      setPassword(data.password || '');
      setPhone(data.phone || '');
      setPreview(data.profilePhoto || null); // existing photo URL/base64
      setProfilePhoto(data.profilePhoto || null);
    }
  }, [data]);

  // Handle image upload and set preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);

      // Create preview (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // When submit, send data including photo as base64 preview string
  const handleSubmit = () => {
    const formData = {
      id,
      name,
      email,
      password,
      phone,
      profilePhoto: preview, // You can send file or base64 depending on backend
    };

    if (isEdit) updateRegister(formData);
    else addRegister(formData);
  };

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#fff', marginBottom: '30px', padding: 2 }}>
      {/* Profile Photo Preview */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
        {preview ? (
          <Avatar src={preview} alt="Profile Preview" sx={{ width: 120, height: 120 }} />
        ) : (
          <Avatar sx={{ width: 120, height: 120, bgcolor: '#ccc' }} />
        )}
      </Grid>

      {/* Profile Photo Upload */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </Grid>

      {/* Form Title */}
      <Grid item xs={12}>
        <Typography component={'h1'} sx={{ color: '#000', textAlign: 'center' }}>
          Register Form dwd
        </Typography>
      </Grid>

      {/* ID */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography
          component={'label'}
          htmlFor="id"
          sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '100px', display: 'block' }}
        >
          ID
        </Typography>
        <Input
          type="number"
          id="id"
          name="id"
          sx={{ width: '400px' }}
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
      </Grid>

      {/* Name */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography
          component={'label'}
          htmlFor="name"
          sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '100px', display: 'block' }}
        >
          Name
        </Typography>
        <Input
          type="text"
          id="name"
          name="name"
          sx={{ width: '400px' }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography
          component={'label'}
          htmlFor="email"
          sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '100px', display: 'block' }}
        >
          Email
        </Typography>
        <Input
          type="email"
          id="email"
          name="email"
          sx={{ width: '400px' }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Grid>

      {/* Password */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography
          component={'label'}
          htmlFor="password"
          sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '100px', display: 'block' }}
        >
          Password
        </Typography>
        <Input
          type="password"
          id="password"
          name="password"
          sx={{ width: '400px' }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Grid>

      {/* Phone */}
      <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
        <Typography
          component={'label'}
          htmlFor="phone"
          sx={{ color: '#000', marginRight: '20px', fontSize: '16px', width: '100px', display: 'block' }}
        >
          Phone
        </Typography>
        <Input
          type="tel"
          id="phone"
          name="phone"
          sx={{ width: '400px' }}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12} sx={{ textAlign: 'center', marginTop: 2 }}>
        <Button
          sx={{
            backgroundColor: '#00c6e6',
            color: '#000',
            '&:hover': { opacity: 0.7 },
            width: '150px',
          }}
          onClick={handleSubmit}
        >
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </Grid>
    </Grid>
  );
};

export default RegisterForm;
