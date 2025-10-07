import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CssBaseline,
  Snackbar,
  Alert as MuiAlert,
  useMediaQuery,
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

// Brand
const AIRLINE_NAME = "AIRGO AIRLINES";
// Place this file in the public/ folder so it serves at /airgo-airlines-logo.png
const LOGO_URL = "/airgo-airlines-logo.png";
const LOGO_FORMAT = "PNG"; // change to "JPEG" if your logo is a .jpg

// Helper: convert hex color (#RRGGBB) to [r,g,b]
const hexToRgb = (hex) => {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res ? [parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16)] : [0, 0, 0];
};

// Load an image URL into an HTMLImageElement
const loadImage = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

const Staffs = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Persisted dark mode with system fallback
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("airgo_dark");
      if (saved !== null) return saved === "1";
    } catch (e) {}
    return prefersDarkMode;
  });
  useEffect(() => {
    // If no manual preference saved, follow system changes
    try {
      const saved = localStorage.getItem("airgo_dark");
      if (saved === null) setDarkMode(prefersDarkMode);
    } catch (e) {}
  }, [prefersDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("airgo_dark", next ? "1" : "0");
      } catch (e) {}
      return next;
    });
  };

  // Theme (dark-mode optimized)
  const theme = useMemo(() => {
    const isDark = darkMode;
    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: { main: "#007acc" },
        secondary: { main: "#00c6e6" },
        background: {
          default: isDark ? "#0f1115" : "#f5f7fb",
          paper: isDark ? "#171a21" : "#ffffff",
        },
        divider: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        text: {
          primary: isDark ? "#ffffff" : "#000000",
          secondary: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: isDark ? "#0f1115" : "#f5f7fb",
            },
          },
        },
        MuiPaper: {
          styleOverrides: { root: { backgroundImage: "none" } },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#90caf9" : "#1976d2",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#90caf9" : "#1976d2",
              },
            },
            input: { color: isDark ? "#fff" : "#000" },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            },
          },
        },
        MuiButton: {
          styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
        },
      },
    });
  }, [darkMode]);

  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch staff data on mount
  useEffect(() => {
    getStaffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Search staff (safe against missing fields)
  const handleSearch = (term) => {
    setSearchTerm(term);
    const q = term?.toLowerCase?.() || "";
    if (!q) {
      setFilteredStaffs(staffs);
      return;
    }
    const filtered = staffs.filter((s) => {
      const fields = [
        String(s?.id ?? ""),
        String(s?.name ?? ""),
        String(s?.role ?? ""),
        String(s?.email ?? ""),
      ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
    setFilteredStaffs(filtered);
  };

  // Export PDF with theme, AIRGO AIRLINES, and logo
  const generatePDF = async () => {
    const logoImg = await loadImage(LOGO_URL);
    const totalPagesExp = "{total_pages_count_string}";

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const pageSize = doc.internal?.pageSize || {};
    const pageWidth = typeof pageSize.getWidth === "function" ? pageSize.getWidth() : pageSize.width || 297; // A4 landscape
    const pageHeight = typeof pageSize.getHeight === "function" ? pageSize.getHeight() : pageSize.height || 210;

    const primaryRGB = hexToRgb(theme.palette.primary.main);
    const altRow = darkMode ? [48, 52, 62] : [240, 248, 255]; // readable in both modes
    const headerH = 22;
    const marginX = 8;

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
      row?.id ?? "-",
      row?.name ?? "-",
      row?.role ?? "-",
      row?.email ?? "-",
      row?.certificate ?? "-",
      row?.schedule ?? "-",
      row?.status ?? "-",
      row?.shiftStartDate || "-",
      row?.shiftStartTime || "-",
      row?.shiftEndDate || "-",
      row?.shiftEndTime || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      margin: { top: headerH + 8, bottom: 14, left: 8, right: 8 },
      styles: {
        fontSize: 9,
        cellPadding: 2.2,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
        overflow: "linebreak",
        // Keep body text black for readability on white rows even in dark mode
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: primaryRGB,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: altRow },
      didDrawPage: (data) => {
        // Header bar
        doc.setFillColor(...primaryRGB);
        doc.rect(0, 0, pageWidth, headerH, "F");

        // Logo + Title
        let titleX = marginX;
        const logoTargetH = 12;

        if (logoImg) {
          const natW = logoImg.naturalWidth || logoImg.width || 1;
          const natH = logoImg.naturalHeight || logoImg.height || 1;
          const logoW = (natW / natH) * logoTargetH;
          doc.addImage(logoImg, LOGO_FORMAT, marginX, (headerH - logoTargetH) / 2, logoW, logoTargetH);
          titleX = marginX + logoW + 6;
        }

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(AIRLINE_NAME, titleX, 11);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Airline Staff List", titleX, 17);

        // Date (right aligned)
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - marginX, 11, {
          align: "right",
        });

        // Footer
        const pageStr = `Page ${data.pageNumber} of ${totalPagesExp}`;
        doc.setTextColor(darkMode ? 200 : 100);
        doc.setFontSize(9);
        doc.text("Generated by Airline Management System", marginX, pageHeight - 6);
        doc.text(pageStr, pageWidth - marginX, pageHeight - 6, { align: "right" });
      },
    });

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }

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
            // Slightly darker in dark mode; slightly dim in light mode
            filter: darkMode ? "brightness(0.45)" : "brightness(0.6)",
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
          onClick={toggleDarkMode}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: darkMode ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.28)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
          aria-label="toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
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