import {
  Button,
  Input,
  Typography,
  Avatar,
  InputAdornment,
  Stack,
  Box,
  FormControl,
  FormHelperText,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

const LoginForm = ({ onRegisterClick, profilePhoto, registeredUsers }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // ✅ Validate login form
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Clear errors when user types
  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (loginError) {
      setLoginError("");
    }
  };

  // ✅ Handle form submission with validation
  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    setLoginError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Check if user exists in registered users
        const userExists = registeredUsers?.find(
          (user) => user.email === email && user.password === password
        );

        if (userExists) {
          console.log("Login successful:", { email });
          // ✅ Navigate to main app page after successful login
          navigate("/");
        } else {
          setLoginError("Invalid email or password. Please try again.");
        }
      } catch (error) {
        setLoginError("Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  // ✅ Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
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
          sx={{ 
            width: 100, 
            height: 100, 
            bgcolor: "#00c6e6",
            boxShadow: "0 4px 15px rgba(0, 198, 230, 0.3)"
          }} 
          src={profilePhoto}
        >
          {!profilePhoto && <PersonIcon sx={{ fontSize: 50, color: "#000" }} />}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          Login
        </Typography>

        {loginError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {loginError}
          </Alert>
        )}

        <FormControl fullWidth error={!!errors.email}>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            onKeyPress={handleKeyPress}
            startAdornment={
              <InputAdornment position="start">
                <EmailIcon color={errors.email ? "error" : "action"} />
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.email ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth error={!!errors.password}>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            onKeyPress={handleKeyPress}
            startAdornment={
              <InputAdornment position="start">
                <LockIcon color={errors.password ? "error" : "action"} />
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.password ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
        </FormControl>

        <Button
          variant="contained"
          sx={{ 
            backgroundColor: "#00c6e6", 
            color: "#000", 
            width: 150, 
            mt: 2,
            borderRadius: 2,
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#00b4d0",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 15px rgba(0, 198, 230, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Login"}
        </Button>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Don't have an account?{" "}
          <Button
            variant="text"
            sx={{ 
              color: "#00c6e6", 
              fontWeight: "bold",
              "&:hover": { 
                backgroundColor: "rgba(0, 198, 230, 0.1)",
                transform: "scale(1.05)"
              }
            }}
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