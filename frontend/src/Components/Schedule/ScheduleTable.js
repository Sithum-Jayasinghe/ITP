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
  Button,
  Stack,
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
import Logo from "../Images/logo.png";

// Helper: Safely fetch an image and convert to Data URL for jsPDF
const fetchImageAsDataURL = async (src) => {
  if (!src) return null;
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Logo fetch failed, will fallback to text:", e);
    return null;
  }
};

const ScheduleTable = ({
  rows = [],
  selectedSchedule,
  deleteSchedule,
  onSort,
  sortConfig,
  darkMode,
}) => {
  // Cache logo DataURL so we fetch only once
  const logoDataUrlRef = React.useRef(null);

  const getLogoDataURL = React.useCallback(async () => {
    if (logoDataUrlRef.current !== null) return logoDataUrlRef.current;
    const dataURL = await fetchImageAsDataURL(Logo);
    logoDataUrlRef.current = dataURL;
    return dataURL;
  }, []);

  // Format time for better display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "N/A";

    // If it's already in readable format, return as is
    if (typeof timeString === "string" && (timeString.includes("AM") || timeString.includes("PM"))) {
      return timeString;
    }

    // If it's in ISO format, convert to readable format
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      console.log("Time formatting error:", error);
    }

    return timeString;
  };

  // Calculate flight duration properly
  const calculateDuration = (departureTime, arrivalTime) => {
    try {
      let depDate = new Date(departureTime);
      let arrDate = new Date(arrivalTime);

      const parseReadableTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== "string") return null;
        const [time, modifier] = timeStr.split(" ");
        if (!time || !modifier) return null;
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

        const d = new Date();
        d.setHours(hours || 0, minutes || 0, 0, 0);
        return d;
      };

      // If ISO parsing fails, try readable format (e.g., "08:30 AM")
      if (isNaN(depDate.getTime()) || isNaN(arrDate.getTime())) {
        depDate = parseReadableTime(departureTime);
        arrDate = parseReadableTime(arrivalTime);

        if (!depDate || !arrDate) return "N/A";
        // If arrival is earlier than departure, assume next day
        if (arrDate < depDate) arrDate.setDate(arrDate.getDate() + 1);
      }

      const durationMs = arrDate - depDate;
      if (durationMs < 0) return "N/A";

      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } catch (error) {
      console.log("Duration calculation error:", error);
      return "N/A";
    }
  };

  // Sanitize text for PDF
  const sanitizeText = (text) => {
    if (text === null || text === undefined) return "N/A";
    return text.toString().replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ""); // allow basic whitespace + printable ASCII
  };

  // Wrap text within a width
  const wrap = (doc, text, maxWidth) => {
    return doc.splitTextToSize(sanitizeText(text), maxWidth);
  };

  // Draws the top header (brand bar)
  const drawHeader = async (doc, pageWidth, pageHeight, title = "Flight Schedule Details") => {
    // Top brand bar
    doc.setFillColor(0, 90, 156);
    doc.rect(0, 0, pageWidth, 70, "F");

    // Logo
    try {
      const logoDataUrl = await getLogoDataURL();
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 20, 15, 30, 30);
      } else {
        throw new Error("Logo dataURL not available");
      }
    } catch {
      // Fallback text logo
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("✈ AIRGO", 35, 30);
    }

    // Company header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("AIRGO AIRLINES", pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text(title, pageWidth / 2, 45, { align: "center" });

    doc.setFontSize(9);
    doc.text("Elevate Your Journey", pageWidth / 2, 52, { align: "center" });
  };

  // Generate modern PDF for one schedule row
  const generateRowPDF = async (row) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont("helvetica");

      await drawHeader(doc, pageWidth, pageHeight, "Flight Schedule Details");

      // Flight ID banner
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, 75, pageWidth - 30, 20, 5, 5, "F");
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 75, pageWidth - 30, 20, 5, 5, "S");

      doc.setFontSize(14);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text(
        `FLIGHT SCHEDULE: ${sanitizeText(row.flightName)}`,
        pageWidth / 2,
        85,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        pageWidth / 2,
        92,
        { align: "center" }
      );

      // Route section
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT ROUTE", 20, 112);

      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.8);
      doc.line(20, 115, 75, 115);

      const flightY = 132;

      // Departure card
      doc.setFillColor(240, 248, 255);
      doc.setDrawColor(200, 220, 240);
      doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, "F");
      doc.roundedRect(25, flightY - 8, 60, 25, 3, 3, "S");
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("FROM", 30, flightY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const depLines = wrap(doc, row.departure, 50);
      depLines.forEach((line, i) => doc.text(line, 30, flightY + 8 + i * 5));

      // Direction arrow
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.text("➔", pageWidth / 2, flightY + 2);

      // Arrival card
      doc.setFillColor(240, 248, 255);
      doc.setDrawColor(200, 220, 240);
      doc.roundedRect(pageWidth - 85, flightY - 8, 60, 25, 3, 3, "F");
      doc.roundedRect(pageWidth - 85, flightY - 8, 60, 25, 3, 3, "S");
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TO", pageWidth - 80, flightY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const arrLines = wrap(doc, row.arrival, 50);
      arrLines.forEach((line, i) => doc.text(line, pageWidth - 80, flightY + 8 + i * 5));

      // Timing section
      const timeY = 170;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT TIMING", 20, timeY);
      doc.line(20, timeY + 3, 75, timeY + 3);

      const cardWidth = 75;
      const gap = 10;
      const firstCardX = 25;
      const secondCardX = firstCardX + cardWidth + gap;

      // Departure time card
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(firstCardX, timeY + 10, cardWidth, 35, 3, 3, "F");
      doc.roundedRect(firstCardX, timeY + 10, cardWidth, 35, 3, 3, "S");

      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("DEPARTURE", firstCardX + 10, timeY + 22);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const departureTime = formatTimeForDisplay(row.dtime);
      doc.text(sanitizeText(departureTime), firstCardX + 10, timeY + 32);

      // Arrival time card
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(secondCardX, timeY + 10, cardWidth, 35, 3, 3, "F");
      doc.roundedRect(secondCardX, timeY + 10, cardWidth, 35, 3, 3, "S");

      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("ARRIVAL", secondCardX + 10, timeY + 22);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const arrivalTime = formatTimeForDisplay(row.atime);
      doc.text(sanitizeText(arrivalTime), secondCardX + 10, timeY + 32);

      // Details section
      const detailsY = 225;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("FLIGHT DETAILS", 20, detailsY);
      doc.line(20, detailsY + 3, 85, detailsY + 3);

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, detailsY + 10, pageWidth - 50, 50, 3, 3, "F");
      doc.roundedRect(25, detailsY + 10, pageWidth - 50, 50, 3, 3, "S");

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
      doc.text(sanitizeText(String(row.id)), 85, detailsStartY);
      doc.text(sanitizeText(row.aircraft), 85, detailsStartY + 10);
      doc.text(sanitizeText(String(row.seats)), 85, detailsStartY + 20);

      // Right column labels and values
      const rightColumnX = 120;
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("Flight Name:", rightColumnX, detailsStartY);
      doc.text("Flight Status:", rightColumnX, detailsStartY + 10);
      doc.text("Duration:", rightColumnX, detailsStartY + 20);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const flightNameLines = wrap(doc, row.flightName, 60);
      doc.text(flightNameLines, rightColumnX + 35, detailsStartY);

      // Status with color coding
      const status = sanitizeText(row.status);
      if (status.toLowerCase() === "on time") {
        doc.setTextColor(0, 128, 0);
      } else if (status.toLowerCase() === "delayed") {
        doc.setTextColor(255, 165, 0);
      } else {
        doc.setTextColor(255, 0, 0);
      }
      doc.text(status, rightColumnX + 35, detailsStartY + 10);
      doc.setTextColor(0, 0, 0);

      const duration = calculateDuration(row.dtime, row.atime);
      doc.text(sanitizeText(duration), rightColumnX + 35, detailsStartY + 20);

      // Travel info
      const infoY = 290;
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("TRAVEL INFORMATION", 20, infoY);
      doc.line(20, infoY + 3, 95, infoY + 3);

      doc.setFillColor(255, 253, 231);
      doc.setDrawColor(255, 213, 79);
      doc.roundedRect(25, infoY + 10, pageWidth - 50, 25, 3, 3, "F");
      doc.roundedRect(25, infoY + 10, pageWidth - 50, 25, 3, 3, "S");

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const travelInfo = [
        "• Check-in opens 3 hours before departure",
        "• Boarding starts 45 minutes before departure",
        "• Have your ID and boarding pass ready",
      ];
      travelInfo.forEach((info, index) => {
        doc.text(info, 30, infoY + 18 + index * 6);
      });

      // Footer
      doc.setFillColor(0, 90, 156);
      doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(
        "AIRGO Airlines - Elevate Your Journey | support@airgo.com | +1 (800) AIRGO-00",
        pageWidth / 2,
        pageHeight - 9,
        { align: "center" }
      );

      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "OFFICIAL FLIGHT SCHEDULE | VERIFIED DOCUMENT",
        pageWidth / 2,
        pageHeight - 20,
        { align: "center" }
      );

      // Page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

      const fileName = `AIRGO_Flight_${sanitizeText(row.flightName).replace(/[^a-zA-Z0-9]/g, "_")}_${row.id}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Generate a PDF for ALL rows as a table (AutoTable)
  const generateAllPDF = async () => {
    try {
      const doc = new jsPDF("p", "pt"); // pt units work nicely with AutoTable
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Draw header
      await drawHeader(doc, pageWidth, pageHeight, "All Flight Schedules");

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const marginTop = 90;
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, marginTop);

      // Build table data
      const tableBody = rows.map((r) => [
        sanitizeText(String(r.id)),
        sanitizeText(r.flightName),
        sanitizeText(r.departure),
        sanitizeText(r.arrival),
        sanitizeText(formatTimeForDisplay(r.dtime)),
        sanitizeText(formatTimeForDisplay(r.atime)),
        sanitizeText(r.aircraft),
        sanitizeText(String(r.seats)),
        sanitizeText(r.status),
        sanitizeText(calculateDuration(r.dtime, r.atime)),
      ]);

      autoTable(doc, {
        startY: marginTop + 15,
        head: [
          [
            "ID",
            "Flight Name",
            "Departure",
            "Arrival",
            "Dep Time",
            "Arr Time",
            "Aircraft",
            "Seats",
            "Status",
            "Duration",
          ],
        ],
        body: tableBody,
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 6,
          overflow: "linebreak",
          halign: "left",
          valign: "middle",
        },
        headStyles: {
          fillColor: [0, 90, 156],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: async (data) => {
          // Footer on each page
          doc.setFillColor(0, 90, 156);
          doc.rect(0, pageHeight - 25, pageWidth, 25, "F");
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - 50,
            pageHeight - 9
          );
          doc.text(
            "AIRGO Airlines - support@airgo.com",
            40,
            pageHeight - 9
          );
        },
        margin: { left: 40, right: 40 },
      });

      const fileName = `AIRGO_All_Flights_${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleSort = (key) => {
    if (onSort) onSort(key);
  };

  const SortableHeader = ({ children, sortKey }) => {
    const isSorted = sortConfig?.key === sortKey;
    const sortDirection = sortConfig?.direction === "asc" ? "↑" : "↓";
    return (
      <TableCell
        sx={{
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          backgroundColor: isSorted ? "#1565c0" : "#1976d2",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
        onClick={() => handleSort(sortKey)}
      >
        {children} {isSorted && sortDirection}
      </TableCell>
    );
  };

  return (
    <Box>
      {/* Top bar: Export All */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        sx={{ mt: 2 }}
      >
        <Tooltip title="Export all schedules as PDF">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdfIcon />}
            onClick={generateAllPDF}
            sx={{
              textTransform: "none",
              bgcolor: darkMode ? "#7b1fa2" : "secondary.main",
            }}
          >
            Export All as PDF
          </Button>
        </Tooltip>
      </Stack>

      <TableContainer
        component={Paper}
        elevation={4}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mt: 2,
          bgcolor: darkMode ? "#1e1e1e" : "inherit",
          border: darkMode ? "1px solid #333" : "none",
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
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: darkMode ? "#2a2a2a" : "#f9f9f9",
                    },
                    "&:hover": {
                      backgroundColor: darkMode ? "#333" : "#e3f2fd",
                    },
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <AirplaneTicketIcon
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography
                        sx={{
                          color: darkMode ? "#e0e0e0" : "inherit",
                          fontWeight: "bold",
                          fontFamily: "monospace",
                        }}
                      >
                        {row.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: darkMode ? "#e0e0e0" : "inherit",
                      fontWeight: "bold",
                    }}
                  >
                    {row.flightName}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <FlightTakeoffIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                        {row.departure}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <FlightLandIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                        {row.arrival}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <ScheduleIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                        {formatTimeForDisplay(row.dtime)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                    {formatTimeForDisplay(row.atime)}
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                    {row.aircraft}
                  </TableCell>
                  <TableCell sx={{ color: darkMode ? "#e0e0e0" : "inherit" }}>
                    {row.seats}
                  </TableCell>
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
                        fontSize: "0.875rem",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backgroundColor:
                          row.status === "On Time"
                            ? "rgba(0,128,0,0.1)"
                            : row.status === "Delayed"
                            ? "rgba(255,165,0,0.1)"
                            : "rgba(255,0,0,0.1)",
                        display: "inline-block",
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
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)" },
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
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.2)" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Generate PDF">
                        <IconButton
                          color="secondary"
                          onClick={() => generateRowPDF(row)}
                          sx={{
                            backgroundColor: "rgba(156, 39, 176, 0.1)",
                            "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.2)" },
                          }}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
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
    </Box>
  );
};

export default ScheduleTable;