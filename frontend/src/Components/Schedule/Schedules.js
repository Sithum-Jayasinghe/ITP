import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  Switch,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import SheduleForm from "./ScheduleForm";
import ScheduleTable from "./ScheduleTable";
import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import debounce from "lodash.debounce";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const PAGE_SIZE = 10;

const Schedules = () => {
  const theme = useTheme();

  const [schedules, setSchedules] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [darkMode, setDarkMode] = useState(false);

  // Delete dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Fetch schedules
  const getSchedules = () => {
    setLoading(true);
    Axios.get("http://localhost:3001/api/schedules")
      .then((response) => {
        setSchedules(response.data?.response || []);
        setLoading(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to fetch schedules", severity: "error" });
        setLoading(false);
      });
  };

  useEffect(() => {
    getSchedules();
  }, []);

  // Add schedule
  const addSchedule = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createschedule", data)
      .then(() => {
        getSchedules();
        setSnackbar({ open: true, message: "Schedule added successfully", severity: "success" });
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to add schedule", severity: "error" });
        setSubmitted(false);
      });
  };

  // Update schedule
  const updateSchedule = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updateschedule", data)
      .then(() => {
        getSchedules();
        setSnackbar({ open: true, message: "Schedule updated successfully", severity: "success" });
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to update schedule", severity: "error" });
        setSubmitted(false);
      });
  };

  // Delete schedule
  const deleteSchedule = (data) => {
    Axios.post("http://localhost:3001/api/deleteschedule", data)
      .then(() => {
        getSchedules();
        setSnackbar({ open: true, message: "Schedule deleted successfully", severity: "success" });
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to delete schedule", severity: "error" });
      });
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
    setPage(1);
  };

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    if (!searchTerm.trim()) return schedules;
    const lowerSearch = searchTerm.toLowerCase();
    return schedules.filter(
      (s) =>
        s.flightName.toLowerCase().includes(lowerSearch) ||
        s.departure.toLowerCase().includes(lowerSearch) ||
        s.arrival.toLowerCase().includes(lowerSearch) ||
        s.status.toLowerCase().includes(lowerSearch)
    );
  }, [schedules, searchTerm]);

  // Sorting
  const sortedSchedules = useMemo(() => {
    if (!sortConfig.key) return filteredSchedules;
    return [...filteredSchedules].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSchedules, sortConfig]);

  // Pagination
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSchedules.slice(start, start + PAGE_SIZE);
  }, [sortedSchedules, page]);

  // Sort column
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // PDF generator
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("✈️ Airline Flight Schedules", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = [
      "ID",
      "Flight",
      "Departure",
      "Arrival",
      "Dep Time",
      "Arr Time",
      "Aircraft",
      "Seats",
      "Status",
    ];

    const tableRows = sortedSchedules.map((row) => [
      row.id,
      row.flightName,
      row.departure,
      row.arrival,
      row.dtime,
      row.atime,
      row.aircraft,
      row.seats,
      row.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      theme: "striped",
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text("Generated by Airline Management System", 14, pageHeight - 10);
    doc.save("Flight_Schedules.pdf");
  };

  // Dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "calc(100% - 100px)",
        margin: "auto",
        marginTop: 10,
        bgcolor: darkMode ? "#121212" : "#f9fafb",
        color: darkMode ? "#e0e0e0" : "#222",
        minHeight: "100vh",
        pb: 5,
        borderRadius: 3,
        boxShadow: darkMode
          ? "0 4px 12px rgba(0,0,0,0.7)"
          : "0 4px 12px rgba(0,0,0,0.1)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Dark Mode Toggle */}
      <Box sx={{ mb: 3, textAlign: "right" }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={handleDarkModeToggle}
              color="primary"
              sx={{
                "& .MuiSwitch-thumb": {
                  boxShadow: darkMode
                    ? "0 0 2px 3px rgba(0,255,255,0.7)"
                    : "none",
                },
              }}
            />
          }
          label="Dark Mode"
          sx={{ color: darkMode ? "#e0e0e0" : "#444", fontWeight: "600" }}
        />
      </Box>

      {/* Form */}
      <SheduleForm
        addSchedule={addSchedule}
        updateSchedule={updateSchedule}
        submitted={submitted}
        data={selectedSchedule}
        isEdit={isEdit}
        darkMode={darkMode}
      />

      {/* Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 5,
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          label="🔍 Search Flights / Status / Destination"
          variant="outlined"
          size="medium"
          onChange={handleSearchChange}
          sx={{
            flex: "1 1 60%",
            minWidth: 280,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: darkMode ? "#1e1e1e" : "#fff",
              color: darkMode ? "#e0e0e0" : "#222",
              transition: "background-color 0.3s ease",
            },
            "& .MuiInputLabel-root": {
              color: darkMode ? "#a0a0a0" : "#555",
              fontWeight: "500",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: darkMode ? "#444" : "#ccc",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: darkMode ? "#0ff" : "#2f80ed",
            },
          }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ style: { color: darkMode ? "#e0e0e0" : "#222" } }}
        />

        <Button
          variant="contained"
          color="success"
          onClick={generatePDF}
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: "700",
            borderRadius: 3,
            boxShadow: "0 4px 10px rgba(22, 160, 133, 0.5)",
            "&:hover": {
              boxShadow: "0 6px 14px rgba(22, 160, 133, 0.8)",
            },
            transition: "box-shadow 0.3s ease",
          }}
        >
          📄 Download PDF
        </Button>
      </Box>

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress
            color={darkMode ? "inherit" : "primary"}
            size={48}
            thickness={5}
          />
        </Box>
      ) : (
        <>
          <ScheduleTable
            rows={paginatedSchedules}
            selectedSchedule={(data) => {
              setSelectedSchedule(data);
              setIsEdit(true);
            }}
            deleteSchedule={(data) => {
              setScheduleToDelete(data);
              setOpenDeleteDialog(true);
            }}
            onSort={handleSort}
            sortConfig={sortConfig}
            darkMode={darkMode}
          />

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(sortedSchedules.length / PAGE_SIZE)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: "600",
                },
                "& .Mui-selected": {
                  backgroundColor: theme.palette.success.main,
                  color: "#fff",
                  fontWeight: "700",
                  "&:hover": {
                    backgroundColor: theme.palette.success.dark,
                  },
                },
              }}
            />
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            fontWeight: "600",
            fontSize: 15,
            letterSpacing: 0.3,
            bgcolor:
              snackbar.severity === "error"
                ? "#f44336"
                : snackbar.severity === "success"
                ? "#4caf50"
                : "#2196f3",
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modern Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            bgcolor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#e0e0e0" : "#111",
            boxShadow: darkMode
              ? "0 10px 30px rgba(0,0,0,0.8)"
              : "0 10px 30px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s ease, color 0.3s ease",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: "700",
            fontSize: 20,
            color: theme.palette.error.main,
          }}
        >
          <WarningAmberIcon fontSize="large" />
          Delete Flight Schedule
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: 16,
              color: darkMode ? "#bbb" : "#333",
              mt: 1,
              userSelect: "none",
            }}
          >
            Are you sure you want to delete this flight schedule? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: darkMode ? "#aaa" : "#555",
              fontWeight: "600",
              textTransform: "none",
              "&:hover": { bgcolor: darkMode ? "#333" : "#f0f0f0" },
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            No
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              deleteSchedule(scheduleToDelete);
              setOpenDeleteDialog(false);
            }}
            sx={{
              fontWeight: "700",
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.6)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(244, 67, 54, 0.9)",
              },
            }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedules;
