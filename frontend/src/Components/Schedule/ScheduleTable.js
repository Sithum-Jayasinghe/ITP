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
import FlightLandIcon from "@mui/icons-material/FlightLand";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Logo from '../Images/logo.png';

const ScheduleTable = ({ rows, selectedSchedule, deleteSchedule, onSort, sortConfig, darkMode }) => {
  // Generate modern PDF for one schedule row
  const generatePDF = (row) => {
    const doc = new jsPDF();
    
    // Add premium header with gradient effect
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 0, 220, 70, 'F');
    
    // Add AIRGO logo
    try {
      doc.addImage(Logo, 'PNG', 20, 15, 30, 30);
    } catch (error) {
      console.log('Logo not available, using text fallback');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO", 35, 30);
    }
    
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AIRGO AIRLINES", 105, 35, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text("Flight Schedule Details", 105, 45, { align: "center" });
    
    doc.setFontSize(9);
    doc.text("Elevate Your Journey", 105, 52, { align: "center" });
    
    // Flight ID section
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 75, 180, 20, 5, 5, 'F');
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 75, 180, 20, 5, 5, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text(`FLIGHT SCHEDULE: ${row.flightName}`, 105, 85, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 92, { align: "center" });
    
    // Flight route section
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("FLIGHT ROUTE", 20, 112);
    
    // Decorative line
    doc.setDrawColor(0, 90, 156);
    doc.setLineWidth(0.8);
    doc.line(20, 115, 75, 115);
    
    // Flight route visualization
    const flightY = 132;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    
    // Departure
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, 'F');
    doc.setTextColor(0, 90, 156);
    doc.setFontSize(12);
    doc.text("FROM", 30, flightY);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(row.departure, 30, flightY + 8);
    
    // Arrow with plane
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.text("✈", 105, flightY + 2);
    
    // Arrival
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(125, flightY - 8, 60, 25, 3, 3, 'F');
    doc.setTextColor(0, 90, 156);
    doc.setFontSize(12);
    doc.text("TO", 130, flightY);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(row.arrival, 130, flightY + 8);
    
    // Flight timing section
    const timeY = 170;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("FLIGHT TIMING", 20, timeY);
    doc.line(20, timeY + 3, 75, timeY + 3);
    
    // Time cards
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(25, timeY + 10, 75, 35, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25, timeY + 10, 75, 35, 3, 3, 'S');
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(110, timeY + 10, 75, 35, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(110, timeY + 10, 75, 35, 3, 3, 'S');
    
    // Departure time
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTURE", 35, timeY + 22);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(row.dtime, 35, timeY + 32);
    
    // Arrival time
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("ARRIVAL", 120, timeY + 22);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(row.atime, 120, timeY + 32);
    
    // Flight details section
    const detailsY = 225;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("FLIGHT DETAILS", 20, detailsY);
    doc.line(20, detailsY + 3, 85, detailsY + 3);
    
    // Details table
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(25, detailsY + 10, 160, 45, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(25, detailsY + 10, 160, 45, 3, 3, 'S');
    
    const detailsStartY = detailsY + 20;
    doc.setFontSize(11);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    
    // Left column
    doc.text("Flight ID:", 35, detailsStartY);
    doc.text("Aircraft:", 35, detailsStartY + 10);
    doc.text("Available Seats:", 35, detailsStartY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row.id.toString(), 85, detailsStartY);
    doc.text(row.aircraft, 85, detailsStartY + 10);
    doc.text(row.seats.toString(), 85, detailsStartY + 20);
    
    // Right column
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("Flight Name:", 120, detailsStartY);
    doc.text("Flight Status:", 120, detailsStartY + 10);
    doc.text("Duration:", 120, detailsStartY + 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(row.flightName, 155, detailsStartY);
    
    // Status with color coding
    if (row.status === "On Time") {
      doc.setTextColor(0, 128, 0);
    } else if (row.status === "Delayed") {
      doc.setTextColor(255, 165, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(row.status, 155, detailsStartY + 10);
    doc.setTextColor(0, 0, 0);
    
    // Calculate approximate duration (you can enhance this with actual time calculation)
    doc.text("~2h 30m", 155, detailsStartY + 20);
    
    // Travel information section
    const infoY = 285;
    doc.setFontSize(16);
    doc.setTextColor(0, 90, 156);
    doc.setFont("helvetica", "bold");
    doc.text("TRAVEL INFORMATION", 20, infoY);
    doc.line(20, infoY + 3, 95, infoY + 3);
    
    doc.setFillColor(255, 253, 231);
    doc.roundedRect(25, infoY + 10, 160, 25, 3, 3, 'F');
    doc.setDrawColor(255, 213, 79);
    doc.roundedRect(25, infoY + 10, 160, 25, 3, 3, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const travelInfo = [
      "• Check-in opens 3 hours before departure",
      "• Boarding starts 45 minutes before departure",
      "• Have your ID and boarding pass ready"
    ];
    
    travelInfo.forEach((info, index) => {
      doc.text(info, 30, infoY + 20 + (index * 7));
    });
    
    // Footer section
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 315, 220, 15, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00", 105, 321, { align: "center" });
    
    // Security badge
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("OFFICIAL FLIGHT SCHEDULE | VERIFIED DOCUMENT", 105, 310, { align: "center" });
    
    // Page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);
    
    doc.save(`AIRGO_Schedule_${row.flightName}_${row.id}.pdf`);
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
    <TableContainer 
      component={Paper} 
      elevation={4} 
      sx={{ 
        borderRadius: 3, 
        overflow: "hidden", 
        mt: 3, 
        bgcolor: darkMode ? '#1e1e1e' : 'inherit',
        border: darkMode ? '1px solid #333' : 'none'
      }}
    >
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
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? rows.map((row) => (
            <TableRow 
              key={row.id} 
              hover 
              sx={{ 
                "&:nth-of-type(odd)": { 
                  backgroundColor: darkMode ? '#2a2a2a' : "#f9f9f9" 
                }, 
                "&:hover": { 
                  backgroundColor: darkMode ? '#333' : "#e3f2fd" 
                } 
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <AirplaneTicketIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                  <Typography sx={{ 
                    color: darkMode ? '#e0e0e0' : 'inherit',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}>
                    {row.id}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit', fontWeight: 'bold' }}>
                {row.flightName}
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <FlightTakeoffIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                    {row.departure}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <FlightLandIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                    {row.arrival}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <ScheduleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                    {row.dtime}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.atime}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.aircraft}</TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>{row.seats}</TableCell>
              <TableCell>
                <Typography 
                  sx={{ 
                    color: row.status === "On Time" ? "green" : row.status === "Delayed" ? "orange" : "red", 
                    fontWeight: "bold",
                    fontSize: '0.875rem',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: row.status === "On Time" ? 'rgba(0,128,0,0.1)' : 
                                   row.status === "Delayed" ? 'rgba(255,165,0,0.1)' : 'rgba(255,0,0,0.1)',
                    display: 'inline-block'
                  }}
                >
                  {row.status}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Tooltip title="Update Schedule">
                    <IconButton 
                      color="primary" 
                      onClick={() => selectedSchedule(row)}
                      sx={{ 
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Schedule">
                    <IconButton 
                      color="error" 
                      onClick={() => deleteSchedule({ id: row.id })}
                      sx={{ 
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Generate PDF">
                    <IconButton 
                      color="secondary" 
                      onClick={() => generatePDF(row)}
                      sx={{ 
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.2)' }
                      }}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
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