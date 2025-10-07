import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
  Tooltip,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/Person";
import Logo from "../Images/logo.png";

// ✅ Status chip colors (UI)
const statusColors = {
  Active: "#4caf50",
  Inactive: "#9e9e9e",
  "On Leave": "#ff9800",
};

// ✅ Status colors for PDF (RGB)
const statusColorsRGB = {
  Active: [76, 175, 80],
  Inactive: [158, 158, 158],
  "On Leave": [255, 152, 0],
};

const StaffsTable = ({ rows, selectedStaff, deleteStaff }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    deleteStaff(staffToDelete);
    setOpenDialog(false);
    setStaffToDelete(null);
  };

  // Sanitize text for PDF
  const sanitizeText = (text) => {
    if (text === undefined || text === null || text === "") return "N/A";
    return text.toString().replace(/[^\x20-\x7E]/g, "").trim() || "N/A";
  };

<<<<<<< HEAD
  // ✅ Generate Comprehensive Professional PDF with All Staff Details
  const generateRowPDF = (staff) => {
=======
  // Load image as Data URL (works with CRA/Vite)
  const loadImageAsDataURL = async (src) => {
>>>>>>> c1627f29a16feb7fb20cb61811f551ade539c227
    try {
      if (!src) return null;
      const res = await fetch(src);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // ✅ Generate Modern Professional PDF with all details and safe layout
  const generateRowPDF = async (staff) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const primary = [0, 90, 156];
      const lightGray = [245, 245, 245];

      doc.setFont("helvetica", "normal");

      // Load logo safely
      const logoDataUrl = await loadImageAsDataURL(Logo);

      // Header/Footer
      const header = () => {
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.rect(0, 0, pageWidth, 36, "F");

        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", 10, 6, 22, 22);
        } else {
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text("✈ AIRGO", 16, 20);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("AIRGO AIRLINES", pageWidth / 2, 13, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Staff Management System", pageWidth / 2, 19, { align: "center" });

        doc.setFontSize(8);
        doc.text("Confidential Staff Document", pageWidth / 2, 25, { align: "center" });

        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(10, 31, pageWidth - 10, 31);
      };

      const footer = (data) => {
        const pageNumberText = `Page ${data.pageNumber}`;
        const securityCode = `STAFF-${sanitizeText(staff.id)}-${new Date()
          .getTime()
          .toString()
          .slice(-6)}`;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 130);
        doc.text(`Document ID: ${securityCode}`, pageWidth / 2, pageHeight - 14, {
          align: "center",
        });

        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text("AIRGO Airlines - Human Resources Department", 10, pageHeight - 7.5);
        doc.text(
          "Confidential - For Internal Use Only | hr@airgo.com | +1 (800) AIRGO-HR",
          pageWidth / 2,
          pageHeight - 3.5,
          { align: "center" }
        );
        doc.text(pageNumberText, pageWidth - 10, pageHeight - 7.5, { align: "right" });
      };

      // Draw header for the first page before any content
      header();

      // MARGINS
      const marginTop = 40;
      const marginBottom = 16;

      // TITLE CARD (fixed height, Generated date INSIDE the box)
      const titleTop = marginTop - 2; // 38
      const titleHeight = 18; // taller than before

      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.roundedRect(10, titleTop, pageWidth - 20, titleHeight, 2, 2, "F");
      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(10, titleTop, pageWidth - 20, titleHeight, 2, 2, "S");

      // Title
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(
        `STAFF PROFILE: ${sanitizeText(staff.name).toUpperCase()}`,
        pageWidth / 2,
        titleTop + 7, // inside the box
        { align: "center" }
      );

      // Generated date inside the box (no clipping)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(
        `Generated: ${new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        pageWidth / 2,
        titleTop + 13, // inside the box
        { align: "center" }
      );

      // Start content AFTER the title box with some gap
      let y = titleTop + titleHeight + 6;

<<<<<<< HEAD
      // Personal info cards - First Row
      const cardY = personalY + 15;
      
      // Staff ID Card
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(25, cardY, 50, 35, 6, 6, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, cardY, 50, 35, 6, 6, 'S');
      
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("STAFF ID", 50, cardY + 10, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.text(sanitizeText(staff.id.toString()), 50, cardY + 25, { align: "center" });
      
      // Role Card
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(85, cardY, 50, 35, 6, 6, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.roundedRect(85, cardY, 50, 35, 6, 6, 'S');
      
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("ROLE", 110, cardY + 10, { align: "center" });
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      const roleText = sanitizeText(staff.role);
      doc.text(roleText.length > 15 ? roleText.substring(0, 15) + '...' : roleText, 110, cardY + 25, { align: "center" });

      // Status Card
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(145, cardY, 50, 35, 6, 6, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.roundedRect(145, cardY, 50, 35, 6, 6, 'S');
      
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("STATUS", 170, cardY + 10, { align: "center" });
      
      const status = sanitizeText(staff.status);
      let statusColor = [0, 90, 156]; // Default blue
      if (status === "Active") statusColor = [76, 175, 80]; // Green
      else if (status === "Inactive") statusColor = [158, 158, 158]; // Gray
      else if (status === "On Leave") statusColor = [255, 152, 0]; // Orange
      
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFontSize(11);
      doc.text(status, 170, cardY + 25, { align: "center" });

      // Contact Details section
      const contactY = cardY + 50;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("CONTACT DETAILS", 20, contactY);
      doc.line(20, contactY + 3, 85, contactY + 3);

      // Contact table
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(25, contactY + 10, pageWidth - 50, 40, 8, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, contactY + 10, pageWidth - 50, 40, 8, 8, 'S');

      const contactStartY = contactY + 22;
      
      // Contact Number
      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("CONTACT NUMBER:", 35, contactStartY);
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeText(staff.num), 85, contactStartY);
      
      // Email
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("EMAIL ADDRESS:", 35, contactStartY + 15);
      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      const email = sanitizeText(staff.email);
      doc.text(email.length > 35 ? email.substring(0, 35) + '...' : email, 85, contactStartY + 15);

      // Professional Details section
      const professionalY = contactY + 65;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("PROFESSIONAL DETAILS", 20, professionalY);
      doc.line(20, professionalY + 3, 110, professionalY + 3);

      // Professional table
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(25, professionalY + 10, pageWidth - 50, 70, 8, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, professionalY + 10, pageWidth - 50, 70, 8, 8, 'S');

      const professionalStartY = professionalY + 22;
      doc.setFontSize(10);
      
      // Left column - Professional Information
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATION:", 35, professionalStartY);
      doc.text("WORK SCHEDULE:", 35, professionalStartY + 10);
      doc.text("SHIFT START DATE:", 35, professionalStartY + 20);
      doc.text("SHIFT START TIME:", 35, professionalStartY + 30);
      doc.text("SHIFT END DATE:", 35, professionalStartY + 40);
      doc.text("SHIFT END TIME:", 35, professionalStartY + 50);

      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(sanitizeText(staff.certificate), 85, professionalStartY);
      doc.text(sanitizeText(staff.schedule), 85, professionalStartY + 10);
      doc.text(sanitizeText(staff.shiftStartDate), 85, professionalStartY + 20);
      doc.text(sanitizeText(staff.shiftStartTime), 85, professionalStartY + 30);
      doc.text(sanitizeText(staff.shiftEndDate), 85, professionalStartY + 40);
      doc.text(sanitizeText(staff.shiftEndTime), 85, professionalStartY + 50);

      // Right column - Additional Details
      const rightColumnX = 120;
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("DEPARTMENT:", rightColumnX, professionalStartY);
      doc.text("EMPLOYMENT TYPE:", rightColumnX, professionalStartY + 10);
      doc.text("SECURITY CLEARANCE:", rightColumnX, professionalStartY + 20);
      doc.text("TRAINING COMPLETED:", rightColumnX, professionalStartY + 30);
      doc.text("PERFORMANCE RATING:", rightColumnX, professionalStartY + 40);
      doc.text("YEARS OF SERVICE:", rightColumnX, professionalStartY + 50);

      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      // Default values for additional fields (you can customize these)
      const department = staff.department || "Flight Operations";
      const employmentType = staff.employmentType || "Full-time";
      const securityClearance = staff.securityClearance || "Level 3";
      const trainingCompleted = staff.trainingCompleted || "Advanced Safety Training";
      const performanceRating = staff.performanceRating || "4.8/5.0";
      const yearsOfService = staff.yearsOfService || "3.5 years";
      
      doc.text(department, rightColumnX + 50, professionalStartY);
      doc.text(employmentType, rightColumnX + 50, professionalStartY + 10);
      doc.text(securityClearance, rightColumnX + 50, professionalStartY + 20);
      doc.text(trainingCompleted, rightColumnX + 50, professionalStartY + 30);
      doc.text(performanceRating, rightColumnX + 50, professionalStartY + 40);
      doc.text(yearsOfService, rightColumnX + 50, professionalStartY + 50);

      // Work Schedule Details section
      const scheduleY = professionalY + 95;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("WORK SCHEDULE DETAILS", 20, scheduleY);
      doc.line(20, scheduleY + 3, 115, scheduleY + 3);

      // Schedule table
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(25, scheduleY + 10, pageWidth - 50, 40, 8, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, scheduleY + 10, pageWidth - 50, 40, 8, 8, 'S');

      const scheduleStartY = scheduleY + 22;
      doc.setFontSize(10);
      
      // Schedule headers
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("SCHEDULE TYPE", 35, scheduleStartY);
      doc.text("SHIFT START", 90, scheduleStartY);
      doc.text("SHIFT END", 140, scheduleStartY);
      doc.text("TOTAL HOURS", 170, scheduleStartY);

      // Schedule data
      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(sanitizeText(staff.schedule), 35, scheduleStartY + 15);
      doc.text(`${sanitizeText(staff.shiftStartDate)} ${sanitizeText(staff.shiftStartTime)}`, 90, scheduleStartY + 15);
      doc.text(`${sanitizeText(staff.shiftEndDate)} ${sanitizeText(staff.shiftEndTime)}`, 140, scheduleStartY + 15);
      
      // Calculate total hours (example calculation)
      const totalHours = staff.totalHours || "40 hrs/week";
      doc.text(totalHours, 170, scheduleStartY + 15);

      // Emergency Contact Section (if available)
      const emergencyY = scheduleY + 65;
      if (staff.emergencyContact || staff.emergencyPhone) {
        doc.setFontSize(18);
        doc.setTextColor(0, 90, 156);
        doc.setFont("helvetica", "bold");
        doc.text("EMERGENCY CONTACT", 20, emergencyY);
        doc.line(20, emergencyY + 3, 105, emergencyY + 3);

        doc.setFillColor(255, 245, 245);
        doc.roundedRect(25, emergencyY + 10, pageWidth - 50, 25, 8, 8, 'F');
        doc.setDrawColor(220, 100, 100);
        doc.roundedRect(25, emergencyY + 10, pageWidth - 50, 25, 8, 8, 'S');

        const emergencyStartY = emergencyY + 22;
        doc.setFontSize(11);
        doc.setTextColor(0, 90, 156);
        doc.setFont("helvetica", "bold");
        doc.text("CONTACT PERSON:", 35, emergencyStartY);
        doc.text("EMERGENCY PHONE:", 120, emergencyStartY);

        doc.setTextColor(51, 51, 51);
        doc.setFont("helvetica", "normal");
        doc.text(staff.emergencyContact || "Not Provided", 75, emergencyStartY);
        doc.text(staff.emergencyPhone || "Not Provided", 160, emergencyStartY);
      }

      // Staff Summary section
      const summaryY = emergencyY + (staff.emergencyContact ? 50 : 20);
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("STAFF SUMMARY", 20, summaryY);
      doc.line(20, summaryY + 3, 85, summaryY + 3);

      // Summary box
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(25, summaryY + 10, pageWidth - 50, 45, 6, 6, 'F');
      doc.setDrawColor(255, 193, 7);
      doc.roundedRect(25, summaryY + 10, pageWidth - 50, 45, 6, 6, 'S');

      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      const staffSummary = [
        `✓ ${sanitizeText(staff.name)} serves as a ${sanitizeText(staff.role)} at AIRGO Airlines`,
        `✓ Certified in ${sanitizeText(staff.certificate)} with ${yearsOfService} of service`,
        `✓ Current status: ${sanitizeText(staff.status)} - Following ${staff.schedule || 'regular'} schedule`,
        `✓ Contact: ${sanitizeText(staff.num)} | ${sanitizeText(staff.email)}`,
        `✓ Performance Rating: ${performanceRating} | Security Clearance: ${securityClearance}`
=======
      // Helpers
      const sectionHeader = (label) => [
        {
          content: label,
          colSpan: 2,
          styles: {
            fillColor: [240, 248, 255],
            textColor: primary,
            fontStyle: "bold",
          },
        },
>>>>>>> c1627f29a16feb7fb20cb61811f551ade539c227
      ];

      // PERSONAL INFORMATION
      autoTable(doc, {
        startY: y,
        margin: { top: marginTop, bottom: marginBottom, left: 10, right: 10 },
        didDrawPage: (data) => {
          header();
          footer(data);
        },
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          halign: "left",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold", textColor: primary },
          1: { cellWidth: "auto" },
        },
        theme: "grid",
        body: [
          sectionHeader("PERSONAL INFORMATION"),
          ["Staff ID", sanitizeText(staff.id)],
          ["Name", sanitizeText(staff.name)],
          ["Role", sanitizeText(staff.role)],
        ],
      });

      y = doc.lastAutoTable.finalY + 6;

      // CONTACT DETAILS
      autoTable(doc, {
        startY: y,
        margin: { top: marginTop, bottom: marginBottom, left: 10, right: 10 },
        didDrawPage: (data) => {
          header();
          footer(data);
        },
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold", textColor: primary },
          1: { cellWidth: "auto" },
        },
        theme: "grid",
        body: [
          sectionHeader("CONTACT DETAILS"),
          ["Contact Number", sanitizeText(staff.num)],
          ["Email Address", sanitizeText(staff.email)],
        ],
      });

      y = doc.lastAutoTable.finalY + 6;

      // PROFESSIONAL DETAILS
      const status = sanitizeText(staff.status);
      const statusRGB = statusColorsRGB[status] || primary;

      autoTable(doc, {
        startY: y,
        margin: { top: marginTop, bottom: marginBottom, left: 10, right: 10 },
        didDrawPage: (data) => {
          header();
          footer(data);
        },
        styles: {
          font: "helvetica",
          fontSize: 10,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 52, fontStyle: "bold", textColor: primary },
          1: { cellWidth: "auto" },
        },
        theme: "grid",
        didParseCell: (data) => {
          if (
            data.section === "body" &&
            Array.isArray(data.row.raw) &&
            data.row.raw[0] === "Employment Status" &&
            data.column.index === 1
          ) {
            data.cell.styles.textColor = statusRGB;
            data.cell.styles.fontStyle = "bold";
          }
        },
        body: [
          sectionHeader("PROFESSIONAL DETAILS"),
          ["Certification", sanitizeText(staff.certificate)],
          ["Work Schedule", sanitizeText(staff.schedule)],
          [
            "Shift Start",
            `${sanitizeText(staff.shiftStartDate)} ${sanitizeText(staff.shiftStartTime)}`,
          ],
          [
            "Shift End",
            `${sanitizeText(staff.shiftEndDate)} ${sanitizeText(staff.shiftEndTime)}`,
          ],
          ["Employment Status", status],
        ],
      });

      y = doc.lastAutoTable.finalY + 6;

      // STAFF SUMMARY
      const summaryBullets = [
        `✓ ${sanitizeText(staff.name)} is a ${sanitizeText(staff.role)} at AIRGO Airlines`,
        `✓ Certified in ${sanitizeText(staff.certificate)}`,
        `✓ Current status: ${status} - ${sanitizeText(staff.schedule)}`,
      ];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitLines = summaryBullets.flatMap((line) =>
        doc.splitTextToSize(line, pageWidth - 24)
      );
      const lineHeight = 5;
      const boxHeight = 10 + splitLines.length * lineHeight;

      if (y + boxHeight + marginBottom > pageHeight) {
        doc.addPage();
        header();
        y = marginTop;
      }

      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("STAFF SUMMARY", 10, y);
      doc.setDrawColor(primary[0], primary[1], primary[2]);
      doc.setLineWidth(0.5);
      doc.line(10, y + 2.5, 70, y + 2.5);

      const boxY = y + 6;
      doc.setFillColor(255, 248, 225);
      doc.setDrawColor(255, 193, 7);
      doc.roundedRect(10, boxY, pageWidth - 20, boxHeight, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      let textY = boxY + 7;
      splitLines.forEach((l) => {
        doc.text(l, 12, textY);
        textY += lineHeight;
      });

      const fileName = `AIRGO_Staff_${sanitizeText(staff.name).replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${sanitizeText(staff.id)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Staff PDF generation error:", error);
      alert("Error generating staff PDF. Please try again.");
    }
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Table>
          <TableHead
            sx={{
              backgroundColor: "#005a9c",
              background: "linear-gradient(45deg, #005a9c, #0288d1)",
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Contact</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Certificate</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Schedule</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Shift Start Date</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Shift Start Time</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Shift End Date</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Shift End Time</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(0, 90, 156, 0.02)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 90, 156, 0.05)",
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: "#005a9c" }} />
                      <Typography fontWeight="bold" fontFamily="monospace">
                        {row.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "medium" }}>{row.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.role}
                      size="small"
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#005a9c",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.num}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {row.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.certificate}</TableCell>
                  <TableCell>{row.schedule}</TableCell>
                  <TableCell>{row.shiftStartDate}</TableCell>
                  <TableCell>{row.shiftStartTime}</TableCell>
                  <TableCell>{row.shiftEndDate}</TableCell>
                  <TableCell>{row.shiftEndTime}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[row.status],
                        color: "#fff",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit Staff">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => selectedStaff(row)}
                          sx={{
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Staff">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                          sx={{
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.2)" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Generate Staff PDF">
                        <IconButton
                          size="small"
                          sx={{
                            color: "#d32f2f",
                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.2)" },
                          }}
                          onClick={() => generateRowPDF(row)}
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No Staff Members Available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#005a9c",
            color: "white",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          Confirm Staff Deletion
        </DialogTitle>
        <Box sx={{ p: 3 }}>
          <Typography>
            Are you sure you want to delete <strong>{staffToDelete?.name}</strong> (ID:{" "}
            {staffToDelete?.id})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </Box>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button color="error" onClick={confirmDelete} variant="contained" sx={{ borderRadius: 2 }}>
            Delete Staff
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffsTable;