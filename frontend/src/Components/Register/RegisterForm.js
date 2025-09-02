// Src/components/RegisterForm.js
import {
  Button,
  Input,
  Typography,
  Avatar,
  InputAdornment,
  Stack,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import UploadIcon from "@mui/icons-material/Upload";

const RegisterForm = ({ addRegister, updateRegister, submitted, data, isEdit, onLoginClick }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  //Reset form when submission is complete
  useEffect(() => {
    if (!submitted) {
      setId("");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setProfilePhoto(null);
      setPreview(null);
    }
  }, [submitted]);

  //Load existing data into form if editing
  useEffect(() => {
    if (data && data.id) {
      setId(data.id);
      setName(data.name || "");
      setEmail(data.email || "");
      setPassword(data.password || "");
      setPhone(data.phone || "");
      setPreview(data.profilePhoto || null);
      setProfilePhoto(data.profilePhoto || null);
    }
  }, [data]);

  // Handle image upload
  //Converts uploaded file into Base64 string for preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const formData = {
      id,
      name,
      email,
      password,
      phone,
      profilePhoto: preview,
    };

    if (isEdit) updateRegister(formData);
    else addRegister(formData);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: 2,
        boxShadow: 2,
        maxWidth: 500,
        margin: "auto",
      }}
    >
      <Stack spacing={2} alignItems="center">
        {/* Profile Photo */}
        {preview ? (
          <Avatar src={preview} alt="Profile Preview" sx={{ width: 120, height: 120 }} />
        ) : (
          <Avatar sx={{ width: 120, height: 120, bgcolor: "#ccc" }} />
        )}

        {/* Upload Button */}
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadIcon />}
        >
          Upload Photo
          <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
        </Button>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          {isEdit ? "Update User" : "Register User"}
        </Typography>

        {/* Inputs */}
        <Input
          type="number"
          placeholder="User ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          startAdornment={<InputAdornment position="start"><BadgeIcon /></InputAdornment>}
          fullWidth
        />
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          startAdornment={<InputAdornment position="start"><PersonIcon /></InputAdornment>}
          fullWidth
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startAdornment={<InputAdornment position="start"><EmailIcon /></InputAdornment>}
          fullWidth
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          startAdornment={<InputAdornment position="start"><LockIcon /></InputAdornment>}
          fullWidth
        />
        <Input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          startAdornment={<InputAdornment position="start"><PhoneIcon /></InputAdornment>}
          fullWidth
        />

        {/* Submit Button */}
        <Button
          variant="contained"
          sx={{ backgroundColor: "#00c6e6", color: "#000", width: 150, mt: 2 }}
          onClick={handleSubmit}
        >
          {isEdit ? "Update" : "Add"}
        </Button>

        {/* Login link */}
        <Typography variant="body2" sx={{ mt: 1 }}>
          Already have an account?{" "}
          <Button
            variant="text"
            sx={{ color: "#00c6e6", fontWeight: "bold" }}
            onClick={onLoginClick}
          >
            Login
          </Button>
        </Typography>
      </Stack>
    </Box>
  );
};

export default RegisterForm;
