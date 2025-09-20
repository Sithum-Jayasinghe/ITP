// src/components/Payments/Payments.js
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Pagination,
  IconButton,
  Switch,
  FormControlLabel,
  Typography,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PaymentForm from "./PaymentForm";
import PaymentsTable from "./PaymentsTable";
import Axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import debounce from "lodash.debounce";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import Header from "../Main/Header";
import PayBanner from "../Images/pay.png";
import Banner2 from "../Images/ban1.png";
import Banner3 from "../Images/ban2.png";

const PAGE_SIZE = 10;
const COLORS = ["#4caf50", "#ff9800", "#f44336"];

const TransitionFade = React.forwardRef(function TransitionFade(props, ref) {
  return <Fade ref={ref} {...props} />;
});

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info", action: null });
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const paymentsRef = useRef();
  const previousPaymentRef = useRef();

  // === Banner slideshow ===
  const banners = [PayBanner, Banner2, Banner3];
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => { getPayments(); }, []);

  const getPayments = () => {
    setLoading(true);
    Axios.get("http://localhost:3001/api/payments")
      .then((response) => { setPayments(response.data?.response || []); setLoading(false); })
      .catch(() => {
        setSnackbar({ open: true, message: "⚠️ Unable to load bookings. Please refresh the page.", severity: "error" });
        setLoading(false);
      });
  };

  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);

  // === Add Payment ===
  const addPayment = (data) => {
    setSubmitted(true);
    const totalMealsPrice = data.totalMealsPrice || 0;
    const totalBaggagePrice = data.totalBaggagePrice || 0;
    const totalPrice = Number(data.price) + Number(totalMealsPrice) + Number(totalBaggagePrice);
    const paymentData = { ...data, totalMealsPrice, totalBaggagePrice, totalPrice };

    Axios.post("http://localhost:3001/api/createpayment", paymentData)
      .then(() => {
        getPayments();
        setSnackbar({ open: true, message: "🎉 Ticket booked & payment successful!", severity: "success" });
        setSubmitted(false); setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "⚠️ Payment failed! Please check your details.", severity: "error" });
        setSubmitted(false);
      });
  };

  // === Update Payment ===
  const updatePayment = (data) => {
    setSubmitted(true);
    previousPaymentRef.current = selectedPayment;
    const totalMealsPrice = data.totalMealsPrice || 0;
    const totalBaggagePrice = data.totalBaggagePrice || 0;
    const totalPrice = Number(data.price) + Number(totalMealsPrice) + Number(totalBaggagePrice);
    const paymentData = { ...data, totalMealsPrice, totalBaggagePrice, totalPrice };

    Axios.post("http://localhost:3001/api/updatepayment", paymentData)
      .then(() => {
        getPayments();
        setSnackbar({
          open: true,
          severity: "info",
          message: `✏️ Booking updated successfully for ${data.passengerName || data.passenger} (ID: ${data.id})`,
        });
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          severity: "error",
          message: `⚠️ Failed to update booking #${data.id}. Please try again.`,
        });
        setSubmitted(false);
      });
  };

  // === Delete Payment ===
  const deletePayment = (data) => {
    Axios.post("http://localhost:3001/api/deletepayment", data)
      .then(() => {
        getPayments();
        setSnackbar({ open: true, message: "🗑️ Booking cancelled successfully.", severity: "success" });
      })
      .catch(() => { setSnackbar({ open: true, message: "⚠️ Could not cancel booking. Try again.", severity: "error" }); });
  };

  // === Search & Filter ===
  const debouncedSearch = useCallback(
    debounce((value) => { setSearchTerm(value); setPage(1); }, 300), []
  );

  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    return payments.filter((p) =>
      Object.values(p).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [payments, searchTerm]);

  const sortedPayments = useMemo(() => {
    if (!sortConfig.key) return filteredPayments;
    return [...filteredPayments].sort((a, b) =>
      sortConfig.direction === "asc"
        ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
        : a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
    );
  }, [filteredPayments, sortConfig]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedPayments.slice(start, start + PAGE_SIZE);
  }, [sortedPayments, page]);

  // === Export PDF ===
  const handleDownloadPdf = async () => {
    if (!paymentsRef.current) return;
    const canvas = await html2canvas(paymentsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save("My_Tickets.pdf");
  };

  // === Export Excel ===
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "My_Tickets.xlsx");
  };

  const statusData = [
    { name: "Paid", value: payments.filter((p) => p.status === "Paid").length },
    { name: "Pending", value: payments.filter((p) => p.status === "Pending").length },
    { name: "Cancelled", value: payments.filter((p) => p.status === "Cancelled").length }
  ];

  return (
    <>
      <Header />

      {/* === Modern Slideshow Banner === */}
      <Box
        sx={{
          width: "100%",
          height: "250px",
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          mb: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {banners.map((banner, index) => (
          <Box
            key={index}
            component="img"
            src={banner}
            alt={`Banner ${index}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "16px",
              position: "absolute",
              top: 0,
              left: 0,
              opacity: currentBanner === index ? 1 : 0,
              transform: currentBanner === index ? "scale(1)" : "scale(1.1)",
              transition: "opacity 2s ease-in-out, transform 8s ease-in-out",
              filter: "brightness(0.75) saturate(1.2)", // more vivid colors
            }}
          />
        ))}
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            color: "white",
            textAlign: "center",
            px: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            ✈️ My Bookings & Payments
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mt: 1, textShadow: "1px 1px 6px rgba(0,0,0,0.8)" }}
          >
            Secure • Fast • Real-time Airline Payments
          </Typography>
        </Box>
      </Box>

      {/* === Main Content === */}
      <Box sx={{ width: "95%", mx: "auto", mt: 2, bgcolor: darkMode ? "#121212" : "#fafafa", color: darkMode ? "#fff" : "#000", minHeight: "100vh", borderRadius: "10px", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Manage Your Bookings</Typography>
          <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="🌙 Dark Mode" sx={{ color: darkMode ? "#fff" : "#000" }} />
        </Box>

        {/* Payment Form */}
        <PaymentForm addPayment={addPayment} updatePayment={updatePayment} submitted={submitted} data={selectedPayment} isEdit={isEdit} />

        {/* Payments Table */}
        {loading ? <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} /> : (
          <>
            <Box ref={paymentsRef}>
              <PaymentsTable
                rows={paginatedPayments}
                selectedPayment={(data) => { setSelectedPayment(data); setIsEdit(true); }}
                deletePayment={(data) => { setPaymentToDelete(data); setOpenDeleteDialog(true); }}
                requestSort={(key) => setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
                sortConfig={sortConfig}
                darkMode={darkMode}
              />
            </Box>
            <Pagination count={Math.ceil(sortedPayments.length / PAGE_SIZE)} page={page} onChange={(e, val) => setPage(val)} sx={{ display: "flex", justifyContent: "center", mt: 3 }} color={darkMode ? "standard" : "primary"} />
          </>
        )}

        {/* Pie Chart */}
        <Paper sx={{ mt: 4, p: 2, bgcolor: darkMode ? "#1e1e1e" : "#fff", color: darkMode ? "#fff" : "#000" }}>
          <Typography align="center" variant="h6" gutterBottom>Booking Status Overview</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                {statusData.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }} TransitionComponent={TransitionFade} sx={{ mt: 8 }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" elevation={6} action={snackbar.action}
            sx={{ width: "100%", boxShadow: 3, fontWeight: "600", fontSize: "1rem", borderRadius: 2, ".MuiAlert-icon": { fontSize: "1.5rem" }, bgcolor: snackbar.severity === "success" ? "success.main" : snackbar.severity === "error" ? "error.main" : snackbar.severity === "warning" ? "warning.main" : undefined, color: "white" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} TransitionComponent={TransitionFade} keepMounted maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2, bgcolor: darkMode ? "#1e1e1e" : "#fff", color: darkMode ? "#fff" : "#000", boxShadow: 6 } }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: "bold", fontSize: "1.25rem" }}>
            <WarningAmberIcon color="error" sx={{ fontSize: 30 }} /> Cancel Booking
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: "1rem", mt: 1, mb: 1.5, lineHeight: 1.5 }}>
              Are you sure you want to cancel this booking? <br /> This action is <strong>irreversible</strong> and your booking will be removed permanently.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button variant="outlined" onClick={() => setOpenDeleteDialog(false)} sx={{ textTransform: "none", fontWeight: "600", minWidth: 120, borderRadius: 2 }}>No, Keep Booking</Button>
            <Button variant="contained" color="error" onClick={() => { deletePayment(paymentToDelete); setOpenDeleteDialog(false); }} sx={{ textTransform: "none", fontWeight: "700", minWidth: 140, borderRadius: 2 }} autoFocus>Yes, Cancel Booking</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Payments;
