import { Box, Typography, TextField } from "@mui/material";
import CheckForm from "./CheckForm";
import ChecksTable from "./ChecksTable";
import RegistersTable from "../Register/RegistersTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import Header from "../Main/Header";

const Checks = () => {
  const [checks, setChecks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(""); // ✅ search state

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

  // ✅ Filter checks based on search
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

        {/* Search bar */}
        <Box sx={{ my: 3, textAlign: "center" }}>
          <TextField
            label="🔍 Search Check-Ins"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: "60%" }}
          />
        </Box>

        {/* Check Form */}
        <CheckForm
          addCheck={addCheck}
          updateCheck={updateCheck}
          submitted={submitted}
          data={selectedCheck}
          isEdit={isEdit}
        />

        {/* Checks Table */}
        <ChecksTable
          rows={filteredChecks} // ✅ pass filtered rows
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
