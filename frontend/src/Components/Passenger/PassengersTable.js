import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PassengersTable = ({ rows, selectedPassenger, deletePassenger }) => {
  const totalBaggage = rows.reduce((sum, r) => sum + (r.baggagePrice || 0), 0);
  const totalMeal = rows.reduce((sum, r) => sum + (r.mealPrice || 0), 0);

  const getSeatClass = (seat) => seat <= 20 ? "First Class" : "Economy";

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Baggage</TableCell>
              <TableCell>Baggage Price</TableCell>
              <TableCell>Meal</TableCell>
              <TableCell>Meal Price</TableCell>
              <TableCell>Seat</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? rows.map(row => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.details}</TableCell>
                <TableCell>{row.baggage}</TableCell>
                <TableCell>{row.baggagePrice}</TableCell>
                <TableCell>{row.meal}</TableCell>
                <TableCell>{row.mealPrice}</TableCell>
                <TableCell>{row.seat} ({getSeatClass(row.seat)})</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Passenger">
                    <IconButton color="primary" sx={{ "&:hover": { backgroundColor: "#E0F7FA" } }} onClick={() => selectedPassenger(row)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Passenger">
                    <IconButton color="error" sx={{ "&:hover": { backgroundColor: "#FFEBEE" } }} onClick={() => deletePassenger(row)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={9} align="center">No Data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography sx={{ mt: 2, fontWeight: "bold" }}>
        Total Baggage Price: LKR {totalBaggage} | Total Meal Price: LKR {totalMeal}
      </Typography>
    </>
  );
};

export default PassengersTable;
