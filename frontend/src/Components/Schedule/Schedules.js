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
} from "@mui/material";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

import SheduleForm from "./ScheduleForm";
import ScheduleTable from "./ScheduleTable";
import BooksTable from "../Book/BooksTable";

import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import debounce from "lodash.debounce";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import 'leaflet/dist/leaflet.css';
import Header from "../Main/Header";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PAGE_SIZE = 10;

const Schedules = () => {
  // ----- State variables -----
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [flightCoords, setFlightCoords] = useState([]); // [{flightName, depCoords, arrCoords}]
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // ----- Fetch schedules -----
  const getSchedules = () => {
    setLoading(true);
    Axios.get("http://localhost:3001/api/schedules")
      .then((res) => {
        setSchedules(res.data?.response || []);
        setLoading(false);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to fetch schedules", severity: "error" });
        setLoading(false);
      });
  };

  // ----- Fetch bookings -----
  const getBookings = () => {
    Axios.get("http://localhost:3001/api/bookings")
      .then((res) => setBookings(res.data?.response || []))
      .catch(() => setSnackbar({ open: true, message: "Failed to fetch bookings", severity: "error" }));
  };

  useEffect(() => {
    getSchedules();
    getBookings();
  }, []);

  // ----- Add / Update / Delete schedule -----
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

  const deleteSchedule = (data) => {
    Axios.post("http://localhost:3001/api/deleteschedule", data)
      .then(() => {
        getSchedules();
        setSnackbar({ open: true, message: "Schedule deleted successfully", severity: "success" });
      })
      .catch(() => setSnackbar({ open: true, message: "Failed to delete schedule", severity: "error" }));
  };

  const deleteBooking = (data) => {
    Axios.post("http://localhost:3001/api/deletebooking", data)
      .then(() => {
        getBookings();
        setSnackbar({ open: true, message: "Booking deleted successfully", severity: "success" });
      })
      .catch(() => setSnackbar({ open: true, message: "Failed to delete booking", severity: "error" }));
  };

  // ----- Search -----
  const debouncedSearch = useCallback(debounce((value) => setSearchTerm(value), 300), []);
  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
    setPage(1);
  };

  // ----- Filter & Sort schedules -----
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

  const sortedSchedules = useMemo(() => {
    if (!sortConfig.key) return filteredSchedules;
    return [...filteredSchedules].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSchedules, sortConfig]);

  const paginatedSchedules = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedSchedules.slice(start, start + PAGE_SIZE);
  }, [sortedSchedules, page]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // ----- PDF generator -----
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("✈️ Airline Flight Schedules", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["ID", "Flight", "Departure", "Arrival", "Dep Time", "Arr Time", "Aircraft", "Seats", "Status"];
    const tableRows = sortedSchedules.map((row) => [
      row.id, row.flightName, row.departure, row.arrival, row.dtime, row.atime, row.aircraft, row.seats, row.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      theme: "striped"
    });

    doc.setFontSize(10);
    doc.text("Generated by Airline Management System", 14, doc.internal.pageSize.height - 10);
    doc.save("Flight_Schedules.pdf");
  };

  // ----- Map coordinates -----
  const getCoordinates = async (place) => {
    if (!place) return null;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
      const data = await res.json();
      if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchFlightCoords = async () => {
      const coordsArray = [];
      for (const flight of sortedSchedules) {
        const depCoords = await getCoordinates(flight.departure);
        const arrCoords = await getCoordinates(flight.arrival);
        if (depCoords && arrCoords) coordsArray.push({ flightName: flight.flightName, depCoords, arrCoords });
      }
      setFlightCoords(coordsArray);
      if (coordsArray.length > 0) {
        setMapCenter(coordsArray[0].depCoords);
        setMapZoom(4);
      }
    };
    fetchFlightCoords();
  }, [sortedSchedules]);

  // ----- Render -----
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
        boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.7)" : "0 4px 12px rgba(0,0,0,0.1)",
        transition: "background-color 0.3s ease, color 0.3s ease"
      }}
    >
      <Header />

      {/* Dark Mode Toggle */}
      <Box sx={{ mb: 3, textAlign: "right" }}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
          sx={{ color: darkMode ? "#e0e0e0" : "#444", fontWeight: "600" }}
        />
      </Box>

      {/* Schedule Form */}
      <SheduleForm
        addSchedule={addSchedule}
        updateSchedule={updateSchedule}
        submitted={submitted}
        data={selectedSchedule}
        isEdit={isEdit}
        darkMode={darkMode}
      />

      {/* Search & PDF */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 5, mb: 3, flexWrap: "wrap", gap: 2 }}>
        <TextField
          label="🔍 Search Flights / Destination / Country"
          variant="outlined"
          size="medium"
          onChange={handleSearchChange}
          sx={{ flex: "1 1 60%", minWidth: 280 }}
        />
        <Button variant="contained" color="success" onClick={generatePDF}>📄 Download PDF</Button>
      </Box>

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress color={darkMode ? "inherit" : "primary"} size={48} thickness={5} />
        </Box>
      ) : (
        <>
          {/* Schedule Table */}
          <ScheduleTable
            rows={paginatedSchedules}
            selectedSchedule={(data) => { setSelectedSchedule(data); setIsEdit(true); }}
            deleteSchedule={(data) => { setScheduleToDelete(data); setOpenDeleteDialog(true); }}
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
            />
          </Box>

          {/* Flight Map */}
          <Box sx={{ mt: 6, height: 450, borderRadius: 2, overflow: "hidden", border: "2px solid #1976d2" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>🌍 Flight Map</Typography>
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: "100%", height: "100%" }} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {flightCoords.map((f, index) => (
                <React.Fragment key={index}>
                  <Marker position={f.depCoords}><Popup>Departure: {f.flightName}</Popup></Marker>
                  <Marker position={f.arrCoords}><Popup>Arrival: {f.flightName}</Popup></Marker>
                  <Polyline positions={[f.depCoords, f.arrCoords]} color="blue" />
                </React.Fragment>
              ))}
            </MapContainer>
          </Box>

          {/* Bookings Table */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>✈️ Flight Bookings</Typography>
            <BooksTable
              rows={bookings}
              selectedBooking={(data) => console.log("Selected booking:", data)}
              deleteBooking={deleteBooking}
              darkMode={darkMode}
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
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle><WarningAmberIcon /> Delete Flight Schedule</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this flight schedule? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>No</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => { deleteSchedule(scheduleToDelete); setOpenDeleteDialog(false); }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedules;
