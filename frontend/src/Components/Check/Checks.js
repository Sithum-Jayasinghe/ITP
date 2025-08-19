import { Box, Typography } from "@mui/material";
import CheckForm from "./CheckForm";
import ChecksTable from "./ChecksTable";
import RegistersTable from "../Register/RegistersTable";
import Axios from "axios";
import { useEffect, useState } from "react";

const Checks = () => {
  const [checks, setChecks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [users, setUsers] = useState([]);

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
      .then(() => { fetchChecks(); setSubmitted(false); setIsEdit(false); })
      .catch(console.error);
  };

  const updateCheck = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatecheck", data)
      .then(() => { fetchChecks(); setSubmitted(false); setIsEdit(false); })
      .catch(console.error);
  };

  const deleteCheck = (data) => {
    Axios.post("http://localhost:3001/api/deletecheck", data)
      .then(() => fetchChecks())
      .catch(console.error);
  };

  return (
    <Box sx={{ width: "calc(100% - 80px)", mx: "auto", mt: 5 }}>
      <Typography variant="h4" mb={3} textAlign="center">🛫 Airline Check-In System</Typography>
      <RegistersTable />
      <CheckForm
        addCheck={addCheck}
        updateCheck={updateCheck}
        submitted={submitted}
        data={selectedCheck}
        isEdit={isEdit}
      />
      <ChecksTable
        rows={checks}
        users={users}
        selectedCheck={(data) => { setSelectedCheck(data); setIsEdit(true); }}
        deleteCheck={(data) => window.confirm("Are you sure to delete?") && deleteCheck(data)}
      />
    </Box>
  );
};

export default Checks;
