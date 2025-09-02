import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Typography,
  Box,
  //Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { jsPDF } from "jspdf";
//Import autoTable from "jspdf-autotable";

const ScheduleTable = ({ rows, selectedSchedule, deleteSchedule }) => {
  // Generate PDF for one schedule row
  const generatePDF = (row) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("✈️ Flight Schedule Details", 14, 20);

    doc.setFontSize(12);
    doc.text(`ID: ${row.id}`, 14, 35);
    doc.text(`Flight Name: ${row.flightName}`, 14, 45);
    doc.text(`Departure: ${row.departure}`, 14, 55);
    doc.text(`Arrival: ${row.arrival}`, 14, 65);
    doc.text(`Departure Time: ${row.dtime}`, 14, 75);
    doc.text(`Arrival Time: ${row.atime}`, 14, 85);
    doc.text(`Aircraft: ${row.aircraft}`, 14, 95);
    doc.text(`Seats: ${row.seats}`, 14, 105);
    doc.text(`Status: ${row.status}`, 14, 115);

    doc.save(`Schedule_${row.id}.pdf`);
  };

  return (
    <TableContainer
      component={Paper}
      elevation={4}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        mt: 3,
      }}
    >
      <Table>
        <TableHead
          sx={{
            backgroundColor: "#1976d2",
          }}
        >
          <TableRow>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Flight Name
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Departure
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Arrival</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Departure Time
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Arrival Time
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Aircraft</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Seats</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <FlightTakeoffIcon
                      fontSize="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    {row.id}
                  </Box>
                </TableCell>
                <TableCell>{row.flightName}</TableCell>
                <TableCell>{row.departure}</TableCell>
                <TableCell>{row.arrival}</TableCell>
                <TableCell>{row.dtime}</TableCell>
                <TableCell>{row.atime}</TableCell>
                <TableCell>{row.aircraft}</TableCell>
                <TableCell>{row.seats}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color:
                        row.status === "On Time"
                          ? "green"
                          : row.status === "Delayed"
                          ? "orange"
                          : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {row.status}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Update Schedule">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        selectedSchedule({
                          id: row.id,
                          flightName: row.flightName,
                          departure: row.departure,
                          arrival: row.arrival,
                          dtime: row.dtime,
                          atime: row.atime,
                          aircraft: row.aircraft,
                          seats: row.seats,
                          status: row.status,
                        })
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Schedule">
                    <IconButton
                      color="error"
                      onClick={() => deleteSchedule({ id: row.id })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>

                  {/* PDF Generate button */}
                  <Tooltip title="Generate PDF">
                    <IconButton
                      color="secondary"
                      onClick={() => generatePDF(row)}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Typography variant="body1" color="text.secondary">
                  No flight schedules available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable;
