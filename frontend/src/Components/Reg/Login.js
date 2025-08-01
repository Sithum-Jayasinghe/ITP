import { Box, Button, TextField, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", form);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        navigate("/"); // 👈 Redirect after login
      } else {
        alert(res.data.error || "Login failed.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  return (
    <Box sx={{ width: 350, mx: "auto", mt: 10 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      
      <TextField
        name="email"
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        onChange={handleChange}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        onChange={handleChange}
      />
      
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>

      {/* 👇 Register redirect message */}
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account?{" "}
        <Link href="/register" underline="hover">Register here</Link>
      </Typography>
    </Box>
  );
};

export default Login;
