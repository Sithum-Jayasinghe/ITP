import {
  Button,
  Input,
  Typography,
  Avatar,
  InputAdornment,
  Stack,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import UploadIcon from "@mui/icons-material/Upload";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const RegisterForm = ({ addRegister, updateRegister, submitted, data, isEdit, onLoginClick, existingUsers = [] }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Reset form when submission is complete
  useEffect(() => {
    if (!submitted) {
      setId("");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setProfilePhoto(null);
      setPreview(null);
      setErrors({});
    }
  }, [submitted]);

  // Load existing data into form if editing
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

  // ✅ Enhanced validation rules
  const validateForm = () => {
    const newErrors = {};

    // ID validation
    if (!id.trim()) {
      newErrors.id = "User NIC is required";
    }
    // Check for minus numbers
    else if (id.startsWith("-")) {
      newErrors.id = "NIC cannot contain negative numbers";
    }
    // Check old NIC (9 digits + V/X) or new NIC (12 digits)
    else if (!/^(\d{9}[vVxX]|\d{12})$/.test(id)) {
      newErrors.id = "NIC must be 9 digits followed by V/X or 12 digits";
    }
    // Duplicate check (except when editing the same user)
    else if (existingUsers.some(user => user.id === id && (!isEdit || user.id !== data.id))) {
      newErrors.id = "This NIC is already registered";
    }

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (existingUsers.some(user => user.email === email && (!isEdit || user.email !== data.email))) {
      newErrors.email = "This email is already registered";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    // Check for minus numbers
    else if (phone.startsWith("-")) {
      newErrors.phone = "Phone number cannot be negative";
    }
    // Allow only 10 digits, must start with 0
    else if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits and start with 0";
    }
    // Duplicate check (except when editing the same user)
    else if (existingUsers.some(user => user.phone === phone && (!isEdit || user.phone !== data.phone))) {
      newErrors.phone = "This phone number is already registered";
    }

    // Profile photo validation (optional but recommended)
    if (!preview && !isEdit) {
      newErrors.profilePhoto = "Profile photo is recommended";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Show snackbar message
  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // ✅ Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showMessage("Please select a valid image file", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Image size should be less than 5MB", "error");
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear profile photo error if any
      if (errors.profilePhoto) {
        setErrors({ ...errors, profilePhoto: "" });
      }
    }
  };

  // ✅ Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ✅ Clear errors when user starts typing
  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showMessage("Please fix the errors above", "error");
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const formData = {
        id,
        name,
        email,
        password,
        phone,
        profilePhoto: preview,
      };

      try {
        if (isEdit) {
          updateRegister(formData);
          showMessage("✅ User updated successfully!", "success");
        } else {
          addRegister(formData);
          showMessage("🎉 Registration successful! Welcome aboard!", "success");
        }
      } catch (error) {
        showMessage("❌ Registration failed. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  // ✅ Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // ✅ Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // ✅ Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, color: "grey", text: "" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;

    let color = "error";
    let text = "Weak";
    if (strength >= 75) {
      color = "success";
      text = "Strong";
    } else if (strength >= 50) {
      color = "warning";
      text = "Medium";
    }

    return { strength, color, text };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 4,
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        maxWidth: 500,
        margin: "auto",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <Stack spacing={3} alignItems="center">
        {/* Profile Photo Section */}
        <Box sx={{ textAlign: "center" }}>
          {preview ? (
            <Avatar
              src={preview}
              alt="Profile Preview"
              sx={{
                width: 120,
                height: 120,
                boxShadow: "0 4px 20px rgba(0, 198, 230, 0.3)"
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: "#ccc",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
              }}
            >
              <PersonIcon sx={{ fontSize: 50 }} />
            </Avatar>
          )}

          {/* Upload Button */}
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadIcon />}
            sx={{
              mt: 2,
              borderRadius: 2,
              borderColor: errors.profilePhoto ? "error.main" : "primary.main"
            }}
          >
            Upload Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>

          {errors.profilePhoto && (
            <FormHelperText error sx={{ mt: 1 }}>
              {errors.profilePhoto}
            </FormHelperText>
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #1976d2, #00c6e6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {isEdit ? "Update Profile" : "Create Account"}
        </Typography>

        {/* Form Inputs */}
        <FormControl fullWidth error={!!errors.id}>
          <Input
            type="number"
            placeholder="User NIC"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              clearError("id");
            }}
            onKeyPress={handleKeyPress}
            startAdornment={
              <InputAdornment position="start">
                <BadgeIcon color={errors.id ? "error" : "action"} />
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.id ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.id && <FormHelperText>{errors.id}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth error={!!errors.name}>
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            onKeyPress={handleKeyPress}
            startAdornment={
              <InputAdornment position="start">
                <PersonIcon color={errors.name ? "error" : "action"} />
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.name ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>

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
            type={showPassword ? "text" : "password"}
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
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.password ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.password && <FormHelperText>{errors.password}</FormHelperText>}

          {/* Password Strength Indicator */}
          {password && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 4,
                    backgroundColor: "grey.300",
                    borderRadius: 2,
                    overflow: "hidden"
                  }}
                >
                  <Box
                    sx={{
                      width: `${passwordStrength.strength}%`,
                      height: "100%",
                      backgroundColor: `${passwordStrength.color}.main`,
                      transition: "all 0.3s ease"
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color={`${passwordStrength.color}.main`}
                  fontWeight="bold"
                >
                  {passwordStrength.text}
                </Typography>
              </Box>
            </Box>
          )}
        </FormControl>

        <FormControl fullWidth error={!!errors.phone}>
          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError("phone");
            }}
            onKeyPress={handleKeyPress}
            startAdornment={
              <InputAdornment position="start">
                <PhoneIcon color={errors.phone ? "error" : "action"} />
              </InputAdornment>
            }
            fullWidth
            sx={{
              "&:before": { borderBottom: errors.phone ? "2px solid #f44336" : "" },
              "&:after": { borderBottom: "2px solid #00c6e6" },
            }}
          />
          {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
        </FormControl>

        {/* Submit Button */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#00c6e6",
            color: "#000",
            width: "100%",
            py: 1.5,
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "1.1rem",
            boxShadow: "0 4px 15px rgba(0, 198, 230, 0.3)",
            "&:hover": {
              backgroundColor: "#00b4d0",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(0, 198, 230, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#000" }} />
          ) : (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} />
              {isEdit ? "Update Profile" : "Create Account"}
            </>
          )}
        </Button>

        {/* Login link */}
        <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
          {isEdit ? "Want to change account? " : "Already have an account? "}
          <Button
            variant="text"
            sx={{
              color: "#00c6e6",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 198, 230, 0.1)",
                transform: "scale(1.05)"
              }
            }}
            onClick={onLoginClick}
          >
            {isEdit ? "Switch Account" : "Login Here"}
          </Button>
        </Typography>
      </Stack>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "success" ? 4000 : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: "bold",
            alignItems: "center",
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterForm;