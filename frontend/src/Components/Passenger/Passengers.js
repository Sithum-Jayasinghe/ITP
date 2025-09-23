import { 
  Box, TextField, InputAdornment, Snackbar, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Typography, Chip, IconButton, 
  Paper, Card, CardContent, Grid 
} from "@mui/material";
import PassengerForm from "./PassengerForm";
import PassengersTable from "./PassengersTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../Main/Header";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import RefreshIcon from "@mui/icons-material/Refresh";
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import ConveyorBeltIcon from '@mui/icons-material/CompareArrows';
import SecurityIcon from '@mui/icons-material/Security';

const Passengers = () => {
  const [passengers, setPassengers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [luggageStatus, setLuggageStatus] = useState({});
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedLuggage, setSelectedLuggage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);

  useEffect(() => { 
    getPassengers(); 
    // Start polling for luggage status updates
    const interval = setInterval(getLuggageStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getPassengers = () => {
    Axios.get("http://localhost:3001/api/passengers")
      .then(res => {
        setPassengers(res.data?.response || []);
        // Initialize luggage status for each passenger
        const initialStatus = {};
        res.data?.response?.forEach(passenger => {
          initialStatus[passenger.id] = {
            status: "Checked In",
            lastScan: new Date().toISOString(),
            location: "Check-in"
          };
        });
        setLuggageStatus(initialStatus);
      })
      .catch(error => {
        console.error("Error fetching passengers:", error);
        // Initialize with empty array if API fails
        setPassengers([]);
      });
  };

  const getLuggageStatus = () => {
    // Simulate IoT-based luggage tracking
    const updatedStatus = { ...luggageStatus };
    Object.keys(updatedStatus).forEach(passengerId => {
      const status = updatedStatus[passengerId];
      // Simulate status changes
      if (status.status === "Checked In" && Math.random() > 0.7) {
        status.status = "In Transit";
        status.location = "Conveyor Belt";
      } else if (status.status === "In Transit" && Math.random() > 0.6) {
        status.status = "Loaded";
        status.location = "Loading Area";
      } else if (status.status === "Loaded" && Math.random() > 0.5) {
        status.status = "Arrived";
        status.location = "Baggage Claim";
      }
      status.lastScan = new Date().toISOString();
    });
    setLuggageStatus(updatedStatus);
  };

  // 3D Airport Hall Component
  const AirportHall3D = () => {
    // Areas in our airport with 3D positioning
    const areas = [
      { id: 'checkin', name: 'Check-in', x: 10, y: 80, width: 120, height: 60, color: 'primary.light' },
      { id: 'security', name: 'Security', x: 150, y: 80, width: 100, height: 60, color: 'warning.light' },
      { id: 'conveyor', name: 'Conveyor Belt', x: 270, y: 80, width: 180, height: 60, color: 'info.light' },
      { id: 'loading', name: 'Loading', x: 470, y: 80, width: 100, height: 60, color: 'secondary.light' },
      { id: 'aircraft', name: 'Aircraft', x: 590, y: 80, width: 100, height: 60, color: 'success.light' },
      { id: 'claim', name: 'Baggage Claim', x: 270, y: 200, width: 180, height: 60, color: 'primary.main' },
    ];

    // Luggage items with 3D positioning
    const luggageItems = passengers.map(passenger => {
      const status = luggageStatus[passenger.id] || { status: "Unknown", location: "Unknown" };
      
      // Map location to area coordinates
      let area = areas.find(a => a.name.includes(status.location)) || areas[0];
      
      return {
        id: passenger.id,
        name: passenger.name,
        status: status.status,
        x: area.x + Math.random() * area.width,
        y: area.y + Math.random() * area.height,
        color: status.status === "Checked In" ? "primary.main" :
               status.status === "In Transit" ? "info.main" :
               status.status === "Loaded" ? "warning.main" :
               status.status === "Arrived" ? "success.main" : "grey.500"
      };
    });

    return (
      <Paper elevation={3} sx={{ p: 2, mt: 2, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
        <Typography variant="h6" gutterBottom>
          3D Airport Hall - Luggage Tracking
        </Typography>
        
        {/* Airport Hall Visualization */}
        <Box sx={{ 
          position: 'relative', 
          height: 300, 
          width: '100%',
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}>
          {/* Floor with grid pattern for 3D effect */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: `
              linear-gradient(90deg, transparent 24px, #f5f5f5 25px, #f5f5f5 26px, transparent 27px, transparent 74px, #f5f5f5 75px, #f5f5f5 76px, transparent 77px),
              linear-gradient(180deg, transparent 24px, #f5f5f5 25px, #f5f5f5 26px, transparent 27px, transparent 74px, #f5f5f5 75px, #f5f5f5 76px, transparent 77px),
              linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0),
              linear-gradient(45deg, #e0e0e0 25%, transparent 25%, transparent 75%, #e0e0e0 75%, #e0e0e0)
            `,
            backgroundSize: '100px 100px, 100px 100px, 100px 100px, 100px 100px',
            backgroundPosition: '0 0, 0 0, 0 0, 50px 50px',
            transform: 'rotateX(60deg)',
            transformOrigin: 'bottom',
            borderTop: '2px solid #bdbdbd'
          }} />
          
          {/* Airport Areas */}
          {areas.map(area => (
            <Paper
              key={area.id}
              elevation={2}
              sx={{
                position: 'absolute',
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
                bgcolor: area.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotateX(45deg)',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  color: 'white'
                }
              }}
            >
              <Typography variant="caption" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {area.name}
              </Typography>
            </Paper>
          ))}
          
          {/* Luggage Items */}
          {luggageItems.map(luggage => (
            <Box
              key={luggage.id}
              onClick={() => {
                const passenger = passengers.find(p => p.id === luggage.id);
                if (passenger) viewLuggageStatus(passenger);
              }}
              sx={{
                position: 'absolute',
                left: luggage.x,
                top: luggage.y,
                width: 20,
                height: 12,
                bgcolor: luggage.color,
                border: '1px solid #333',
                borderRadius: '2px',
                transform: 'rotateX(45deg)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'rotateX(45deg) scale(1.5)',
                  zIndex: 100
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -5,
                  left: 5,
                  width: 10,
                  height: 5,
                  bgcolor: luggage.color,
                  border: '1px solid #333',
                  borderRadius: '2px 2px 0 0'
                }
              }}
            />
          ))}
          
          {/* Legend */}
          <Paper sx={{ position: 'absolute', top: 10, right: 10, p: 1, background: 'rgba(255,255,255,0.8)' }}>
            <Typography variant="caption" fontWeight="bold">Status Legend</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 8, bgcolor: 'primary.main', mr: 0.5 }} />
                <Typography variant="caption">Checked In</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 8, bgcolor: 'info.main', mr: 0.5 }} />
                <Typography variant="caption">In Transit</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 8, bgcolor: 'warning.main', mr: 0.5 }} />
                <Typography variant="caption">Loaded</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 8, bgcolor: 'success.main', mr: 0.5 }} />
                <Typography variant="caption">Arrived</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        {/* Statistics */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <FlightTakeoffIcon color="primary" />
                <Typography variant="h6">{luggageItems.filter(l => l.status === "Checked In").length}</Typography>
                <Typography variant="body2">Checked In</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <ConveyorBeltIcon color="info" />
                <Typography variant="h6">{luggageItems.filter(l => l.status === "In Transit").length}</Typography>
                <Typography variant="body2">In Transit</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SecurityIcon color="warning" />
                <Typography variant="h6">{luggageItems.filter(l => l.status === "Loaded").length}</Typography>
                <Typography variant="body2">Loaded</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <FlightLandIcon color="success" />
                <Typography variant="h6">{luggageItems.filter(l => l.status === "Arrived").length}</Typography>
                <Typography variant="body2">Arrived</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Add a new passenger
  const addPassenger = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createpassenger", data)
      .then(() => { 
        getPassengers(); 
        setSubmitted(false); 
        setIsEdit(false); 
        // Initialize luggage status for new passenger
        setLuggageStatus(prev => ({
          ...prev,
          [data.id]: {
            status: "Checked In",
            lastScan: new Date().toISOString(),
            location: "Check-in"
          }
        }));
      })
      .catch(error => {
        console.error("Error adding passenger:", error);
        setSubmitted(false);
      });
  };

  const updatePassenger = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatepassenger", data)
      .then(() => { 
        getPassengers(); 
        setSubmitted(false); 
        setIsEdit(false); 
      })
      .catch(error => {
        console.error("Error updating passenger:", error);
        setSubmitted(false);
      });
  };

  const showAlert = (message, severity) => setAlert({ open: true, message, severity });

  const confirmDelete = (data) => {
    setPassengerToDelete(data);
    setDeleteDialogOpen(true);
  };
  
  // Handle passenger deletion after confirmation
  const handleDelete = () => {
    Axios.post("http://localhost:3001/api/deletepassenger", { id: passengerToDelete.id })
      .then(() => { 
        getPassengers(); 
        showAlert("Passenger Deleted Successfully", "success"); 
        // Remove luggage status for deleted passenger
        setLuggageStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[passengerToDelete.id];
          return newStatus;
        });
      })
      .catch(error => {
        console.error("Error deleting passenger:", error);
        showAlert("Error deleting passenger", "error");
      })
      .finally(() => { 
        setDeleteDialogOpen(false); 
        setPassengerToDelete(null); 
      });
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const viewLuggageStatus = (passenger) => {
    setSelectedLuggage({
      ...passenger,
      status: luggageStatus[passenger.id] || {
        status: "Unknown",
        lastScan: "N/A",
        location: "Unknown"
      }
    });
    setTrackingDialogOpen(true);
  };

  const refreshLuggageStatus = () => {
    getLuggageStatus();
    showAlert("Luggage status refreshed", "info");
  };

  const filteredPassengers = passengers.filter(p => 
    p.name && p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add luggage status to passengers for display in table
  const passengersWithLuggageStatus = filteredPassengers.map(passenger => ({
    ...passenger,
    luggageStatus: luggageStatus[passenger.id]?.status || "Unknown"
  }));

  return (
    <Box sx={{ width: "90%", margin: "auto", marginTop: "50px" }}>
      {/* Header Added */}
      <Header />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <TextField
          placeholder="Search by Name"
          sx={{ width: "50%" }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={refreshLuggageStatus}
        >
          Refresh Luggage Status
        </Button>
      </Box>

      {/* 3D Airport Hall Component */}
      <AirportHall3D />

      <PassengerForm
        addPassenger={addPassenger}
        updatePassenger={updatePassenger}
        submitted={submitted}
        data={selectedPassenger}
        isEdit={isEdit}
        showAlert={showAlert}
      />

      <PassengersTable
        rows={passengersWithLuggageStatus}
        selectedPassenger={(data) => { setSelectedPassenger(data); setIsEdit(true); }}
        deletePassenger={confirmDelete}
        viewLuggageStatus={viewLuggageStatus}
      />

      {/* Luggage Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <TravelLuggageIcon sx={{ mr: 1 }} />
          Luggage Tracking - {selectedLuggage?.name}
        </DialogTitle>
        <DialogContent>
          {selectedLuggage && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Passenger:</strong> {selectedLuggage.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Passenger ID:</strong> {selectedLuggage.id}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  <strong>Status:</strong>
                </Typography>
                <Chip 
                  label={selectedLuggage.status.status} 
                  color={
                    selectedLuggage.status.status === "Checked In" ? "default" :
                    selectedLuggage.status.status === "In Transit" ? "primary" :
                    selectedLuggage.status.status === "Loaded" ? "warning" :
                    selectedLuggage.status.status === "Arrived" ? "success" : "error"
                  }
                />
              </Box>
              <Typography variant="body1" gutterBottom>
                <strong>Last Scan:</strong> {new Date(selectedLuggage.status.lastScan).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Current Location:</strong> {selectedLuggage.status.location}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Passenger</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete passenger <b>{passengerToDelete?.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Passengers;