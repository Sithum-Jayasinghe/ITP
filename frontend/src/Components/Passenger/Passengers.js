import { Box, TextField, InputAdornment, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Chip, IconButton } from "@mui/material";
import PassengerForm from "./PassengerForm";
import PassengersTable from "./PassengersTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../Main/Header";
import TravelLuggageIcon from "@mui/icons-material/Luggage";
import RefreshIcon from "@mui/icons-material/Refresh";

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
            location: "Baggage Handling Area"
          };
        });
        setLuggageStatus(initialStatus);
      })
      .catch(console.error);
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
        status.location = "Aircraft Cargo";
      } else if (status.status === "Loaded" && Math.random() > 0.5) {
        status.status = "Arrived";
        status.location = "Baggage Claim";
      }
      status.lastScan = new Date().toISOString();
    });
    setLuggageStatus(updatedStatus);
  };

  //Update an existing passenger//
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
            location: "Baggage Handling Area"
          }
        }));
      })
      .catch(console.error);
  };

  const updatePassenger = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatepassenger", data)
      .then(() => { getPassengers(); setSubmitted(false); setIsEdit(false); })
      .catch(console.error);
  };

  const showAlert = (message, severity) => setAlert({ open: true, message, severity });

  const confirmDelete = (data) => {
    setPassengerToDelete(data);
    setDeleteDialogOpen(true);
  };
  
  //Handle passenger deletion after confirmation//
  const handleDelete = () => {
    Axios.post("http://localhost:3001/api/deletepassenger", { id: passengerToDelete.id })
      .then(() => { 
        getPassengers(); 
        showAlert("Passenger Deleted Successfully", "error"); 
        // Remove luggage status for deleted passenger
        setLuggageStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[passengerToDelete.id];
          return newStatus;
        });
      })
      .catch(console.error)
      .finally(() => { setDeleteDialogOpen(false); setPassengerToDelete(null); });
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

  const filteredPassengers = passengers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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
                <strong>Flight:</strong> {selectedLuggage.flightNumber || "N/A"}
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