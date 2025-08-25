import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Axios from "axios";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

const Registers = () => {
  const [registers, setRegisters] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [loginProfile, setLoginProfile] = useState(null); // ✅ profile photo for login

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [registerToDelete, setRegisterToDelete] = useState(null);

  useEffect(() => {
    getRegisters();
  }, []);

  const getRegisters = () => {
    Axios.get("http://localhost:3001/api/registers")
      .then((response) => {
        setRegisters(response.data?.response || []);
      })
      .catch((error) => console.error("Axios error:", error));
  };

  const addRegister = (data) => {
    Axios.post("http://localhost:3001/api/createregister", data)
      .then(() => {
        getRegisters();
        setSubmitted(false);
        setSnackbar({ open: true, message: "User added successfully!", severity: "success" });
        setLoginProfile(data.profilePhoto); // ✅ save profile photo for login
        setShowLogin(true); // go to login
      })
      .catch((error) => {
        console.error("Axios error:", error);
        setSubmitted(false);
        setSnackbar({ open: true, message: "Failed to add user!", severity: "error" });
      });
  };

  const updateRegister = (data) => {
    Axios.post("http://localhost:3001/api/updateregister", data)
      .then(() => {
        getRegisters();
        setSubmitted(false);
        setIsEdit(false);
        setSelectedRegister({});
        setSnackbar({ open: true, message: "User updated successfully!", severity: "success" });
      })
      .catch((error) => {
        console.error("Axios error:", error);
        setSubmitted(false);
        setSnackbar({ open: true, message: "Failed to update user!", severity: "error" });
      });
  };

  const confirmDeleteRegister = (row) => {
    setRegisterToDelete(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (registerToDelete) {
      Axios.post("http://localhost:3001/api/deleteregister", registerToDelete)
        .then(() => {
          getRegisters();
          setSnackbar({ open: true, message: "User deleted successfully!", severity: "success" });
        })
        .catch((error) => {
          console.error("Axios error:", error);
          setSnackbar({ open: true, message: "Failed to delete user!", severity: "error" });
        })
        .finally(() => {
          setOpenDeleteDialog(false);
          setRegisterToDelete(null);
        });
    }
  };

  return (
    <Box sx={{ width: "calc(100% - 100px)", margin: "auto", marginTop: "50px" }}>
      {showLogin ? (
        <LoginForm
          onRegisterClick={() => setShowLogin(false)}
          profilePhoto={loginProfile} // ✅ pass profile photo
        />
      ) : (
        <RegisterForm
          addRegister={addRegister}
          updateRegister={updateRegister}
          submitted={submitted}
          data={selectedRegister}
          isEdit={isEdit}
          onLoginClick={() => setShowLogin(true)}
        />
      )}

      {!showLogin && (
        <>
          {registers.length === 0 ? (
            <Typography align="center" sx={{ mt: 5, color: "#666" }}>
              No users found.
            </Typography>
          ) : (
            <Grid container spacing={3} sx={{ marginTop: 3 }}>
              {registers.map((row) => (
                <Grid item xs={12} sm={6} md={4} key={row.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 2,
                      gap: 2,
                      minHeight: 150,
                    }}
                  >
                    <Avatar src={row.profilePhoto} alt={row.name} sx={{ width: 80, height: 80 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>{row.name}</Typography>
                      <Typography variant="body2"><strong>ID:</strong> {row.id}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {row.email}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {row.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button variant="outlined" size="small" startIcon={<EditIcon />}
                        onClick={() => { setSelectedRegister(row); setIsEdit(true); }}
                      >Edit</Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
                        onClick={() => confirmDeleteRegister(row)}
                      >Delete</Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{registerToDelete?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registers;
