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
} from "@mui/material";
import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

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

  // ✅ Generate PDF with updated shift fields
  const generateRowPDF = (staff) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    // Header
    doc.setFillColor(0, 122, 204);
    doc.rect(0, 0, 210, 25, "F");
    doc.setFontSize(18);
    doc.setTextColor("#ffffff");
    doc.text("✈️ AirGo Airlines", 14, 16);
    doc.setFontSize(11);
    doc.text("Staff Management System", 150, 16);

    // Title
    doc.setFontSize(14);
    doc.setTextColor("#000000");
    doc.text(`Staff Details Report - ${String(staff.name || "")}`, 14, 40);

    // Table
    const tableColumn = ["Field", "Value"];
    const tableRows = [
      ["ID", String(staff.id || "")],
      ["Name", String(staff.name || "")],
      ["Role", String(staff.role || "")],
      ["Contact", String(staff.num || "")],
      ["Email", String(staff.email || "")],
      ["Certificate", String(staff.certificate || "")],
      ["Schedule", String(staff.schedule || "")],
      ["Shift Start Date", String(staff.shiftStartDate || "")],
      ["Shift Start Time", String(staff.shiftStartTime || "")],
      ["Shift End Date", String(staff.shiftEndDate || "")],
      ["Shift End Time", String(staff.shiftEndTime || "")],
      ["Status", String(staff.status || "")],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "striped",
      headStyles: { fillColor: [0, 122, 204], textColor: "#fff", fontStyle: "bold" },
      bodyStyles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.row.index === 11) {
          data.cell.styles.fillColor = statusColors[staff.status] || "#ccc";
          data.cell.styles.textColor = "#fff";
        }
      },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor("#666666");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, pageHeight - 10);
    doc.text(`AirGo Airlines | Page 1 of 1`, 160, pageHeight - 10);

    doc.save(`AirGo_Staff_${staff.id}.pdf`);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ mt: 2, borderRadius: 3, overflow: "hidden", boxShadow: 3 }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#007acc" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff" }}>Name</TableCell>
              <TableCell sx={{ color: "#fff" }}>Role</TableCell>
              <TableCell sx={{ color: "#fff" }}>Contact</TableCell>
              <TableCell sx={{ color: "#fff" }}>Email</TableCell>
              <TableCell sx={{ color: "#fff" }}>Certificate</TableCell>
              <TableCell sx={{ color: "#fff" }}>Schedule</TableCell>
              <TableCell sx={{ color: "#fff" }}>Shift Start Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Shift Start Time</TableCell>
              <TableCell sx={{ color: "#fff" }}>Shift End Date</TableCell>
              <TableCell sx={{ color: "#fff" }}>Shift End Time</TableCell>
              <TableCell sx={{ color: "#fff" }}>Status</TableCell>
              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.num}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.certificate}</TableCell>
                  <TableCell>{row.schedule}</TableCell>
                  <TableCell>{row.shiftStartDate}</TableCell>
                  <TableCell>{row.shiftStartTime}</TableCell>
                  <TableCell>{row.shiftEndDate}</TableCell>
                  <TableCell>{row.shiftEndTime}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      sx={{
                        backgroundColor: statusColors[row.status],
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Update">
                      <IconButton size="small" color="primary" onClick={() => selectedStaff(row)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Export PDF">
                      <IconButton size="small" sx={{ color: "#ff9800" }} onClick={() => generateRowPDF(row)}>
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} align="center">
                  No Data Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Delete */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Are you sure you want to delete this staff member?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StaffsTable;
