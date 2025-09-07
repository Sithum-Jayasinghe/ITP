// src/components/Payments/Payments.js
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box, Button, TextField, CircularProgress, Snackbar, Alert, Pagination,
  IconButton, Switch, FormControlLabel, Typography, Tooltip, Paper, Dialog,
  DialogTitle, DialogContent, DialogActions, Fade
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import TableChartIcon from "@mui/icons-material/TableChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
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

  // NEW STATE for price breakdown modal
  const [openBreakdown, setOpenBreakdown] = useState(false);
  const [breakdownData, setBreakdownData] = useState(null);

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
      .then((res) => { setPayments(res.data?.response || []); setLoading(false); })
      .catch(() => {
        setSnackbar({ open: true, message: "⚠️ Unable to load bookings. Please refresh.", severity: "error" });
        setLoading(false);
      });
  };

  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);

  // === Hyper-Personalized Pricing Engine ===
  const calculateDynamicPrice = (basePrice, loyalty = "Standard", demandFactor = 1) => {
    let discount = 0;
    if (loyalty === "Gold") discount = 0.15;
    else if (loyalty === "Silver") discount = 0.08;
    else if (loyalty === "Bronze") discount = 0.05;

    // simulate demand markup
    const demandMarkup = demandFactor > 1.2 ? 0.10 : demandFactor > 1.0 ? 0.05 : 0;

    const finalPrice = basePrice * (1 - discount + demandMarkup);
    return { finalPrice: finalPrice.toFixed(2), discount, demandMarkup };
  };

  // === Add Payment ===
  const addPayment = (data) => {
    setSubmitted(true);
    const totalMealsPrice = data.totalMealsPrice || 0;
    const totalBaggagePrice = data.totalBaggagePrice || 0;
    const basePrice = Number(data.price) + Number(totalMealsPrice) + Number(totalBaggagePrice);

    const { finalPrice, discount, demandMarkup } = calculateDynamicPrice(basePrice, data.loyaltyTier, Math.random() * 1.5);

    const paymentData = { ...data, totalMealsPrice, totalBaggagePrice, totalPrice: finalPrice, appliedDiscount: discount, appliedMarkup: demandMarkup };

    Axios.post("http://localhost:3001/api/createpayment", paymentData)
      .then(() => {
        getPayments();
        setSnackbar({ open: true, message: `🎉 Ticket booked at personalized price: $${finalPrice}`, severity: "success" });
        setSubmitted(false); setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "⚠️ Payment failed! Try again.", severity: "error" });
        setSubmitted(false);
      });
  };

  // === Update Payment ===
  const updatePayment = (data) => {
    setSubmitted(true);
    previousPaymentRef.current = selectedPayment;
    const totalMealsPrice = data.totalMealsPrice || 0;
    const totalBaggagePrice = data.totalBaggagePrice || 0;
    const basePrice = Number(data.price) + Number(totalMealsPrice) + Number(totalBaggagePrice);

    const { finalPrice, discount, demandMarkup } = calculateDynamicPrice(basePrice, data.loyaltyTier, Math.random() * 1.5);

    const paymentData = { ...data, totalMealsPrice, totalBaggagePrice, totalPrice: finalPrice, appliedDiscount: discount, appliedMarkup: demandMarkup };

    Axios.post("http://localhost:3001/api/updatepayment", paymentData)
      .then(() => {
        getPayments();
        setSnackbar({
          open: true, severity: "info",
          message: `✏️ Booking updated. Personalized price applied: $${finalPrice}`,
        });
        setSubmitted(false); setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({ open: true, severity: "error", message: `⚠️ Failed to update booking #${data.id}.` });
        setSubmitted(false);
      });
  };

  // === Delete Payment ===
  const deletePayment = (data) => {
    Axios.post("http://localhost:3001/api/deletepayment", data)
      .then(() => {
        getPayments();
        setSnackbar({ open: true, message: "🗑️ Booking cancelled.", severity: "success" });
      })
      .catch(() => { setSnackbar({ open: true, message: "⚠️ Could not cancel booking.", severity: "error" }); });
  };

  // === Search/Filter/Sort ===
  const debouncedSearch = useCallback(debounce((v) => { setSearchTerm(v); setPage(1); }, 300), []);
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

  // === Export ===
  const handleDownloadPdf = async () => {
    if (!paymentsRef.current) return;
    const canvas = await html2canvas(paymentsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save("My_Tickets.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "My_Tickets.xlsx");
  };

  // === Pie Chart Data ===
  const statusData = [
    { name: "Paid", value: payments.filter((p) => p.status === "Paid").length },
    { name: "Pending", value: payments.filter((p) => p.status === "Pending").length },
    { name: "Cancelled", value: payments.filter((p) => p.status === "Cancelled").length }
  ];

  // === Price Breakdown ===
  const showPriceBreakdown = (payment) => {
    setBreakdownData(payment);
    setOpenBreakdown(true);
  };

  return (
    <>
      <Header />

      {/* Banner Carousel */}
      <Box sx={{ width: "100%", height: "200px", overflow: "hidden", borderRadius: "10px", mb: 3, position: "relative" }}>
        {banners.map((banner, i) => (
          <Box key={i} component="img" src={banner} alt={`Banner ${i}`}
            sx={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px",
              position: "absolute", top: 0, left: 0, opacity: currentBanner === i ? 1 : 0,
              transform: currentBanner === i ? "scale(1)" : "scale(1.05)", transition: "opacity 2s, transform 2s" }} />
        ))}
      </Box>

      <Box sx={{ width: "95%", mx: "auto", mt: 2, bgcolor: darkMode ? "#121212" : "#fafafa",
        color: darkMode ? "#fff" : "#000", minHeight: "100vh", borderRadius: "10px", p: 2 }}>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">✈️ My Bookings & Payments</Typography>
          <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label="🌙 Dark Mode" sx={{ color: darkMode ? "#fff" : "#000" }} />
        </Box>

        {/* Personalized Offer Banner */}
        <Paper sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "#e3f2fd" }}>
          <LoyaltyIcon color="primary" sx={{ fontSize: 30 }} />
          <Typography variant="body1">
            🎁 Special Offer: Loyal travelers enjoy <strong>dynamic personalized fares</strong> adjusted for you in real-time!
          </Typography>
        </Paper>

        {/* Payment Form */}
        <PaymentForm addPayment={addPayment} updatePayment={updatePayment} submitted={submitted} data={selectedPayment} isEdit={isEdit} />

        {/* Search + Export */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, mb: 2, flexWrap: "wrap" }}>
          <TextField placeholder="🔎 Search by Booking ID or Passenger Name"
            onChange={(e) => debouncedSearch(e.target.value)} value={searchTerm}
            sx={{ width: 350, mb: { xs: 2, md: 0 }, bgcolor: darkMode ? "#1e1e1e" : "#fff" }}
            InputProps={{
              startAdornment: <SearchIcon style={{ color: darkMode ? "#ccc" : "#000" }} />,
              endAdornment: searchTerm && <IconButton onClick={() => setSearchTerm("")}><ClearIcon /></IconButton>
            }} />
          <Box>
            <Tooltip title="Download PDF"><Button onClick={handleDownloadPdf} startIcon={<DownloadIcon />} sx={{ mr: 1 }} variant="outlined">PDF</Button></Tooltip>
            <Tooltip title="Export Excel"><Button onClick={handleDownloadExcel} startIcon={<TableChartIcon />} variant="outlined">Excel</Button></Tooltip>
          </Box>
        </Box>

        {/* Payments Table */}
        {loading ? <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} /> : (
          <>
            <Box ref={paymentsRef}>
              <PaymentsTable rows={paginatedPayments}
                selectedPayment={(d) => { setSelectedPayment(d); setIsEdit(true); }}
                deletePayment={(d) => { setPaymentToDelete(d); setOpenDeleteDialog(true); }}
                showBreakdown={showPriceBreakdown}  // 👈 NEW
                requestSort={(key) => setSortConfig({ key, direction: sortConfig.direction === "asc" ? "desc" : "asc" })}
                sortConfig={sortConfig} darkMode={darkMode} />
            </Box>
            <Pagination count={Math.ceil(sortedPayments.length / PAGE_SIZE)} page={page} onChange={(e, val) => setPage(val)}
              sx={{ display: "flex", justifyContent: "center", mt: 3 }} />
          </>
        )}

        {/* Pie Chart */}
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography align="center" variant="h6" gutterBottom>Booking Status Overview</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                {statusData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }} TransitionComponent={TransitionFade}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} TransitionComponent={TransitionFade} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon color="error" /> Cancel Booking
          </DialogTitle>
          <DialogContent><Typography>Are you sure you want to cancel this booking?</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>No</Button>
            <Button color="error" onClick={() => { deletePayment(paymentToDelete); setOpenDeleteDialog(false); }}>Yes, Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Price Breakdown Dialog */}
        <Dialog open={openBreakdown} onClose={() => setOpenBreakdown(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>💰 Price Breakdown</DialogTitle>
          <DialogContent dividers>
            {breakdownData ? (
              <Box>
                <Typography><strong>Passenger:</strong> {breakdownData.passengerName || breakdownData.passenger}</Typography>
                <Typography><strong>Booking ID:</strong> {breakdownData.id}</Typography>

                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography>Base Fare: ${Number(breakdownData.price).toFixed(2)}</Typography>
                  <Typography>Meals: ${Number(breakdownData.totalMealsPrice || 0).toFixed(2)}</Typography>
                  <Typography>Baggage: ${Number(breakdownData.totalBaggagePrice || 0).toFixed(2)}</Typography>
                  <Typography sx={{ color: "green" }}>
                    Loyalty Discount: -{(breakdownData.appliedDiscount * 100 || 0).toFixed(1)}%
                  </Typography>
                  <Typography sx={{ color: "red" }}>
                    Demand Markup: +{(breakdownData.appliedMarkup * 100 || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                    Final Price: ${Number(breakdownData.totalPrice).toFixed(2)}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Typography>No data available.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBreakdown(false)} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Payments;
