 
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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ScheduleTable = ({ rows, selectedSchedule, deleteSchedule }) => {
  // Generate modern PDF for one schedule row
  const generatePDF = (row) => {
    const doc = new jsPDF();
    
    // Add background color
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 220, 30, 'F');
    
    // Add title with logo
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("✈️ Flight Schedule Details", 105, 20, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add flight information in a modern card-like layout
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text("Flight Information", 14, 45);
    
    // Draw separator line
    doc.setDrawColor(25, 118, 210);
    doc.line(14, 48, 196, 48);
    
    // Flight details - convert all values to strings
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const flightDetails = [
      ["Flight ID", String(row.id)],
      ["Flight Name", String(row.flightName)],
      ["Departure", String(row.departure)],
      ["Arrival", String(row.arrival)],
      ["Departure Time", String(row.dtime)],
      ["Arrival Time", String(row.atime)],
      ["Aircraft", String(row.aircraft)],
      ["Available Seats", String(row.seats)],
      ["Status", String(row.status)]
    ];
    
    let yPosition = 60;
    
    flightDetails.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 20, yPosition);
      doc.setFont(undefined, 'normal');
      
      // Color code the status
      if (label === "Status") {
        if (value === "On Time") {
          doc.setTextColor(0, 128, 0);
        } else if (value === "Delayed") {
          doc.setTextColor(255, 165, 0);
        } else {
          doc.setTextColor(255, 0, 0);
        }
      }
      
      doc.text(value, 70, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });
    
    // Add a summary table with better styling
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text("Flight Route Summary", 105, yPosition, { align: "center" });
    yPosition += 10;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Departure', 'Arrival', 'Departure Time', 'Arrival Time', 'Status']],
      body: [[
        String(row.departure), 
        String(row.arrival), 
        String(row.dtime), 
        String(row.atime), 
        String(row.status)
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle'
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 290, { align: "center" });
    }
    
    // Save the PDF
    doc.save(`Flight_Schedule_${row.id}_${row.flightName}.pdf`);
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