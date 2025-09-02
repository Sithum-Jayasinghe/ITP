import { Box, Paper, Typography, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import Axios from "axios";

// State to hold the list of registered users
const RegistersTable = () => {
  const [registers, setRegisters] = useState([]);

  useEffect(() => {
    getRegisters();
  }, []);

  
  const getRegisters = () => {
    Axios.get("http://localhost:3001/api/registers") // Replace with your actual API endpoint
      .then((response) => {
        setRegisters(response.data?.response || []);// Safely access response (avoid undefined)
      })
      .catch((error) => {
        console.error("Axios error:", error);
        setRegisters([]);// fallback to empty if error
      });
  };

  return (
    <Box sx={{ marginBottom: "30px" }}>
      <Typography variant="h5" sx={{ marginBottom: "15px" }}>
        Registered Users
      </Typography>

      {registers.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {registers.map((user) => (
            <Paper
              key={user.id}
              sx={{
                padding: 2,
                minWidth: 200,
                maxWidth: 250,
                flex: "1 1 200px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Avatar
                src={user.profilePhoto || ""}
                alt={user.name}
                sx={{ width: 60, height: 60, marginBottom: 1 }}
              />
              <Typography><strong>ID:</strong> {user.id}</Typography>
              <Typography><strong>Name:</strong> {user.name}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Phone:</strong> {user.phone}</Typography>
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography>No registered users found</Typography>
      )}
    </Box>
  );
};

export default RegistersTable;
