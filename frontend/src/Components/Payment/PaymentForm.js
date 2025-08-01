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
  Collapse,
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
} from "@mui/icons-material";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const OtpInput = ({ length = 6, value, onChange, disabled }) => {
  const inputsRef = useRef([]);
  const [otpArr, setOtpArr] = useState(Array(length).fill(""));

  // Keep otpArr in sync with value prop
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
        />
      ))}
    </Box>
  );
};

const PaymentForm = ({ addPayment, updatePayment, submitted, data, isEdit }) => {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);

  const flightData = useMemo(
    () => [
      { code: "AK123", price: 35000, available: true },
      { code: "UL456", price: 42000, available: true },
      { code: "QR789", price: 56000, available: false },
      { code: "EK202", price: 48000, available: true },
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
  const [price, setPrice] = useState("");
  const [method, setMethod] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [cvv, setCvv] = useState("");

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
      setPrice(data.price || "");
      setMethod(data.method || "");
      setCard(data.card || "");
      setExpiry(data.expiry ? dayjs(`01/${data.expiry}`) : null);
      setCvv(data.cvv || "");
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
    setPrice("");
    setMethod("");
    setCard("");
    setExpiry(null);
    setCvv("");
    setFlightError("");
    setFormErrors({});
    setPaymentResult(null);
    setOtp("");
    setGeneratedOtp("");
    setShowOtpDialog(false);
    setProcessing(false);
    setPaymentData(null);
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
      } else {
        setFlightError("This flight is not available for booking");
        setPrice("");
      }
    }
  };

  // Validators
  const validateCardNumber = (number) => /^[0-9]{16}$/.test(number.replace(/\s+/g, ""));
  const validateExpiry = (date) => date && dayjs(date).isAfter(dayjs());
  const validateCvv = (cvv) => /^[0-9]{3}$/.test(cvv);
  const validatePhone = (phone) => /^(\+?\d{10,15})$/.test(phone);

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const sendOtp = (phoneNumber, otp) => {
    console.log(`Simulated OTP sent: ${otp} to phone: ${phoneNumber}`);
    alert(`Simulated OTP sent to ${phoneNumber}: ${otp}`);
  };

  const validateForm = () => {
    const errors = {};
    if (!id) errors.id = "Payment ID is required.";
    if (!flight) errors.flight = "Please select a flight.";
    if (flightError) errors.flight = flightError;
    if (!passenger) errors.passenger = "Passenger name is required.";
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

    const payment = {
      id,
      flight,
      passenger,
      status,
      phone,
      seat,
      price,
      method,
      card,
      expiry: expiry ? expiry.format("MM/YY") : "",
      cvv,
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
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
            width: "100%",
            maxWidth: 1000,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            fontWeight="700"
            gutterBottom
            sx={{ textAlign: "center", mb: 3 }}
          >
            ✈️ Airline Payment Gateway
          </Typography>

          {paymentResult && (
            <Alert severity={paymentResult.success ? "success" : "error"} sx={{ mb: 2 }}>
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
                  {/* Payment ID */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Payment ID"
                      placeholder="Enter unique payment ID"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
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
                    />
                  </Grid>

                  {/* Flight */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!formErrors.flight}>
                      <InputLabel id="flight-label">Select Flight</InputLabel>
                      <Select
                        labelId="flight-label"
                        value={flight}
                        onChange={handleFlightChange}
                        disabled={processing}
                      >
                        {flightData.map((f) => (
                          <MenuItem key={f.code} value={f.code} disabled={!f.available}>
                            {f.code}{" "}
                            {!f.available ? (
                              <Typography variant="caption" color="error">
                                Unavailable
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="primary">
                                LKR {f.price.toLocaleString()}
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.flight && (
                        <Typography variant="caption" color="error">
                          {formErrors.flight}
                        </Typography>
                      )}
                    </FormControl>
                    <Collapse in={!!flightError}>
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {flightError}
                      </Alert>
                    </Collapse>
                  </Grid>

                  {/* Passenger */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Passenger Name"
                      placeholder="e.g. John Doe"
                      value={passenger}
                      onChange={(e) => setPassenger(e.target.value)}
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
                    />
                  </Grid>

                  {/* Price */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Price (LKR)"
                      value={price ? price.toLocaleString() : ""}
                      placeholder="Auto-calculated"
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Payment Method */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!formErrors.method}>
                      <InputLabel id="method-label">Payment Method</InputLabel>
                      <Select
                        labelId="method-label"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        disabled={processing}
                      >
                        <MenuItem value="Credit Card">Credit Card</MenuItem>
                        <MenuItem value="Debit Card">Debit Card</MenuItem>
                        <MenuItem value="PayPal">PayPal</MenuItem>
                      </Select>
                      {formErrors.method && (
                        <Typography variant="caption" color="error">
                          {formErrors.method}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Card Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Card Number"
                      placeholder="16-digit card number"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      fullWidth
                      required={method === "Credit Card" || method === "Debit Card"}
                      disabled={processing || !(method === "Credit Card" || method === "Debit Card")}
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
                    />
                  </Grid>

                  {/* Expiry Date */}
                  <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        views={["year", "month"]}
                        label="Expiry Date"
                        minDate={dayjs()}
                        value={expiry}
                        onChange={(newValue) => setExpiry(newValue)}
                        disabled={processing || !(method === "Credit Card" || method === "Debit Card")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="MM/YY"
                            fullWidth
                            error={!!formErrors.expiry}
                            helperText={formErrors.expiry}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* CVV */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="CVV"
                      placeholder="3-digit CVV"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      fullWidth
                      required={method === "Credit Card" || method === "Debit Card"}
                      disabled={processing || !(method === "Credit Card" || method === "Debit Card")}
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
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: `0 4px 20px rgba(0, 123, 255, 0.4)`,
                        },
                      }}
                    >
                      {isEdit ? "Update Payment" : "Confirm & Pay"}
                    </Button>
                  </Grid>
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
          >
            <DialogTitle>
              <ScheduleSend sx={{ mr: 1, verticalAlign: "middle" }} /> OTP Verification
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                OTP sent to <b>{phone}</b>. Enter it below:
              </Typography>
              <OtpInput length={6} value={otp} onChange={setOtp} disabled={processing} />
              {paymentResult && !paymentResult.success && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {paymentResult.message}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => !processing && setShowOtpDialog(false)}
                color="error"
                variant="outlined"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={verifyOtpAndSubmit}
                variant="contained"
                color="primary"
                disabled={processing || otp.length !== 6}
              >
                Verify & Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Fade>
  );
};

export default PaymentForm;
