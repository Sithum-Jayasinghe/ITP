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
import Logo from '../Images/logo.png';

// ✅ Status chip colors
const statusColors = {
  Active: "#4caf50",
  Inactive: "#9e9e9e",
  "On Leave": "#ff9800",
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
    if (!text) return "N/A";
    return text.toString().replace(/[^\x20-\x7E]/g, '');
  };

  // ✅ Generate Modern Professional PDF with Logo
  const generateRowPDF = (staff) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Set default font
      doc.setFont("helvetica");

      // Premium Header with modern gradient
      doc.setFillColor(0, 90, 156);
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Add AIRGO logo - with better error handling
      try {
        if (Logo) {
          doc.addImage(Logo, 'PNG', 20, 20, 35, 35);
        } else {
          throw new Error('Logo not available');
        }
      } catch (error) {
        console.log('Using text fallback for logo');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("✈ AIRGO", 35, 40);
      }
      
      // Company header
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("AIRGO AIRLINES", pageWidth / 2, 35, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255, 0.9);
      doc.setFont("helvetica", "normal");
      doc.text("Staff Management System", pageWidth / 2, 48, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255, 0.8);
      doc.text("Confidential Staff Document", pageWidth / 2, 58, { align: "center" });

      // Staff ID section with modern card design
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(15, 90, pageWidth - 30, 25, 8, 8, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.8);
      doc.roundedRect(15, 90, pageWidth - 30, 25, 8, 8, 'S');
      
      doc.setFontSize(16);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text(`STAFF PROFILE: ${sanitizeText(staff.name).toUpperCase()}`, pageWidth / 2, 102, { align: "center" });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated for HR Use: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, pageWidth / 2, 110, { align: "center" });

      // Personal Information section
      const personalY = 130;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("PERSONAL INFORMATION", 20, personalY);
      
      // Modern divider
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(1);
      doc.line(20, personalY + 3, 100, personalY + 3);

      // Personal info cards
      const cardY = personalY + 15;
      
      // Staff ID Card
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(25, cardY, 75, 35, 6, 6, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, cardY, 75, 35, 6, 6, 'S');
      
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("STAFF ID", 62.5, cardY + 10, { align: "center" });
      doc.setFontSize(16);
      doc.setTextColor(51, 51, 51);
      doc.text(sanitizeText(staff.id.toString()), 62.5, cardY + 25, { align: "center" });
      
      // Role Card
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(120, cardY, 75, 35, 6, 6, 'F');
      doc.setDrawColor(0, 90, 156);
      doc.roundedRect(120, cardY, 75, 35, 6, 6, 'S');
      
      doc.setTextColor(0, 90, 156);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ROLE", 157.5, cardY + 10, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.text(sanitizeText(staff.role), 157.5, cardY + 25, { align: "center" });

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
      doc.text(email.length > 30 ? email.substring(0, 30) + '...' : email, 85, contactStartY + 15);

      // Professional Details section
      const professionalY = contactY + 65;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("PROFESSIONAL DETAILS", 20, professionalY);
      doc.line(20, professionalY + 3, 110, professionalY + 3);

      // Professional table
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(25, professionalY + 10, pageWidth - 50, 50, 8, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(25, professionalY + 10, pageWidth - 50, 50, 8, 8, 'S');

      const professionalStartY = professionalY + 22;
      doc.setFontSize(10);
      
      // Left column
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATION:", 35, professionalStartY);
      doc.text("WORK SCHEDULE:", 35, professionalStartY + 10);
      doc.text("SHIFT START:", 35, professionalStartY + 20);
      doc.text("SHIFT END:", 35, professionalStartY + 30);

      doc.setTextColor(51, 51, 51);
      doc.setFont("helvetica", "normal");
      doc.text(sanitizeText(staff.certificate), 85, professionalStartY);
      doc.text(sanitizeText(staff.schedule), 85, professionalStartY + 10);
      doc.text(`${sanitizeText(staff.shiftStartDate)} ${sanitizeText(staff.shiftStartTime)}`, 85, professionalStartY + 20);
      doc.text(`${sanitizeText(staff.shiftEndDate)} ${sanitizeText(staff.shiftEndTime)}`, 85, professionalStartY + 30);

      // Right column - Status
      const rightColumnX = 120;
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("EMPLOYMENT STATUS:", rightColumnX, professionalStartY);

      // Status with color coding
      const status = sanitizeText(staff.status);
      let statusColor = [0, 90, 156]; // Default blue
      if (status === "Active") statusColor = [76, 175, 80]; // Green
      else if (status === "Inactive") statusColor = [158, 158, 158]; // Gray
      else if (status === "On Leave") statusColor = [255, 152, 0]; // Orange
      
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(status, rightColumnX + 50, professionalStartY);

      // Staff Summary section
      const summaryY = professionalY + 75;
      doc.setFontSize(18);
      doc.setTextColor(0, 90, 156);
      doc.setFont("helvetica", "bold");
      doc.text("STAFF SUMMARY", 20, summaryY);
      doc.line(20, summaryY + 3, 85, summaryY + 3);

      // Summary box
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(25, summaryY + 10, pageWidth - 50, 35, 6, 6, 'F');
      doc.setDrawColor(255, 193, 7);
      doc.roundedRect(25, summaryY + 10, pageWidth - 50, 35, 6, 6, 'S');

      doc.setFontSize(9);
      doc.setTextColor(102, 102, 102);
      const staffSummary = [
        `✓ ${sanitizeText(staff.name)} is a ${sanitizeText(staff.role)} at AIRGO Airlines`,
        `✓ Certified in ${sanitizeText(staff.certificate)}`,
        `✓ Current status: ${sanitizeText(staff.status)} - ${staff.schedule || 'Regular schedule'}`
      ];

      staffSummary.forEach((info, index) => {
        doc.text(info, 30, summaryY + 20 + (index * 8));
      });

      // Footer with modern design
      doc.setFillColor(0, 90, 156);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text("AIRGO Airlines - Human Resources Department", pageWidth / 2, pageHeight - 14, { align: "center" });
      doc.text("Confidential Document - For Internal Use Only | hr@airgo.com | +1 (800) AIRGO-HR", pageWidth / 2, pageHeight - 8, { align: "center" });

      // Security features
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      const securityCode = `STAFF-${staff.id}-${new Date().getTime().toString().slice(-6)}`;
      doc.text(`Document ID: ${securityCode}`, pageWidth / 2, pageHeight - 25, { align: "center" });

      // Modern page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

      // Save with professional filename
      const fileName = `AIRGO_Staff_${sanitizeText(staff.name).replace(/[^a-zA-Z0-9]/g, '_')}_${staff.id}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Staff PDF generation error:', error);
      alert('Error generating staff PDF. Please try again.');
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
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Table>
          <TableHead sx={{ 
            backgroundColor: '#005a9c',
            background: 'linear-gradient(45deg, #005a9c, #0288d1)'
          }}>
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
                    '&:nth-of-type(even)': { 
                      backgroundColor: 'rgba(0, 90, 156, 0.02)' 
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 90, 156, 0.05)'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: '#005a9c' }} />
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
                        backgroundColor: '#e3f2fd',
                        color: '#005a9c',
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.num}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
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
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Staff">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => selectedStaff(row)}
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
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
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)' }
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
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.2)' }
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
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#005a9c', 
          color: 'white',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12
        }}>
          Confirm Staff Deletion
        </DialogTitle>
        <Box sx={{ p: 3 }}>
          <Typography>
            Are you sure you want to delete <strong>{staffToDelete?.name}</strong> (ID: {staffToDelete?.id})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </Box>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            color="error" 
            onClick={confirmDelete}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Staff
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffsTable;