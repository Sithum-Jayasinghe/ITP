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
import Logo from '../Images/logo.png';

const ScheduleTable = ({ rows, selectedSchedule, deleteSchedule, onSort, sortConfig, darkMode }) => {
  // Format time for better display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "N/A";
    
    // If it's already in readable format, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    // If it's in ISO format, convert to readable format
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
    } catch (error) {
      console.log('Time formatting error:', error);
    }
    
    return timeString;
  };

  // Calculate flight duration properly
  const calculateDuration = (departureTime, arrivalTime) => {
    try {
      // Handle both ISO format and readable format
      let depDate, arrDate;
      
      // Try to parse as ISO date first
      depDate = new Date(departureTime);
      arrDate = new Date(arrivalTime);
      
      // If ISO parsing fails, try to parse as readable time
      if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) {
        const parseReadableTime = (timeStr) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          
          if (modifier === 'PM' && hours !== 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          
          // Create a date object for today with this time
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        };
        
        depDate = parseReadableTime(departureTime);
        arrDate = parseReadableTime(arrivalTime);
        
        // If arrival is earlier than departure, assume next day
        if (arrDate < depDate) {
          arrDate.setDate(arrDate.getDate() + 1);
        }
      }
      
      const durationMs = arrDate - depDate;
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.log('Duration calculation error:', error);
      return "~2h 30m"; // Fallback duration
    }
  };

  // Sanitize text for PDF
  const sanitizeText = (text) => {
    if (!text) return "N/A";
    // Remove or replace problematic characters
    return text.toString().replace(/[^\x20-\x7E]/g, '');
  };

  // Generate modern PDF for one schedule row
  const generatePDF = (row) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Set default font
      doc.setFont("helvetica");
      
      // Add premium header with gradient effect
      doc.setFillColor(0, 90, 156);
      doc.rect(0, 0, pageWidth, 70, 'F');
      
      // Add AIRGO logo
      try {
        if (Logo) {
          doc.addImage(Logo, 'PNG', 20, 15, 30, 30);
        } else {
          throw new Error('Logo not available');
        }
      } catch (error) {
        console.log('Using text fallback for logo');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text("✈ AIRGO", 35, 30);
      }
      
      // Company header
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("AIRGO AIRLINES", pageWidth / 2, 35, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(220, 220, 220);
      doc.text("Flight Schedule Details", pageWidth / 2, 45, { align: "center" });
      
      doc.setFontSize(9);
      doc.text("Elevate Your Journey", pageWidth / 2, 52, { align: "center" });
      
      // Flight ID section
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, 75, pageWidth - 30, 20, 5, 5, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 75, pageWidth - 30, 20, 5, 5, 'S');
      
      doc.setFontSize(14);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text(`FLIGHT SCHEDULE: ${sanitizeText(row.flightName)}`, pageWidth / 2, 85, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, pageWidth / 2, 92, { align: "center" });
      
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
      
      // Departure
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, 'S');
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("FROM", 30, flightY);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const departureText = sanitizeText(row.departure);
      doc.text(departureText.length > 20 ? departureText.substring(0, 20) + '...' : departureText, 30, flightY + 8);
      
      // Arrow with plane
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.text("➔", pageWidth / 2, flightY + 2);
      
      // Arrival
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(pageWidth - 85, flightY - 8, 60, 25, 3, 3, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.roundedRect(pageWidth - 85, flightY - 8, 60, 25, 3, 3, 'S');
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TO", pageWidth - 80, flightY);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const arrivalText = sanitizeText(row.arrival);
      doc.text(arrivalText.length > 20 ? arrivalText.substring(0, 20) + '...' : arrivalText, pageWidth - 80, flightY + 8);
      
      // Flight timing section
      const timeY = 170;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT TIMING", 20, timeY);
      doc.line(20, timeY + 3, 75, timeY + 3);
      
      // Time cards
      const cardWidth = 75;
      const gap = 10;
      const firstCardX = 25;
      const secondCardX = firstCardX + cardWidth + gap;
      
      // Departure time card
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(firstCardX, timeY + 10, cardWidth, 35, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(firstCardX, timeY + 10, cardWidth, 35, 3, 3, 'S');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("DEPARTURE", firstCardX + 10, timeY + 22);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const departureTime = formatTimeForDisplay(row.dtime);
      doc.text(departureTime, firstCardX + 10, timeY + 32);
      
      // Arrival time card
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(secondCardX, timeY + 10, cardWidth, 35, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(secondCardX, timeY + 10, cardWidth, 35, 3, 3, 'S');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("ARRIVAL", secondCardX + 10, timeY + 22);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const arrivalTime = formatTimeForDisplay(row.atime);
      doc.text(arrivalTime, secondCardX + 10, timeY + 32);
      
      // Flight details section
      const detailsY = 225;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT DETAILS", 20, detailsY);
      doc.line(20, detailsY + 3, 85, detailsY + 3);
      
      // Details table background
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(25, detailsY + 10, pageWidth - 50, 45, 3, 3, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, detailsY + 10, pageWidth - 50, 45, 3, 3, 'S');
      
      const detailsStartY = detailsY + 20;
      doc.setFontSize(10);
      
      // Left column labels
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("Flight ID:", 35, detailsStartY);
      doc.text("Aircraft:", 35, detailsStartY + 10);
      doc.text("Available Seats:", 35, detailsStartY + 20);
      
      // Left column values
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeText(row.id.toString()), 85, detailsStartY);
      doc.text(sanitizeText(row.aircraft), 85, detailsStartY + 10);
      doc.text(sanitizeText(row.seats.toString()), 85, detailsStartY + 20);
      
      // Right column labels
      const rightColumnX = 120;
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("Flight Name:", rightColumnX, detailsStartY);
      doc.text("Flight Status:", rightColumnX, detailsStartY + 10);
      doc.text("Duration:", rightColumnX, detailsStartY + 20);
      
      // Right column values
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeText(row.flightName), rightColumnX + 35, detailsStartY);
      
      // Status with color coding
      const status = sanitizeText(row.status);
      if (status === "On Time") {
        doc.setTextColor(0, 128, 0);
      } else if (status === "Delayed") {
        doc.setTextColor(255, 165, 0);
      } else {
        doc.setTextColor(255, 0, 0);
      }
      doc.text(status, rightColumnX + 35, detailsStartY + 10);
      doc.setTextColor(0, 0, 0);
      
      // Calculate actual duration
      const duration = calculateDuration(row.dtime, row.atime);
      doc.text(duration, rightColumnX + 35, detailsStartY + 20);
      
      // Travel information section
      const infoY = 285;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("TRAVEL INFORMATION", 20, infoY);
      doc.line(20, infoY + 3, 95, infoY + 3);
      
      doc.setFillColor(255, 253, 231);
      doc.roundedRect(25, infoY + 10, pageWidth - 50, 25, 3, 3, 'F');
      doc.setDrawColor(255, 213, 79);
      doc.roundedRect(25, infoY + 10, pageWidth - 50, 25, 3, 3, 'S');
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      const travelInfo = [
        "• Check-in opens 3 hours before departure",
        "• Boarding starts 45 minutes before departure", 
        "• Have your ID and boarding pass ready"
      ];
      
      travelInfo.forEach((info, index) => {
        doc.text(info, 30, infoY + 18 + (index * 6));
      });
      
      // Footer section
      doc.setFillColor(0, 90, 156);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00", 
              pageWidth / 2, pageHeight - 9, { align: "center" });
      
      // Security badge
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text("OFFICIAL FLIGHT SCHEDULE | VERIFIED DOCUMENT", 
              pageWidth / 2, pageHeight - 20, { align: "center" });
      
      // Page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Save the PDF with proper filename
      const fileName = `AIRGO_Flight_${sanitizeText(row.flightName).replace(/[^a-zA-Z0-9]/g, '_')}_${row.id}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
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
                    {formatTimeForDisplay(row.dtime)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                {formatTimeForDisplay(row.atime)}
              </TableCell>
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