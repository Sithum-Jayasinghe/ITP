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

const ScheduleTable = ({ rows, selectedSchedule, deleteSchedule, onSort, sortConfig, darkMode }) => {
  // Generate modern PDF for one schedule row
  const generatePDF = (row) => {
    const doc = new jsPDF();
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 220, 30, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Flight Schedule Details", 105, 20, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text("Flight Information", 14, 45);

    doc.setDrawColor(25, 118, 210);
    doc.line(14, 48, 196, 48);

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
      if (label === "Status") {
        if (value === "On Time") doc.setTextColor(0, 128, 0);
        else if (value === "Delayed") doc.setTextColor(255, 165, 0);
        else doc.setTextColor(255, 0, 0);
      }
      doc.text(value, 70, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });

    autoTable(doc, {
      startY: yPosition + 10,
      head: [['Departure', 'Arrival', 'Departure Time', 'Arrival Time', 'Status']],
      body: [[String(row.departure), String(row.arrival), String(row.dtime), String(row.atime), String(row.status)]],
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: { cellPadding: 3, fontSize: 10, valign: 'middle' }
    });

    doc.save(`Flight_Schedule_${row.id}_${row.flightName}.pdf`);
  };

  const handleSort = (key) => {
    if (onSort) onSort(key);
  };

  const SortableHeader = ({ children, sortKey }) => {
    const isSorted = sortConfig?.key === sortKey;
    const sortDirection = sortConfig?.direction === 'asc' ? '↑' : '↓';
    return (
      <TableCell
        sx={{
          color: "#fff",
          fontWeight: "bold",
          cursor: 'pointer',
          backgroundColor: isSorted ? '#1565c0' : '#1976d2',
          '&:hover': { backgroundColor: '#1565c0' }
        }}
        onClick={() => handleSort(sortKey)}
      >
        {children} {isSorted && sortDirection}
      </TableCell>
    );
  };

  return (
    <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: "hidden", mt: 3, bgcolor: darkMode ? '#1e1e1e' : 'inherit' }}>
      <Table>
        <TableHead sx={{ backgroundColor: darkMode ? "#333" : "#1976d2" }}>
          <TableRow>
            <SortableHeader sortKey="id">ID</SortableHeader>
            <SortableHeader sortKey="flightName">Flight Name</SortableHeader>
            <SortableHeader sortKey="departure">Departure</SortableHeader>
            <SortableHeader sortKey="arrival">Arrival</SortableHeader>
            <SortableHeader sortKey="dtime">Departure Time</SortableHeader>
            <SortableHeader sortKey="atime">Arrival Time</SortableHeader>
            <SortableHeader sortKey="aircraft">Aircraft</SortableHeader>
            <SortableHeader sortKey="seats">Seats</SortableHeader>
            <SortableHeader sortKey="status">Status</SortableHeader>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? rows.map((row) => (
            <TableRow key={row.id} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: darkMode ? '#2a2a2a' : "#f9f9f9" }, "&:hover": { backgroundColor: darkMode ? '#333' : "#e3f2fd" } }}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <FlightTakeoffIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  {row.id}
                </Box>
              </TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.flightName}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.departure}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.arrival}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.dtime}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.atime}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.aircraft}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.seats}</TableCell>
              <TableCell>
                <Typography sx={{ color: row.status === "On Time" ? "green" : row.status === "Delayed" ? "orange" : "red", fontWeight: "bold" }}>
                  {row.status}
                </Typography>
              </TableCell>
              <TableCell>
                <Tooltip title="Update Schedule"><IconButton color="primary" onClick={() => selectedSchedule(row)}><EditIcon /></IconButton></Tooltip>
                <Tooltip title="Delete Schedule"><IconButton color="error" onClick={() => deleteSchedule({ id: row.id })}><DeleteIcon /></IconButton></Tooltip>
                <Tooltip title="Generate PDF"><IconButton color="secondary" onClick={() => generatePDF(row)}><PictureAsPdfIcon /></IconButton></Tooltip>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow><TableCell colSpan={10} align="center"><Typography variant="body1" color="text.secondary">No flight schedules available.</Typography></TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduleTable;
