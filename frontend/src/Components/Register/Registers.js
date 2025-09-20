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
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import Axios from "axios";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import V1 from "../Images/go.mp4";

const Registers = () => {
  const [registers, setRegisters] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginProfile, setLoginProfile] = useState(null);

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
        setSnackbar({
          open: true,
          message: "User added successfully!",
          severity: "success",
        });
        setLoginProfile(data.profilePhoto);
        setShowLogin(true);
      })
      .catch((error) => {
        console.error("Axios error:", error);
        setSubmitted(false);
        setSnackbar({
          open: true,
          message: "Failed to add user!",
          severity: "error",
        });
      });
  };

  const updateRegister = (data) => {
    Axios.post("http://localhost:3001/api/updateregister", data)
      .then(() => {
        getRegisters();
        setSubmitted(false);
        setIsEdit(false);
        setSelectedRegister({});
        setSnackbar({
          open: true,
          message: "User updated successfully!",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Axios error:", error);
        setSubmitted(false);
        setSnackbar({
          open: true,
          message: "Failed to update user!",
          severity: "error",
        });
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
          setSnackbar({
            open: true,
            message: "User deleted successfully!",
            severity: "success",
          });
        })
        .catch((error) => {
          console.error("Axios error:", error);
          setSnackbar({
            open: true,
            message: "Failed to delete user!",
            severity: "error",
          });
        })
        .finally(() => {
          setOpenDeleteDialog(false);
          setRegisterToDelete(null);
        });
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* 🔹 Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(6px) brightness(0.6)",
          zIndex: -1,
        }}
      >
        <source src={V1} type="video/mp4" />
      </video>

      {/* 🔹 Main container with frosted effect */}
      <Box
        sx={{
          width: "80%",
          maxWidth: "1000px",
          margin: "auto",
          pt: 6,
          pb: 6,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {/* Airline branding header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <FlightTakeoffIcon sx={{ fontSize: 50, color: "#1a2a6c" }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#fff",
                mt: 1,
                textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              AirGo Registration
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#ddd" }}>
              Create your account to book and manage flights
            </Typography>
          </Box>

          {/* Show Login or Register form */}
          {showLogin ? (
            <LoginForm
              onRegisterClick={() => setShowLogin(false)}
              profilePhoto={loginProfile}
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

          {/* Registered users list */}
          {!showLogin && (
            <>
              {registers.length === 0 ? (
                <Typography align="center" sx={{ mt: 5, color: "#fff" }}>
                  No users found.
                </Typography>
              ) : (
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  {registers.map((row) => (
                    <Grid item xs={12} sm={6} md={4} key={row.id}>
                      <Paper
                        elevation={4}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.9)",
                          textAlign: "center",
                          transition: "all 0.3s",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                          },
                        }}
                      >
                        <Avatar
                          src={row.profilePhoto}
                          alt={row.name}
                          sx={{ width: 80, height: 80, margin: "auto", mb: 2 }}
                        />
                        <Typography variant="h6">{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.phone}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setSelectedRegister(row);
                              setIsEdit(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => confirmDeleteRegister(row)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Paper>

        {/* Delete Confirmation */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <strong>{registerToDelete?.name}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Alerts */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Registers;
