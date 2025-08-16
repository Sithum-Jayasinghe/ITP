import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const PassengersTable = ({ rows, selectedPassenger, deletePassenger }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Baggage</TableCell>
            <TableCell>Baggage Price (LKR)</TableCell>
            <TableCell>Meal</TableCell>
            <TableCell>Meal Price (LKR)</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.details}</TableCell>
                <TableCell>{row.baggage}</TableCell>
                <TableCell>{row.baggagePrice}</TableCell>
                <TableCell>{row.meal}</TableCell>
                <TableCell>{row.mealPrice}</TableCell>
                <TableCell>
                  <Button
                    sx={{ margin: "0px 10px" }}
                    onClick={() =>
                      selectedPassenger({
                        id: row.id,
                        name: row.name,
                        details: row.details,
                        baggage: row.baggage,
                        baggagePrice: row.baggagePrice,
                        meal: row.meal,
                        mealPrice: row.mealPrice,
                      })
                    }
                  >
                    Update
                  </Button>

                  <Button
                    sx={{ margin: "0px 10px" }}
                    onClick={() => deletePassenger({ id: row.id })}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell colSpan={8} align="center">
                No Data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PassengersTable;
