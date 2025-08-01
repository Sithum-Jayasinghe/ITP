import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import TableChartIcon from "@mui/icons-material/TableChart";
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
import plane from "../Images/plane.jpg";

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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const paymentsRef = useRef();

  // Fetch payments on mount
  useEffect(() => {
    getPayments();
  }, []);

  const getPayments = () => {
    setLoading(true);
    Axios.get("http://localhost:3001/api/payments")
      .then((response) => {
        setPayments(response.data?.response || []);
        setLoading(false);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "⚠️ Unable to load your bookings. Please refresh.",
          severity: "error"
        });
        setLoading(false);
      });
  };

  // Persist dark mode setting
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Add Payment
  const addPayment = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createpayment", data)
      .then(() => {
        getPayments();
        setSnackbar({
          open: true,
          message: "🎉 Ticket booked & payment successful!",
          severity: "success"
        });
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "⚠️ Payment failed! Please check your details.",
          severity: "error"
        });
        setSubmitted(false);
      });
  };

  // Update Payment
  const updatePayment = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatepayment", data)
      .then(() => {
        getPayments();
        setSnackbar({
          open: true,
          message: "✅ Your booking has been updated.",
          severity: "success"
        });
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "⚠️ Unable to update booking. Try again.",
          severity: "error"
        });
        setSubmitted(false);
      });
  };

  // Delete Payment
  const deletePayment = (data) => {
    Axios.post("http://localhost:3001/api/deletepayment", data)
      .then(() => {
        getPayments();
        setSnackbar({
          open: true,
          message: "🗑️ Booking cancelled successfully.",
          severity: "success"
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "⚠️ Could not cancel booking. Try again.",
          severity: "error"
        });
      });
  };

  // Debounced search input handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPage(1);
    }, 300),
    []
  );

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    return payments.filter((p) =>
      Object.values(p).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [payments, searchTerm]);

  // Sort payments based on sortConfig
  const sortedPayments = useMemo(() => {
    if (!sortConfig.key) return filteredPayments;
    return [...filteredPayments].sort((a, b) =>
      sortConfig.direction === "asc"
        ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
        : a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
    );
  }, [filteredPayments, sortConfig]);

  // Pagination logic
  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedPayments.slice(start, start + PAGE_SIZE);
  }, [sortedPayments, page]);

  // Export payments table as PDF
  const handleDownloadPdf = async () => {
    if (!paymentsRef.current) return;
    const canvas = await html2canvas(paymentsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save("My_Tickets.pdf");
  };

  // Export payments as Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "My_Tickets.xlsx");
  };

  // Prepare chart data
  const statusData = [
    { name: "Paid", value: payments.filter((p) => p.status === "Paid").length },
    { name: "Pending", value: payments.filter((p) => p.status === "Pending").length },
    { name: "Cancelled", value: payments.filter((p) => p.status === "Cancelled").length }
  ];

  return (
    <>
      <Header />

      <Box
        sx={{
          width: "95%",
          mx: "auto",
          mt: 6,
          bgcolor: darkMode ? "#121212" : "#fafafa",
          color: darkMode ? "#fff" : "#000",
          minHeight: "100vh",
          borderRadius: "10px",
          p: 2
        }}
      >
        {/* Title & Dark Mode Toggle */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            ✈️ My Bookings & Payments
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
            label="🌙 Dark Mode"
            sx={{ color: darkMode ? "#fff" : "#000" }}
          />
        </Box>

        {/* Booking Form */}
        <PaymentForm
          addPayment={addPayment}
          updatePayment={updatePayment}
          submitted={submitted}
          data={selectedPayment}
          isEdit={isEdit}
          darkMode={darkMode}
        />

        {/* Plane Image */}
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <img
            src={plane}
            alt="Plane"
            style={{
              width: "90%",
              maxHeight: "250px",
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
            }}
          />
        </Box>

        {/* Search + Export Controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            mb: 2,
            flexWrap: "wrap"
          }}
        >
          <TextField
            placeholder="🔎 Search by Booking ID or Passenger Name"
            onChange={(e) => debouncedSearch(e.target.value)}
            value={searchTerm}
            sx={{
              width: 350,
              mb: { xs: 2, md: 0 },
              bgcolor: darkMode ? "#1e1e1e" : "#fff",
              input: { color: darkMode ? "#fff" : "#000" }
            }}
            InputProps={{
              startAdornment: <SearchIcon style={{ color: darkMode ? "#ccc" : "#000" }} />,
              endAdornment: searchTerm && (
                <IconButton
                  onClick={() => setSearchTerm("")}
                  sx={{ color: darkMode ? "#ccc" : "#000" }}
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              )
            }}
          />

          <Box>
            <Tooltip title="Download Tickets as PDF">
              <Button
                onClick={handleDownloadPdf}
                startIcon={<DownloadIcon />}
                sx={{ mr: 1 }}
                variant="outlined"
                color={darkMode ? "inherit" : "primary"}
              >
                PDF
              </Button>
            </Tooltip>
            <Tooltip title="Export as Excel">
              <Button
                onClick={handleDownloadExcel}
                startIcon={<TableChartIcon />}
                variant="outlined"
                color={darkMode ? "inherit" : "primary"}
              >
                Excel
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Payments Table */}
        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />
        ) : (
          <>
            <Box ref={paymentsRef}>
              <PaymentsTable
                rows={paginatedPayments}
                selectedPayment={(data) => {
                  setSelectedPayment(data);
                  setIsEdit(true);
                }}
                deletePayment={(data) => {
                  setPaymentToDelete(data);
                  setOpenDeleteDialog(true);
                }}
                requestSort={(key) =>
                  setSortConfig({
                    key,
                    direction: sortConfig.direction === "asc" ? "desc" : "asc"
                  })
                }
                sortConfig={sortConfig}
                darkMode={darkMode}
              />
            </Box>

            <Pagination
              count={Math.ceil(sortedPayments.length / PAGE_SIZE)}
              page={page}
              onChange={(e, val) => setPage(val)}
              sx={{ display: "flex", justifyContent: "center", mt: 3 }}
              color={darkMode ? "standard" : "primary"}
            />
          </>
        )}

        {/* Pie Chart */}
        <Paper
          sx={{
            mt: 4,
            p: 2,
            bgcolor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#fff" : "#000"
          }}
        >
          <Typography align="center" variant="h6" gutterBottom>
            Booking Status Overview
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Snackbar with modern style and fade transition */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={TransitionFade}
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{
              width: "100%",
              boxShadow: 3,
              fontWeight: "600",
              fontSize: "1rem",
              borderRadius: 2,
              ".MuiAlert-icon": {
                fontSize: "1.5rem"
              },
              bgcolor:
                snackbar.severity === "success"
                  ? "success.main"
                  : snackbar.severity === "error"
                  ? "error.main"
                  : snackbar.severity === "warning"
                  ? "warning.main"
                  : undefined,
              color: "white"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Modern Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          TransitionComponent={TransitionFade}
          keepMounted
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
              bgcolor: darkMode ? "#1e1e1e" : "#fff",
              color: darkMode ? "#fff" : "#000",
              boxShadow: 6,
            }
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            <WarningAmberIcon color="error" sx={{ fontSize: 30 }} />
            Cancel Booking
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{ fontSize: "1rem", mt: 1, mb: 1.5, lineHeight: 1.5 }}
            >
              Are you sure you want to cancel this booking? <br />
              This action is <strong>irreversible</strong> and your booking will be removed permanently.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDeleteDialog(false)}
              sx={{
                textTransform: "none",
                fontWeight: "600",
                minWidth: 120,
                borderRadius: 2,
              }}
            >
              No, Keep Booking
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deletePayment(paymentToDelete);
                setOpenDeleteDialog(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: "700",
                minWidth: 140,
                borderRadius: 2,
              }}
              autoFocus
            >
              Yes, Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Payments;
