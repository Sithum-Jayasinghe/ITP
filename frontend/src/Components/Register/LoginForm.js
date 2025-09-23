import {
  Button,
  Input,
  Typography,
  Avatar,
  InputAdornment,
  Stack,
  Box,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

const LoginForm = ({ onRegisterClick, profilePhoto }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Dummy credentials for testing
  const validEmail = "admin@gmail.com";
  const validPassword = "123456";

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "Email and Password are required.";
    }
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    return "";
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check against dummy credentials
    if (email === validEmail && password === validPassword) {
      setError("");
      console.log("Login successful!");
      navigate("/"); // redirect to home
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: 2,
        boxShadow: 2,
        maxWidth: 400,
        margin: "auto",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Avatar
          sx={{ width: 100, height: 100, bgcolor: "#00c6e6" }}
          src={profilePhoto}
        >
          {!profilePhoto && <PersonIcon sx={{ fontSize: 50, color: "#000" }} />}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          Login
        </Typography>

        {/* Error message */}
        {error && <Alert severity="error">{error}</Alert>}

        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <EmailIcon />
            </InputAdornment>
          }
          fullWidth
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          }
          fullWidth
        />

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#00c6e6",
            color: "#000",
            width: 150,
            mt: 2,
          }}
          onClick={handleSubmit}
        >
          Login
        </Button>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Don’t have an account?{" "}
          <Button
            variant="text"
            sx={{ color: "#00c6e6", fontWeight: "bold" }}
            onClick={onRegisterClick}
          >
            Register
          </Button>
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoginForm;
