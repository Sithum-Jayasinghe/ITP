import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/register", form);
      if (res.data.status === "ok") {
        alert("Registration successful! Redirecting to login...");
        navigate("/login");
      } else {
        alert(res.data.error || "Registration failed.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  return (
    <Box sx={{ width: 350, mx: "auto", mt: 10 }}>
      <Typography variant="h5" gutterBottom>Register</Typography>
      
      <TextField name="username" label="Username" fullWidth margin="normal" onChange={handleChange} />
      <TextField name="email" label="Email" type="email" fullWidth margin="normal" onChange={handleChange} />
      <TextField name="password" label="Password" type="password" fullWidth margin="normal" onChange={handleChange} />
      
      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleRegister}>Register</Button>

      {/* Extra message */}
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Link href="/login" underline="hover">Login here</Link>
      </Typography>
    </Box>
  );
};

export default Register;
