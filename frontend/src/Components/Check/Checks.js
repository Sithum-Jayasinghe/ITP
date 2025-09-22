import { Box, Typography, TextField, Button } from "@mui/material";
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

  useEffect(() => {
    fetchChecks();
    fetchUsers();
  }, []);

  const fetchChecks = () => {
    Axios.get("http://localhost:3001/api/checks")
      .then((res) => setChecks(res.data?.response || []))
      .catch(console.error);
  };

  const fetchUsers = () => {
    Axios.get("http://localhost:3001/api/registers")
      .then((res) => setUsers(res.data?.response || []))
      .catch(console.error);
  };

  const addCheck = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createcheck", data)
      .then(() => {
        fetchChecks();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(console.error);
  };

  const updateCheck = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatecheck", data)
      .then(() => {
        fetchChecks();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch(console.error);
  };

  const deleteCheck = (data) => {
    Axios.post("http://localhost:3001/api/deletecheck", data)
      .then(() => fetchChecks())
      .catch(console.error);
  };

  // Download  all checks as CSV
  const downloadAllChecks = () => {
    const headers = "Check ID,Passenger Name,Passport Number,Nationality,Flight Number,Seat Number,Status\n";
    const csvContent = checks.reduce((acc, check) => {
      return acc + `${check.checkId},${check.passengerName},${check.passportNumber},${check.nationality},${check.flightNumber},${check.seatNumber},${check.status}\n`;
    }, headers);
    
    const element = document.createElement("a");
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `all_checks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        <Box sx={{ my: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        {/* Check Form   */}
        
        <CheckForm
          addCheck={addCheck}
          updateCheck={updateCheck}
          submitted={submitted}
          data={selectedCheck}
          isEdit={isEdit}
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
    </Box>
  );
};

export default Checks;