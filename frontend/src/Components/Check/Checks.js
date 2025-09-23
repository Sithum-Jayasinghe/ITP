import { Box, Typography, TextField, Button, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import CheckForm from "./CheckForm";
import ChecksTable from "./ChecksTable";
import RegistersTable from "../Register/RegistersTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import Header from "../Main/Header";
import DownloadIcon from "@mui/icons-material/Download";

const Checks = () => {
  const [checks, setChecks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchChecks();
    fetchUsers();
  }, []);

  const fetchChecks = () => {
    Axios.get("http://localhost:3001/api/checks")
      .then((res) => {
        const checksData = res.data?.response || [];
        // Enhance check data with user profile photos
        const enhancedChecks = checksData.map(check => {
          const user = users.find(u => u.name === check.passengerName);
          return {
            ...check,
            profilePhoto: user?.profilePhoto || ""
          };
        });
        setChecks(enhancedChecks);
      })
      .catch(() =>
        setSnackbar({
          open: true,
          message: "❌ Failed to fetch check-ins",
          severity: "error",
        })
      );
  };

  const fetchUsers = () => {
    Axios.get("http://localhost:3001/api/registers")
      .then((res) => {
        const usersData = res.data?.response || [];
        setUsers(usersData);
        // After fetching users, also refresh checks to include profile photos
        fetchChecks();
      })
      .catch(() =>
        setSnackbar({
          open: true,
          message: "❌ Failed to fetch registered users",
          severity: "error",
        })
      );
  };

  const addCheck = (data) => {
    setSubmitted(true);
    
    // Find user profile photo based on passenger name
    const user = users.find(u => u.name === data.passengerName);
    const checkDataWithPhoto = {
      ...data,
      profilePhoto: user?.profilePhoto || ""
    };

    Axios.post("http://localhost:3001/api/createcheck", checkDataWithPhoto)
      .then(() => {
        fetchChecks();
        setSubmitted(false);
        setIsEdit(false);
        setSnackbar({
          open: true,
          message: "✅ Check-in added successfully!",
          severity: "success",
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "❌ Failed to add check-in",
          severity: "error",
        });
      });
  };

  const updateCheck = (data) => {
    setSubmitted(true);
    
    // Find user profile photo based on passenger name
    const user = users.find(u => u.name === data.passengerName);
    const checkDataWithPhoto = {
      ...data,
      profilePhoto: user?.profilePhoto || ""
    };

    Axios.post("http://localhost:3001/api/updatecheck", checkDataWithPhoto)
      .then(() => {
        fetchChecks();
        setSubmitted(false);
        setIsEdit(false);
        setSnackbar({
          open: true,
          message: "✏️ Check-in updated successfully!",
          severity: "info",
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "❌ Failed to update check-in",
          severity: "error",
        });
      });
  };

  const deleteCheck = (data) => {
    Axios.post("http://localhost:3001/api/deletecheck", data)
      .then(() => {
        fetchChecks();
        setSnackbar({
          open: true,
          message: "🗑️ Check-in deleted successfully!",
          severity: "error",
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "❌ Failed to delete check-in",
          severity: "error",
        });
      });
  };

  // Download all checks as CSV
  const downloadAllChecks = () => {
    if (checks.length === 0) return;

    const headers =
      "Check ID,Passenger Name,Passport Number,Nationality,Flight Number,Seat Number,Status,Profile Photo\n";
    const csvContent = checks.reduce((acc, check) => {
      return (
        acc +
        `${check.checkId},${check.passengerName},${check.passportNumber},${check.nationality},${check.flightNumber},${check.seatNumber},${check.status},${check.profilePhoto || "No Photo"}\n`
      );
    }, headers);

    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = `all_checks_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setSnackbar({
      open: true,
      message: "📄 All check-ins exported successfully!",
      severity: "success",
    });
  };

  // Filter checks based on search
  const filteredChecks = checks.filter(
    (check) =>
      check.flightNumber?.toLowerCase().includes(search.toLowerCase()) ||
      check.passengerName?.toLowerCase().includes(search.toLowerCase()) ||
      check.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Header */}
      <Header />

      <Box sx={{ width: "calc(100% - 80px)", mx: "auto", mt: 5 }}>
        <Typography variant="h4" mb={3} textAlign="center">
          🛫 Airline Check-In System
        </Typography>

        {/* Register users table */}
        <RegistersTable />

        {/* Search and Download section */}
        <Box
          sx={{
            my: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            label="🔍 Search Check-Ins"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "60%" }}
          />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadAllChecks}
            disabled={checks.length === 0}
          >
            Download All Checks
          </Button>
        </Box>

        {/* Check Form */}
        <CheckForm
          addCheck={addCheck}
          updateCheck={updateCheck}
          submitted={submitted}
          data={selectedCheck}
          isEdit={isEdit}
          users={users} // Pass users data to CheckForm
        />

        {/* Checks Table */}
        <ChecksTable
          rows={filteredChecks}
          users={users}
          selectedCheck={(data) => {
            setSelectedCheck(data);
            setIsEdit(true);
          }}
          deleteCheck={(data) =>
            window.confirm("Are you sure to delete?") && deleteCheck(data)
          }
        />
      </Box>

      {/* Modern Snackbar */}
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
    </Box>
  );
};

export default Checks;