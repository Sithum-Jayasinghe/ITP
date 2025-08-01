import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Pagination,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SheduleForm from "./ScheduleForm";
import ScheduleTable from "./ScheduleTable";
import Axios from "axios";
import { jsPDF } from "jspdf"; // named import
import autoTable from "jspdf-autotable"; // import autotable plugin
import debounce from "lodash.debounce";

const PAGE_SIZE = 10;

const Schedules = () => {
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

  // Fetch schedules
  const getSchedules = () => {
    setLoading(true);
    Axios.get("http://localhost:3001/api/schedules")
      .then((response) => {
        setSchedules(response.data?.response || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Axios error :", error);
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

  // Debounced search input handler to avoid excessive filtering on each keystroke
  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
    setPage(1); // Reset page to 1 on new search
  };

  // Filter schedules by search term
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

  // Sorting logic
  const sortedSchedules = useMemo(() => {
    if (!sortConfig.key) return filteredSchedules;
    const sorted = [...filteredSchedules].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSchedules, sortConfig]);

  // Pagination logic
  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSchedules.slice(start, start + PAGE_SIZE);
  }, [sortedSchedules, page]);

  // Change page handler
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Sort column handler
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

  // Dark mode toggle handler
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "calc(100% - 100px)",
        margin: "auto",
        marginTop: "100px",
        bgcolor: darkMode ? "#121212" : "transparent",
        color: darkMode ? "#fff" : "inherit",
        minHeight: "100vh",
        pb: 5,
      }}
    >
      {/* Dark Mode Toggle */}
      <Box sx={{ mb: 2, textAlign: "right" }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={handleDarkModeToggle} />}
          label="Dark Mode"
          sx={{ color: darkMode ? "#fff" : "inherit" }}
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

      {/* Controls: Search and PDF Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 4,
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          label="🔍 Search Flights / Status / Destination"
          variant="outlined"
          size="small"
          onChange={handleSearchChange}
          sx={{ flex: "1 1 60%", minWidth: 220 }}
          InputLabelProps={{ style: { color: darkMode ? "#fff" : undefined } }}
          InputProps={{
            style: { color: darkMode ? "#fff" : undefined },
          }}
        />

        <Button
          variant="contained"
          color="success"
          onClick={generatePDF}
          sx={{ px: 3, fontWeight: "bold" }}
        >
          📄 Download PDF
        </Button>
      </Box>

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress color={darkMode ? "inherit" : "primary"} />
        </Box>
      ) : (
        <>
          <ScheduleTable
            rows={paginatedSchedules}
            selectedSchedule={(data) => {
              setSelectedSchedule(data);
              setIsEdit(true);
            }}
            deleteSchedule={(data) =>
              window.confirm("Are you sure you want to delete this schedule?") &&
              deleteSchedule(data)
            }
            onSort={handleSort}
            sortConfig={sortConfig}
            darkMode={darkMode}
          />

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3,
            }}
          >
            <Pagination
              count={Math.ceil(sortedSchedules.length / PAGE_SIZE)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              size="large"
            />
          </Box>
        </>
      )}

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Schedules;
