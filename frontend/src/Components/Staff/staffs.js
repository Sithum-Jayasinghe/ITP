import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CssBaseline,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import StaffForm from "./StaffForm";
import StaffsTable from "./StaffsTable";
import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "../Main/Header";
import StaffVideo from "../Images/st1.mp4";

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Dark/Light theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#007acc" },
          secondary: { main: "#00c6e6" },
          background: {
            default: darkMode ? "#121212" : "#f5f5f5",
            paper: darkMode ? "#1e1e1e" : "#fff",
          },
          text: {
            primary: darkMode ? "#fff" : "#000",
            secondary: darkMode ? "#ccc" : "#555",
          },
        },
      }),
    [darkMode]
  );

  // Fetch staff data on mount
  useEffect(() => {
    getStaffs();
  }, []);

  const getStaffs = () => {
    Axios.get("http://localhost:3001/api/staffs")
      .then((res) => {
        const data = res.data?.response || [];
        setStaffs(data);
        setFilteredStaffs(data);
      })
      .catch(() =>
        setSnackbar({
          open: true,
          message: "❌ Failed to fetch staff list",
          severity: "error",
        })
      );
  };

  // Add new staff
  const addStaff = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createstaff", data)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setSelectedStaff({});
        setIsEdit(false);
        setSnackbar({
          open: true,
          message: "✅ Staff added successfully!",
          severity: "success",
        });
      })
      .catch(() =>
        setSnackbar({
          open: true,
          message: "❌ Failed to add staff",
          severity: "error",
        })
      );
  };

  // Update existing staff
  const updateStaff = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatestaff", data)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setSelectedStaff({});
        setIsEdit(false);
        setSnackbar({
          open: true,
          message: "✏️ Staff updated successfully!",
          severity: "info",
        });
      })
      .catch(() =>
        setSnackbar({
          open: true,
          message: "❌ Failed to update staff",
          severity: "error",
        })
      );
  };

  // Delete staff
  const deleteStaff = (staff) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      Axios.post("http://localhost:3001/api/deletestaff", { id: staff.id })
        .then(() => {
          getStaffs();
          setSnackbar({
            open: true,
            message: "🗑️ Staff deleted successfully!",
            severity: "success",
          });
        })
        .catch(() =>
          setSnackbar({
            open: true,
            message: "❌ Failed to delete staff",
            severity: "error",
          })
        );
    }
  };

  // Search staff
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredStaffs(staffs);
    } else {
      const filtered = staffs.filter(
        (s) =>
          s.id.toString().toLowerCase().includes(term.toLowerCase()) ||
          s.name.toLowerCase().includes(term.toLowerCase()) ||
          s.role.toLowerCase().includes(term.toLowerCase()) ||
          s.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStaffs(filtered);
    }
  };

  // Export PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Airline Staff List", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = [
      "ID",
      "Name",
      "Role",
      "Email",
      "Certificate",
      "Schedule",
      "Status",
      "Shift Start Date",
      "Shift Start Time",
      "Shift End Date",
      "Shift End Time",
    ];

    const tableRows = filteredStaffs.map((row) => [
      row.id,
      row.name,
      row.role,
      row.email,
      row.certificate,
      row.schedule,
      row.status,
      row.shiftStartDate || "-",
      row.shiftStartTime || "-",
      row.shiftEndDate || "-",
      row.shiftEndTime || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: darkMode ? [40, 40, 40] : [240, 248, 255] },
      theme: "striped",
    });

    doc.setFontSize(10);
    doc.text(
      "Generated by Airline Management System",
      14,
      doc.internal.pageSize.height - 10
    );
    doc.save("Staff_List.pdf");

    setSnackbar({
      open: true,
      message: "📄 PDF exported successfully!",
      severity: "success",
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />

      {/* Banner */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          mb: 5,
        }}
      >
        <video
          src={StaffVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: darkMode ? "brightness(0.5)" : "brightness(0.6)",
          }}
        />
        <Typography
          variant="h3"
          sx={{
            position: "absolute",
            color: "#fff",
            fontWeight: "bold",
            textShadow: "3px 3px 12px rgba(0,0,0,0.8)",
            textAlign: "center",
          }}
        >
          Staff Management System
          <Typography variant="h6" sx={{ fontWeight: 400, mt: 1, opacity: 0.9 }}>
            Manage your airline workforce with ease
          </Typography>
        </Typography>

        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          {darkMode ? (
            <Brightness7Icon sx={{ color: "#fff" }} />
          ) : (
            <Brightness4Icon sx={{ color: "#fff" }} />
          )}
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: "90%", margin: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 2 }}>
          <TextField
            label="Search Staff"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="secondary" onClick={generatePDF} sx={{ whiteSpace: "nowrap" }}>
            Export PDF
          </Button>
        </Box>

        <StaffForm
          addStaff={addStaff}
          updateStaff={updateStaff}
          submitted={submitted}
          data={selectedStaff}
          isEdit={isEdit}
        />

        <StaffsTable
          rows={filteredStaffs}
          selectedStaff={(data) => {
            setSelectedStaff(data);
            setIsEdit(true);
          }}
          deleteStaff={deleteStaff}
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: "bold", borderRadius: 2 }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default Staffs;
