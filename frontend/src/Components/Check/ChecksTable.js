import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const ChecksTable = ({ rows, selectedCheck, deleteCheck }) => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: '30px' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Check ID</TableCell>
            <TableCell>Passenger Name</TableCell>
            <TableCell>Passport Number</TableCell>
            <TableCell>Nationality</TableCell>
            <TableCell>Flight Number</TableCell>
            <TableCell>Departure</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Seat Number</TableCell>
            <TableCell>Gate Number</TableCell>
            <TableCell>Boarding Time</TableCell>
            <TableCell>Baggage Count</TableCell>
            <TableCell>Baggage Weight (kg)</TableCell>
            <TableCell>Meal Preference</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.checkId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{row.checkId}</TableCell>
                <TableCell>{row.passengerName}</TableCell>
                <TableCell>{row.passportNumber}</TableCell>
                <TableCell>{row.nationality}</TableCell>
                <TableCell>{row.flightNumber}</TableCell>
                <TableCell>{row.departure}</TableCell>
                <TableCell>{row.destination}</TableCell>
                <TableCell>{row.seatNumber}</TableCell>
                <TableCell>{row.gateNumber}</TableCell>
                <TableCell>{row.boardingTime}</TableCell>
                <TableCell>{row.baggageCount}</TableCell>
                <TableCell>{row.baggageWeight}</TableCell>
                <TableCell>{row.mealPreference}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <Button
                    sx={{ margin: '0 8px' }}
                    onClick={() => selectedCheck(row)}
                  >
                    Update
                  </Button>
                  <Button
                    sx={{ margin: '0 8px' }}
                    onClick={() => deleteCheck({ checkId: row.checkId })}
                    color="error"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={15} align="center">
                No Data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ChecksTable;
