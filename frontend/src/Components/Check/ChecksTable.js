import { Box, Paper, Typography, Button, Avatar } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SeatIcon from "@mui/icons-material/EventSeat";
import FaceIcon from "@mui/icons-material/Face";
import BadgeIcon from "@mui/icons-material/Badge";

const ChecksTable = ({ rows, users = [], selectedCheck, deleteCheck }) => {
  const getUserPhoto = (name) => {
    const user = users.find(u => u.name === name);
    return user?.profilePhoto || "";
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 4 }}>
      {rows.length > 0 ? (
        rows.map((row) => (
          <Paper key={row.checkId} sx={{ p: 2.5, minWidth: 280, flex: "1 1 280px", borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Avatar src={row.profilePhoto || getUserPhoto(row.passengerName)} sx={{ width: 56, height: 56 }} />
              <Typography variant="h6">{row.passengerName}</Typography>
            </Box>
            <Typography><BadgeIcon fontSize="small" sx={{ mr: 1 }} /> Check ID: {row.checkId}</Typography>
            <Typography><FaceIcon fontSize="small" sx={{ mr: 1 }} /> Passport: {row.passportNumber}</Typography>
            <Typography>Nationality: {row.nationality}</Typography>
            <Typography><FlightIcon fontSize="small" sx={{ mr: 1 }} /> Flight: {row.flightNumber}</Typography>
            <Typography><SeatIcon fontSize="small" sx={{ mr: 1 }} /> Seat: {row.seatNumber}</Typography>
            <Typography>Status: {row.status}</Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button variant="contained" color="info" onClick={() => selectedCheck(row)}>Update</Button>
              <Button variant="contained" color="error" onClick={() => deleteCheck({ checkId: row.checkId })}>Delete</Button>
            </Box>
          </Paper>
        ))
      ) : (
        <Typography>No check-ins available</Typography>
      )}
    </Box>
  );
};

export default ChecksTable;
