import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Slider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";

import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { divIcon } from "leaflet";

import SheduleForm from "./ScheduleForm";
import ScheduleTable from "./ScheduleTable";
import BooksTable from "../Book/BooksTable";

import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import debounce from "lodash.debounce";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import FilterListIcon from '@mui/icons-material/FilterList';
import LayersIcon from '@mui/icons-material/Layers';
import TerrainIcon from '@mui/icons-material/Terrain';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import WeatherIcon from '@mui/icons-material/WbSunny';
import TrafficIcon from '@mui/icons-material/Traffic';
import AnimationIcon from '@mui/icons-material/Animation';
import SatelliteIcon from '@mui/icons-material/Satellite';

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

// Custom icons for departure and arrival
const createCustomIcon = (type) => {
  return divIcon({
    html: `<div style="background-color: ${type === 'departure' ? '#1976d2' : '#d32f2f'}; 
                  width: 24px; 
                  height: 24px; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${type === 'departure' ? '▲' : '▼'}
           </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Animated plane icon for flight paths
const createPlaneIcon = (angle) => {
  return divIcon({
    html: `<div style="transform: rotate(${angle}deg); 
                  width: 24px; 
                  height: 24px;
                  transition: transform 0.5s ease;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976d2">
              <path d="M10.18 9.16L5.3 4.28l-2.84 2.85 4.88 4.88-4.88 4.89 2.84 2.85 4.88-4.89 4.89 4.89 2.85-2.85-4.89-4.89 4.89-4.88-2.85-2.85-4.89 4.89z"/>
            </svg>
           </div>`,
    className: 'animated-plane',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map Layers Control Component
function MapLayersControl({ darkMode, layers, onLayerChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Map layers">
        <IconButton 
          onClick={handleClick}
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            zIndex: 1000,
            backgroundColor: darkMode ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(50,50,50,0.9)' : 'rgba(240,240,240,0.9)',
            }
          }}
        >
          <LayersIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#e0e0e0' : '#222',
          }
        }}
      >
        <MenuItem onClick={() => onLayerChange('base', darkMode ? 'dark' : 'standard')}>
          <ListItemIcon>
            <SatelliteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{darkMode ? 'Dark Map' : 'Standard Map'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onLayerChange('terrain', layers.terrain ? false : true)}>
          <ListItemIcon>
            <TerrainIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Terrain {layers.terrain ? '✓' : ''}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onLayerChange('weather', layers.weather ? false : true)}>
          <ListItemIcon>
            <WeatherIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Weather {layers.weather ? '✓' : ''}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onLayerChange('animation', layers.animation ? false : true)}>
          <ListItemIcon>
            <AnimationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Flight Animation {layers.animation ? '✓' : ''}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

// Map Controller Component
function MapController({ center, zoom, bounds, selectedFlight }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, bounds]);

  useEffect(() => {
    if (selectedFlight && selectedFlight.depCoords && selectedFlight.arrCoords) {
      const flightBounds = L.latLngBounds([selectedFlight.depCoords, selectedFlight.arrCoords]);
      map.fitBounds(flightBounds, { padding: [100, 100] });
    }
  }, [map, selectedFlight]);

  return null;
}

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
  const [flightCoords, setFlightCoords] = useState([]);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [mapTab, setMapTab] = useState(0);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  
  // New state variables for enhanced map features
  const [mapLayers, setMapLayers] = useState({
    terrain: false,
    weather: false,
    animation: true,
    base: 'standard'
  });
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

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

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coords1, coords2) => {
    if (!coords1 || !coords2) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate bearing between two coordinates
  const calculateBearing = (start, end) => {
    if (!start || !end) return 0;
    
    const startLat = start[0] * Math.PI / 180;
    const startLng = start[1] * Math.PI / 180;
    const endLat = end[0] * Math.PI / 180;
    const endLng = end[1] * Math.PI / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
              
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Calculate intermediate point along the flight path
  const calculateIntermediatePoint = (start, end, progress) => {
    if (!start || !end) return null;
    
    const lat1 = start[0] * Math.PI / 180;
    const lon1 = start[1] * Math.PI / 180;
    const lat2 = end[0] * Math.PI / 180;
    const lon2 = end[1] * Math.PI / 180;
    
    const d = Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
                       Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    
    if (d === 0) return start;
    
    const A = Math.sin((1 - progress) * d) / Math.sin(d);
    const B = Math.sin(progress * d) / Math.sin(d);
    
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    
    const lat = Math.atan2(z, Math.sqrt(x*x + y*y)) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;
    
    return [lat, lon];
  };

  useEffect(() => {
    const fetchFlightCoords = async () => {
      const coordsArray = [];
      for (const flight of sortedSchedules) {
        const depCoords = await getCoordinates(flight.departure);
        const arrCoords = await getCoordinates(flight.arrival);
        if (depCoords && arrCoords) {
          const distance = calculateDistance(depCoords, arrCoords);
          const bearing = calculateBearing(depCoords, arrCoords);
          coordsArray.push({ 
            ...flight, 
            depCoords, 
            arrCoords, 
            distance: Math.round(distance),
            bearing
          });
        }
      }
      setFlightCoords(coordsArray);
      
      // Set map bounds to show all flights
      if (coordsArray.length > 0) {
        const allCoords = coordsArray.flatMap(f => [f.depCoords, f.arrCoords]);
        const bounds = L.latLngBounds(allCoords);
        setMapBounds(bounds);
        
        // Set initial center and zoom based on bounds
        setMapCenter(bounds.getCenter());
        setMapZoom(2);
      }
    };
    fetchFlightCoords();
  }, [sortedSchedules]);

  // Handle flight path animation
  useEffect(() => {
    if (mapLayers.animation) {
      animationRef.current = requestAnimationFrame(() => {
        setAnimationProgress(prev => (prev >= 1 ? 0 : prev + 0.005));
      });
      
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [mapLayers.animation, animationProgress]);

  // Fit map to show all flights
  const handleFitBounds = () => {
    if (mapBounds) {
      setMapCenter(mapBounds.getCenter());
      setMapZoom(2);
    }
  };

  // Reset to default view
  const handleResetView = () => {
    setMapCenter([20, 0]);
    setMapZoom(2);
    setSelectedFlight(null);
  };

  // Focus on a specific flight
  const handleFocusFlight = (flight) => {
    if (flight.depCoords && flight.arrCoords) {
      const bounds = L.latLngBounds([flight.depCoords, flight.arrCoords]);
      setMapCenter(bounds.getCenter());
      setMapZoom(4);
      setSelectedFlight(flight);
    }
  };

  // Handle layer changes
  const handleLayerChange = (layer, value) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: value
    }));
  };

  // Get appropriate tile layer based on settings
  const getTileLayer = () => {
    if (mapLayers.base === 'dark') {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    } else if (mapLayers.terrain) {
      return "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    }
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  };

  // Render animated planes along flight paths
  const renderAnimatedPlanes = () => {
    if (!mapLayers.animation) return null;
    
    return flightCoords.map((flight, index) => {
      const intermediatePoint = calculateIntermediatePoint(
        flight.depCoords, 
        flight.arrCoords, 
        animationProgress
      );
      
      if (!intermediatePoint) return null;
      
      return (
        <Marker
          key={`plane-${index}`}
          position={intermediatePoint}
          icon={createPlaneIcon(flight.bearing)}
          zIndexOffset={1000}
        >
          <Popup>
            <Typography variant="subtitle2">{flight.flightName}</Typography>
            <Typography variant="body2">
              {flight.departure} → {flight.arrival}
            </Typography>
            <Typography variant="body2">
              Status: In Flight
            </Typography>
          </Popup>
        </Marker>
      );
    });
  };

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
            onFocusFlight={handleFocusFlight}
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

          {/* Flight Map Section */}
          <Box sx={{ mt: 6, borderRadius: 2, overflow: "hidden", border: "2px solid #1976d2" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: darkMode ? '#1e1e1e' : '#e3f2fd' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                🌍 Flight Map
                <Chip 
                  label={`${flightCoords.length} flights displayed`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 2 }} 
                />
              </Typography>
              
              <Box>
                <Tooltip title="Fit to all flights">
                  <IconButton onClick={handleFitBounds} size="small" sx={{ mr: 1 }}>
                    <ZoomInMapIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset view">
                  <IconButton onClick={handleResetView} size="small">
                    <MyLocationIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Tabs value={mapTab} onChange={(e, newValue) => setMapTab(newValue)} sx={{ px: 2, pt: 1 }}>
              <Tab label="Map View" />
              <Tab label="Flight List" />
            </Tabs>
            
            {mapTab === 0 ? (
              <Box sx={{ height: 500, position: 'relative' }}>
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ width: "100%", height: "100%" }} 
                  scrollWheelZoom={true}
                  zoomControl={false}
                  whenReady={() => setMapReady(true)}
                >
                  <MapController 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    bounds={mapBounds}
                    selectedFlight={selectedFlight}
                  />
                  
                  <ZoomControl position="bottomright" />
                  
                  {/* Base Tile Layer */}
                  <TileLayer
                    url={getTileLayer()}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Flight Paths and Markers */}
                  {flightCoords.map((flight, index) => (
                    <React.Fragment key={index}>
                      <Marker 
                        position={flight.depCoords} 
                        icon={createCustomIcon('departure')}
                        eventHandlers={{
                          click: () => handleFocusFlight(flight)
                        }}
                      >
                        <Popup>
                          <Box>
                            <Typography variant="subtitle2">{flight.flightName}</Typography>
                            <Typography variant="body2">
                              <FlightTakeoffIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                              Departure: {flight.departure}
                            </Typography>
                            <Typography variant="body2">
                              <FlightLandIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                              Arrival: {flight.arrival}
                            </Typography>
                            <Typography variant="body2">
                              Distance: {flight.distance} km
                            </Typography>
                            <Button 
                              size="small" 
                              sx={{ mt: 1 }}
                              onClick={() => handleFocusFlight(flight)}
                            >
                              Focus on this flight
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                      <Marker 
                        position={flight.arrCoords} 
                        icon={createCustomIcon('arrival')}
                        eventHandlers={{
                          click: () => handleFocusFlight(flight)
                        }}
                      >
                        <Popup>
                          <Box>
                            <Typography variant="subtitle2">{flight.flightName}</Typography>
                            <Typography variant="body2">
                              <FlightTakeoffIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                              Departure: {flight.departure}
                            </Typography>
                            <Typography variant="body2">
                              <FlightLandIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                              Arrival: {flight.arrival}
                            </Typography>
                            <Typography variant="body2">
                              Distance: {flight.distance} km
                            </Typography>
                            <Button 
                              size="small" 
                              sx={{ mt: 1 }}
                              onClick={() => handleFocusFlight(flight)}
                            >
                              Focus on this flight
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                      <Polyline 
                        positions={[flight.depCoords, flight.arrCoords]} 
                        color={selectedFlight === flight ? "#ffeb3b" : "#1976d2"} 
                        weight={selectedFlight === flight ? 4 : 2}
                        eventHandlers={{
                          click: () => handleFocusFlight(flight)
                        }}
                      />
                    </React.Fragment>
                  ))}
                  
                  {/* Animated Planes */}
                  {mapReady && renderAnimatedPlanes()}
                  
                  {/* Layer Control */}
                  <MapLayersControl 
                    darkMode={darkMode} 
                    layers={mapLayers} 
                    onLayerChange={handleLayerChange} 
                  />
                </MapContainer>
                
                {selectedFlight && (
                  <Card sx={{ position: 'absolute', top: 10, right: 10, maxWidth: 300, zIndex: 1000 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedFlight.flightName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <FlightTakeoffIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                        {selectedFlight.departure} → {selectedFlight.arrival}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Departure: {selectedFlight.dtime}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Arrival: {selectedFlight.atime}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Distance: {selectedFlight.distance} km
                      </Typography>
                      <Button 
                        size="small" 
                        onClick={() => setSelectedFlight(null)}
                        sx={{ mt: 1 }}
                      >
                        Close
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* Animation Controls */}
                {mapLayers.animation && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 10, 
                    left: 10, 
                    zIndex: 1000, 
                    backgroundColor: darkMode ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
                    borderRadius: 1,
                    p: 1,
                    width: 200
                  }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Flight Animation Speed
                    </Typography>
                    <Slider
                      size="small"
                      value={animationProgress * 100}
                      onChange={(e, value) => setAnimationProgress(value / 100)}
                      aria-label="Animation speed"
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                {flightCoords.map((flight, index) => (
                  <Card 
                    key={index} 
                    sx={{ 
                      mb: 1, 
                      cursor: 'pointer', 
                      bgcolor: selectedFlight === flight ? (darkMode ? '#333' : '#e3f2fd') : 'inherit' 
                    }}
                    onClick={() => handleFocusFlight(flight)}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{flight.flightName}</Typography>
                        <Chip label={`${flight.distance} km`} size="small" />
                      </Box>
                      <Typography variant="body2">
                        <FlightTakeoffIcon sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                        {flight.departure} → {flight.arrival}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
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