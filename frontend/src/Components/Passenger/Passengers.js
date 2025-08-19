import { Box, TextField, InputAdornment, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import PassengerForm from "./PassengerForm";
import PassengersTable from "./PassengersTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

const Passengers = () => {
  const [passengers, setPassengers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passengerToDelete, setPassengerToDelete] = useState(null);

  useEffect(() => { getPassengers(); }, []);

  const getPassengers = () => {
    Axios.get("http://localhost:3001/api/passengers")
      .then(res => setPassengers(res.data?.response || []))
      .catch(console.error);
  };

  const addPassenger = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createpassenger", data)
      .then(() => { getPassengers(); setSubmitted(false); setIsEdit(false); })
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

  const handleDelete = () => {
    Axios.post("http://localhost:3001/api/deletepassenger", { id: passengerToDelete.id })
      .then(() => { getPassengers(); showAlert("Passenger Deleted Successfully", "error"); })
      .catch(console.error)
      .finally(() => { setDeleteDialogOpen(false); setPassengerToDelete(null); });
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const filteredPassengers = passengers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ width: "90%", margin: "auto", marginTop: "50px" }}>
      <TextField
        placeholder="Search by Name"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      <PassengerForm
        addPassenger={addPassenger}
        updatePassenger={updatePassenger}
        submitted={submitted}
        data={selectedPassenger}
        isEdit={isEdit}
        showAlert={showAlert}
      />

      <PassengersTable
        rows={filteredPassengers}
        selectedPassenger={(data) => { setSelectedPassenger(data); setIsEdit(true); }}
        deletePassenger={confirmDelete}
      />

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
