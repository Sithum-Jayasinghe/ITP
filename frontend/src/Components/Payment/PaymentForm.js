import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  Box,
  CircularProgress,
  useTheme,
  Fade,
  Grow,
  Snackbar,
  IconButton,
  Paper,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton
} from "@mui/material";
import {
  ConfirmationNumber,
  Person,
  EventSeat,
  AttachMoney,
  CreditCard,
  Phone,
  ScheduleSend,
  CreditCardOff,
  Close,
  Restaurant,
  Work,
  Flight,
  Payment,
  CheckCircle,
  LocalAtm,
  AccountBalance,
  QrCode2,
  Add,
  Remove
} from "@mui/icons-material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

// Modern OTP Input Component
const OtpInput = ({ length = 6, value, onChange, disabled }) => {
  const inputsRef = useRef([]);
  const [otpArr, setOtpArr] = useState(Array(length).fill(""));

  useEffect(() => {
    if (value.length === length) {
      setOtpArr(value.split(""));
    } else if (value === "") {
      setOtpArr(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (e, i) => {
    if (disabled) return;
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otpArr];
      newOtp[i] = val;
      setOtpArr(newOtp);
      onChange(newOtp.join(""));

      if (val && i < length - 1) {
        inputsRef.current[i + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      if (otpArr[i] === "") {
        if (i > 0) inputsRef.current[i - 1].focus();
      } else {
        const newOtp = [...otpArr];
        newOtp[i] = "";
        setOtpArr(newOtp);
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    const pasteData = e.clipboardData.getData("Text").trim().slice(0, length);
    if (/^\d+$/.test(pasteData)) {
      const pasteArr = pasteData.split("");
      const newOtp = [...otpArr];
      for (let i = 0; i < length; i++) {
        newOtp[i] = pasteArr[i] || "";
      }
      setOtpArr(newOtp);
      onChange(newOtp.join(""));
      if (pasteArr.length < length) {
        inputsRef.current[pasteArr.length].focus();
      } else {
        inputsRef.current[length - 1].focus();
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
        mt: 1,
      }}
      onPaste={handlePaste}
    >
      {otpArr.map((digit, i) => (
        <TextField
          key={i}
          inputRef={(el) => (inputsRef.current[i] = el)}
          value={digit}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          inputProps={{
            maxLength: 1,
            style: { textAlign: "center", fontSize: "1.5rem", width: "3rem" },
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
          disabled={disabled}
          type="tel"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        />
      ))}
    </Box>
  );
};

// Flight Info Card Component
const FlightInfoCard = ({ flight, flightData }) => {
  const selectedFlight = flightData.find(f => f.code === flight);

  if (!selectedFlight) return null;

  return (
    <Card sx={{
      mb: 3,
      background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
      color: "white",
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Flight sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="600">
            {selectedFlight.airline} - {selectedFlight.code}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Departure: {selectedFlight.departure}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Arrival: {selectedFlight.arrival}
            </Typography>
          </Box>
          <Chip
            label={`LKR ${selectedFlight.price.toLocaleString()}`}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Meal Selection Component
const MealSelection = ({ selectedMeals, setSelectedMeals, mealsOptions }) => {
  const handleMealToggle = (mealId) => {
    if (selectedMeals.includes(mealId)) {
      setSelectedMeals(selectedMeals.filter(id => id !== mealId));
    } else {
      setSelectedMeals([...selectedMeals, mealId]);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Select Meals
      </Typography>
      <Paper elevation={1} sx={{ p: 2, borderRadius: '12px' }}>
        <List>
          {mealsOptions.map((meal) => (
            <ListItem key={meal.id} divider>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedMeals.includes(meal.id)}
                    onChange={() => handleMealToggle(meal.id)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {meal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.description}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="600">
                      LKR {meal.price.toLocaleString()}
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', ml: 0 }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

// Baggage Selection Component
const BaggageSelection = ({ baggagePrice, setBaggagePrice, baggageOptions }) => {
  const handleBaggageChange = (event) => {
    setBaggagePrice(parseInt(event.target.value));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Select Baggage Option
      </Typography>
      <Paper elevation={1} sx={{ p: 2, borderRadius: '12px' }}>
        <FormControl fullWidth>
          <InputLabel id="baggage-label">Baggage</InputLabel>
          <Select
            labelId="baggage-label"
            value={baggagePrice}
            onChange={handleBaggageChange}
            label="Baggage"
            sx={{ borderRadius: '12px' }}
          >
            {baggageOptions.map((option) => (
              <MenuItem key={option.id} value={option.price}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="body1" fontWeight="600">
                    LKR {option.price.toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
};

// Price Summary Component
const PriceSummary = ({ flightPrice, selectedMeals, mealsOptions, baggagePrice }) => {
  const mealsPrice = selectedMeals.reduce((total, mealId) => {
    const meal = mealsOptions.find(m => m.id === mealId);
    return total + (meal ? meal.price : 0);
  }, 0);

  const totalPrice = flightPrice + mealsPrice + baggagePrice;

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={3}>
        <Paper elevation={0} sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
        }}>
          <Flight color="primary" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2" fontWeight="500" color="text.secondary">
            Flight Price
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary">
            LKR {flightPrice.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Paper elevation={0} sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
        }}>
          <Restaurant color="primary" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2" fontWeight="500" color="text.secondary">
            Meals Price
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary">
            LKR {mealsPrice.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Paper elevation={0} sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
        }}>
          <Work color="primary" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2" fontWeight="500" color="text.secondary">
            Baggage Price
          </Typography>
          <Typography variant="h6" fontWeight="700" color="primary">
            LKR {baggagePrice.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Paper elevation={0} sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
        }}>
          <AttachMoney sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2" fontWeight="500">
            Total Price
          </Typography>
          <Typography variant="h6" fontWeight="800">
            LKR {totalPrice.toLocaleString()}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Modern Payment Method Selector Component
const PaymentMethodSelector = ({ method, setMethod, processing }) => {
  const paymentMethods = [
    { value: "Credit Card", icon: <CreditCard />, label: "Credit Card" },
    { value: "Debit Card", icon: <CreditCard />, label: "Debit Card" },
    { value: "PayPal", icon: <AccountBalance />, label: "PayPal" },
    { value: "Bank Transfer", icon: <AccountBalance />, label: "Bank Transfer" },
    { value: "QR Payment", icon: <QrCode2 />, label: "QR Code" },
  ];

  const handleMethodChange = (event, newMethod) => {
    if (newMethod !== null && !processing) {
      setMethod(newMethod);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Select Payment Method
      </Typography>

      <ToggleButtonGroup
        value={method}
        exclusive
        onChange={handleMethodChange}
        aria-label="payment method"
        sx={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center'
        }}
      >
        {paymentMethods.map((pm) => (
          <ToggleButton
            key={pm.value}
            value={pm.value}
            disabled={processing}
            sx={{
              flex: '1 1 150px',
              minWidth: '150px',
              height: '100px',
              borderRadius: '12px !important',
              border: '2px solid',
              borderColor: method === pm.value ? 'primary.main' : 'grey.300',
              backgroundColor: method === pm.value ? 'primary.light' : 'white',
              color: method === pm.value ? 'primary.contrastText' : 'text.primary',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              padding: 2,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: method === pm.value ? 'primary.main' : 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }}
          >
            {React.cloneElement(pm.icon, {
              sx: { fontSize: 32 }
            })}
            <Typography variant="body2" fontWeight="500">
              {pm.label}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

const PaymentForm = ({ addPayment, updatePayment, submitted, data, isEdit }) => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const flightData = useMemo(
    () => [
      {
        code: "AK123",
        price: 35000,
        available: true,
        airline: "AirAsia",
        departure: "CMB (12:30 PM)",
        arrival: "KUL (07:30 PM)"
      },
      {
        code: "UL456",
        price: 42000,
        available: true,
        airline: "SriLankan Airlines",
        departure: "CMB (02:15 PM)",
        arrival: "DXB (07:45 PM)"
      },
      {
        code: "QR789",
        price: 56000,
        available: false,
        airline: "Qatar Airways",
        departure: "CMB (10:20 AM)",
        arrival: "DOH (02:40 PM)"
      },
      {
        code: "EK202",
        price: 48000,
        available: true,
        airline: "Emirates",
        departure: "CMB (11:45 PM)",
        arrival: "DXB (04:15 AM)"
      },
      {
        code: "MH505",
        price: 39000,
        available: true,
        airline: "Malaysia Airlines",
        departure: "CMB (08:30 AM)",
        arrival: "KUL (03:45 PM)"
      },
      {
        code: "SG303",
        price: 36000,
        available: true,
        airline: "Singapore Airlines",
        departure: "CMB (09:50 AM)",
        arrival: "SIN (02:15 PM)"
      },
      {
        code: "LH404",
        price: 62000,
        available: true,
        airline: "Lufthansa",
        departure: "CMB (01:20 PM)",
        arrival: "FRA (08:50 PM)"
      },
      {
        code: "BA007",
        price: 58000,
        available: false,
        airline: "British Airways",
        departure: "CMB (03:10 PM)",
        arrival: "LHR (09:30 PM)"
      },
      {
        code: "AI101",
        price: 47000,
        available: true,
        airline: "Air India",
        departure: "CMB (06:00 AM)",
        arrival: "DEL (11:15 AM)"
      },
      {
        code: "CX888",
        price: 75000,
        available: true,
        airline: "Cathay Pacific",
        departure: "CMB (11:00 PM)",
        arrival: "HKG (06:40 AM)"
      },
      {
        code: "TK303",
        price: 54000,
        available: true,
        airline: "Turkish Airlines",
        departure: "CMB (05:45 AM)",
        arrival: "IST (12:30 PM)"
      },
      {
        code: "JL202",
        price: 82000,
        available: true,
        airline: "Japan Airlines",
        departure: "CMB (10:15 AM)",
        arrival: "NRT (08:00 PM)"
      },
    ],
    []
  );

  // Meal options
  const mealsOptions = useMemo(
    () => [
      { id: 1, name: "Vegetarian Meal", description: "Fresh vegetables and pasta", price: 1500 },
      { id: 2, name: "Non-Vegetarian Meal", description: "Chicken or fish options", price: 2000 },
      { id: 3, name: "Special Diet Meal", description: "Gluten-free or vegan options", price: 1800 },
      { id: 4, name: "Child Meal", description: "Kid-friendly options", price: 1200 },
      { id: 5, name: "Premium Meal", description: "Gourmet dining experience", price: 3500 },
      { id: 6, name: "Snack Pack", description: "Light snacks and beverages", price: 800 },
    ],
    []
  );

  // Baggage options
  const baggageOptions = useMemo(
    () => [
      { id: 1, name: "No Baggage", price: 0 },
      { id: 2, name: "Standard (15kg)", price: 750 },
      { id: 3, name: "Extra (20kg)", price: 1200 },
      { id: 4, name: "Heavy (25kg)", price: 1800 },
      { id: 5, name: "Premium (30kg)", price: 2500 },
    ],
    []
  );

  // Form fields
  const [id, setId] = useState("");
  const [flight, setFlight] = useState("");
  const [passenger, setPassenger] = useState("");
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [seat, setSeat] = useState("");
  const [price, setPrice] = useState(0);
  const [method, setMethod] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [cvv, setCvv] = useState("");

  // Additional price states
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [baggagePrice, setBaggagePrice] = useState(2500);

  // OTP states
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  // Validation & status
  const [flightError, setFlightError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (data) {
      setId(data.id || "");
      setFlight(data.flight || "");
      setPassenger(data.passenger || "");
      setStatus(data.status || "");
      setPhone(data.phone || "");
      setSeat(data.seat || "");
      setPrice(data.price || 0);
      setMethod(data.method || "");
      setCard(data.card || "");
      setExpiry(data.expiry ? dayjs(`01/${data.expiry}`) : null);
      setCvv(data.cvv || "");
      setSelectedMeals(data.selectedMeals || []);
      setBaggagePrice(data.baggagePrice || 750);
    }
  }, [data]);

  useEffect(() => {
    if (submitted) {
      resetForm();
    }
  }, [submitted]);

  const resetForm = () => {
    setId("");
    setFlight("");
    setPassenger("");
    setStatus("");
    setPhone("");
    setSeat("");
    setPrice(0);
    setMethod("");
    setCard("");
    setExpiry(null);
    setCvv("");
    setSelectedMeals([]);
    setBaggagePrice(750);
    setFlightError("");
    setFormErrors({});
    setPaymentResult(null);
    setOtp("");
    setGeneratedOtp("");
    setShowOtpDialog(false);
    setProcessing(false);
    setPaymentData(null);
    setActiveStep(0);
  };

  const handleFlightChange = (e) => {
    const selectedFlightCode = e.target.value;
    setFlight(selectedFlightCode);
    setSeat("");
    const selectedFlight = flightData.find((f) => f.code === selectedFlightCode);
    if (selectedFlight) {
      if (selectedFlight.available) {
        setPrice(selectedFlight.price);
        setFlightError("");
        setActiveStep(1);
      } else {
        setFlightError("This flight is not available for booking");
        setPrice(0);
      }
    }
  };

  // Calculate meals price
  const calculateMealsPrice = () => {
    return selectedMeals.reduce((total, mealId) => {
      const meal = mealsOptions.find(m => m.id === mealId);
      return total + (meal ? meal.price : 0);
    }, 0);
  };

  // Validators
  const validateCardNumber = (number) => /^[0-9]{16}$/.test(number.replace(/\s+/g, ""));
  const validateExpiry = (date) => date && dayjs(date).isAfter(dayjs());
  const validateCvv = (cvv) => /^[0-9]{3}$/.test(cvv);
  const validatePhone = (phone) => /^(\+?\d{10,15})$/.test(phone);
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const sendOtp = (phoneNumber, otp) => {
    console.log(`Simulated OTP sent: ${otp} to phone: ${phoneNumber}`);

    setToast({
      phoneNumber,
      otp,
      open: true
    });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!id) errors.id = "Payment ID is required.";
    if (!flight) errors.flight = "Please select a flight.";
    if (flightError) errors.flight = flightError;
    if (!passenger) {
      errors.passenger = "Passenger name is required.";
    } else if (!validateName(passenger)) {
      errors.passenger = "Name can only contain letters and spaces";
    }
    if (!seat) errors.seat = "Seat number is required.";
    if (!price) errors.price = "Price is missing.";
    if (!method) errors.method = "Select a payment method.";
    if ((method === "Credit Card" || method === "Debit Card") && !validateCardNumber(card))
      errors.card = "Card number must be 16 digits.";
    if ((method === "Credit Card" || method === "Debit Card") && !validateExpiry(expiry))
      errors.expiry = "Expiry date must be in the future.";
    if ((method === "Credit Card" || method === "Debit Card") && !validateCvv(cvv))
      errors.cvv = "CVV must be 3 digits.";
    if (!validatePhone(phone)) errors.phone = "Invalid phone number format.";
    if (!status) errors.status = "Select payment status.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setPaymentResult(null);
    if (!validateForm()) return;

    const mealsPrice = calculateMealsPrice();
    const totalAmount = price + mealsPrice + baggagePrice;

    const payment = {
      id,
      flight,
      passenger,
      status,
      phone,
      seat,
      price: totalAmount,
      method,
      card,
      expiry: expiry ? expiry.format("MM/YY") : "",
      cvv,
      flightPrice: price,
      mealsPrice,
      baggagePrice,
      selectedMeals
    };

    if (isEdit) {
      updatePayment(payment);
      setPaymentResult({ success: true, message: "Payment updated successfully." });
      resetForm();
      return;
    }

    setProcessing(true);
    setPaymentData(payment);

    setTimeout(() => {
      setProcessing(false);
      const otp = generateOtp();
      sendOtp(phone, otp);
      setShowOtpDialog(true);
    }, 2500);
  };

  const verifyOtpAndSubmit = () => {
    if (otp === generatedOtp) {
      addPayment(paymentData);
      setShowOtpDialog(false);
      setOtp("");
      setPaymentResult({ success: true, message: "Payment processed successfully!" });
      resetForm();
    } else {
      setPaymentResult({ success: false, message: "Invalid OTP. Please try again." });
    }
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseToast}
      >
        <Close fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Fade in={loaded} timeout={700}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          p: 2,
          backgroundColor: "#f7f9fc",
          backgroundImage: 'linear-gradient(120deg, #e0f7fa 0%, #f5f7fa 100%)',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            width: "100%",
            maxWidth: 1000,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              color="primary"
              fontWeight="800"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 1,
                background: 'linear-gradient(135deg, #bfc8d1ff 0%, #283593 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ✈️ AirGo Payments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Secure and convenient flight booking payment portal
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Flight Selection</StepLabel>
            </Step>
            <Step>
              <StepLabel>Passenger Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Extras & Payment</StepLabel>
            </Step>
          </Stepper>

          {/* Flight selection info */}
          {flight && <FlightInfoCard flight={flight} flightData={flightData} />}

          {/* Price summary */}
          <PriceSummary
            flightPrice={price}
            selectedMeals={selectedMeals}
            mealsOptions={mealsOptions}
            baggagePrice={baggagePrice}
          />

          {paymentResult && (
            <Alert
              severity={paymentResult.success ? "success" : "error"}
              sx={{
                mb: 2,
                borderRadius: '12px'
              }}
              icon={paymentResult.success ? <CheckCircle /> : null}
            >
              {paymentResult.message}
            </Alert>
          )}

          {processing && (
            <Box sx={{ textAlign: "center", my: 4 }}>
              <CircularProgress color="primary" size={48} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing Payment...
              </Typography>
            </Box>
          )}

          {!processing && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Flight Selection */}
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!!formErrors.flight}>
                      <InputLabel id="flight-label">Select Flight</InputLabel>
                      <Select
                        labelId="flight-label"
                        value={flight}
                        onChange={handleFlightChange}
                        disabled={processing}
                        label="Select Flight"
                        sx={{ borderRadius: '12px' }}
                      >
                        {flightData.map((f) => (
                          <MenuItem key={f.code} value={f.code} disabled={!f.available}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <Box>
                                <Typography variant="body1" fontWeight="500">
                                  {f.airline} - {f.code}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {f.departure} → {f.arrival}
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight="600">
                                LKR {f.price.toLocaleString()}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.flight && (
                        <Typography variant="caption" color="error">
                          {formErrors.flight}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {flight && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Passenger Information
                        </Typography>
                      </Grid>

                      {/* Payment ID (NIC) */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Payment ID (NIC)"
                          placeholder="Enter NIC (e.g. 123456789V or 200012345678)"
                          value={id}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase(); // auto uppercase V/X
                            setId(val);

                            // ✅ Regex patterns for NIC
                            const oldNIC = /^[0-9]{9}[VX]$/;   // 9 digits + V/X
                            const newNIC = /^[0-9]{12}$/;      // 12 digits only

                            if (!val) {
                              setFormErrors((prev) => ({
                                ...prev,
                                id: "❌ NIC is required",
                              }));
                            } else if (!(oldNIC.test(val) || newNIC.test(val))) {
                              setFormErrors((prev) => ({
                                ...prev,
                                id: "❌ Invalid NIC format. Use 9 digits + V/X OR 12 digits (e.g. 123456789V / 200012345678)",
                              }));
                            } else {
                              setFormErrors((prev) => ({ ...prev, id: "" }));
                            }
                          }}
                          disabled={isEdit}
                          fullWidth
                          required
                          error={!!formErrors.id}
                          helperText={formErrors.id}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ConfirmationNumber color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        />
                      </Grid>



                      {/* Passenger */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Passenger Name"
                          placeholder="e.g. John Doe"
                          value={passenger}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only update if the input matches letters and spaces, or is empty
                            if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                              setPassenger(value);
                            }
                          }}
                          fullWidth
                          required
                          disabled={processing}
                          error={!!formErrors.passenger}
                          helperText={formErrors.passenger}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Grid>

                      {/* Seat */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Seat Number"
                          placeholder="e.g. 12A"
                          value={seat}
                          onChange={(e) => setSeat(e.target.value)}
                          fullWidth
                          required
                          disabled={!flight || !!flightError || processing}
                          error={!!formErrors.seat}
                          helperText={formErrors.seat}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EventSeat color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                          onBlur={() => {
                            const seatPattern = /^[1-9][0-9]*[A-Za-z]+$/;
                            if (!seat) {
                              setFormErrors((prev) => ({ ...prev, seat: "Seat number is required" }));
                            } else if (!seatPattern.test(seat)) {
                              setFormErrors((prev) => ({
                                ...prev,
                                seat: "Seat must be positive numbers followed by letters (e.g. 12A)",
                              }));
                            } else {
                              setFormErrors((prev) => ({ ...prev, seat: "" }));
                            }
                          }}
                        />
                      </Grid>


                      {/* Phone */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          placeholder="e.g. +94 71 234 5678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          fullWidth
                          required
                          disabled={processing}
                          error={!!formErrors.phone}
                          helperText={formErrors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone color="primary" />
                              </InputAdornment>
                            ),
                            inputMode: "tel",
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '12px'
                            }
                          }}
                        />
                      </Grid>

                      {/* Status */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={!!formErrors.status}>
                          <InputLabel id="status-label">Status</InputLabel>
                          <Select
                            labelId="status-label"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={processing}
                            label="Status"
                            sx={{ borderRadius: '12px' }}
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Paid">Paid</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                          </Select>
                          {formErrors.status && (
                            <Typography variant="caption" color="error">
                              {formErrors.status}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>

                      {/* Meal Selection */}
                      <Grid item xs={12}>
                        <MealSelection
                          selectedMeals={selectedMeals}
                          setSelectedMeals={setSelectedMeals}
                          mealsOptions={mealsOptions}
                        />
                      </Grid>

                      {/* Baggage Selection */}
                      <Grid item xs={12}>
                        <BaggageSelection
                          baggagePrice={baggagePrice}
                          setBaggagePrice={setBaggagePrice}
                          baggageOptions={baggageOptions}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>

                      {/* Payment Method */}
                      <Grid item xs={12}>
                        <PaymentMethodSelector
                          method={method}
                          setMethod={setMethod}
                          processing={processing}
                        />
                      </Grid>

                      {/* Card Number - only show if card payment selected */}
                      {(method === "Credit Card" || method === "Debit Card") && (
                        <>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                              Card Details
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              label="Card Number"
                              placeholder="16-digit card number"
                              value={card}
                              onChange={(e) => setCard(e.target.value)}
                              fullWidth
                              required
                              disabled={processing}
                              error={!!formErrors.card}
                              helperText={formErrors.card}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CreditCard color="primary" />
                                  </InputAdornment>
                                ),
                                inputMode: "numeric",
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px'
                                }
                              }}
                            />
                          </Grid>

                          {/* Expiry Date */}
                          <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DesktopDatePicker
                                views={["year", "month"]}
                                label="Expiry Date"
                                minDate={dayjs()}
                                value={expiry}
                                onChange={(newValue) => setExpiry(newValue)}
                                disabled={processing}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="MM/YY"
                                    fullWidth
                                    error={!!formErrors.expiry}
                                    helperText={formErrors.expiry}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                      }
                                    }}
                                  />
                                )}
                              />
                            </LocalizationProvider>
                          </Grid>

                          {/* CVV */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="CVV"
                              placeholder="3-digit CVV"
                              type="password"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              fullWidth
                              required
                              disabled={processing}
                              error={!!formErrors.cvv}
                              helperText={formErrors.cvv}
                              inputProps={{ maxLength: 3 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CreditCardOff color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px'
                                }
                              }}
                            />
                          </Grid>
                        </>
                      )}

                      {/* Submit */}
                      <Grid item xs={12} sx={{ textAlign: "center", mt: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handleSubmit}
                          disabled={processing}
                          sx={{
                            px: 5,
                            py: 1.5,
                            fontSize: "1rem",
                            borderRadius: '12px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: '0 8px 20px rgba(25, 118, 210, 0.4)',
                            },
                          }}
                        >
                          {isEdit ? "Update Payment" : `Pay LKR ${(price + calculateMealsPrice() + baggagePrice).toLocaleString()}`}
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* OTP Dialog */}
          <Dialog
            open={showOtpDialog}
            onClose={() => !processing && setShowOtpDialog(false)}
            TransitionComponent={Grow}
            disableEscapeKeyDown={processing}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                p: 1
              }
            }}
          >
            <DialogTitle sx={{ textAlign: 'center' }}>
              <ScheduleSend sx={{ mr: 1, verticalAlign: "middle" }} /> OTP Verification
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                OTP sent to <b>{phone}</b>. Enter it below:
              </Typography>
              <OtpInput length={6} value={otp} onChange={setOtp} disabled={processing} />
              {paymentResult && !paymentResult.success && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                  {paymentResult.message}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                onClick={() => !processing && setShowOtpDialog(false)}
                color="error"
                variant="outlined"
                disabled={processing}
                sx={{ borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={verifyOtpAndSubmit}
                variant="contained"
                color="primary"
                disabled={processing || otp.length !== 6}
                sx={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                }}
              >
                Verify & Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* OTP Notification Snackbar */}
        <Snackbar
          open={toast?.open || false}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 6 }}
        >
          <Alert
            severity="info"
            elevation={6}
            variant="filled"
            icon={<ScheduleSend fontSize="inherit" />}
            action={action}
            sx={{
              width: '100%',
              borderRadius: '12px',
              alignItems: 'center'
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              OTP Sent Successfully
            </Typography>
            <Typography variant="body2">
              Sent to: {toast?.phoneNumber}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Demo OTP: <strong>{toast?.otp}</strong>
            </Typography>
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default PaymentForm;