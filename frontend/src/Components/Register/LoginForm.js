import {
  Button,
  Input,
  Typography,
  Avatar,
  InputAdornment,
  Stack,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import Navigate
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

const LoginForm = ({ onRegisterClick, profilePhoto }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigate

  const handleSubmit = () => {
    // Here you would normally check credentials with backend
    // For now, we just navigate to /home
    console.log("Login info:", { email, password });

    // ✅ Navigate to main app page after login
    navigate("/");
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
        <Avatar sx={{ width: 100, height: 100, bgcolor: "#00c6e6" }} src={profilePhoto}>
          {!profilePhoto && <PersonIcon sx={{ fontSize: 50, color: "#000" }} />}
        </Avatar>

        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
          Login
        </Typography>

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

        <Button
          variant="contained"
          sx={{ backgroundColor: "#00c6e6", color: "#000", width: 150, mt: 2 }}
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
