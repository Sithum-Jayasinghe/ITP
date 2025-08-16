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
    deleteStaff({ id: staffToDelete.id });
    setOpenDialog(false);
    setStaffToDelete(null);
  };

  const generateRowPDF = (staff) => {
    const doc = new jsPDF();
    doc.text("Staff Details", 14, 20);

    const tableColumn = ["Field", "Value"];
    const tableRows = [
      ["ID", staff.id],
      ["Name", staff.name],
      ["Role", staff.role],
      ["Contact", staff.num],
      ["Email", staff.email],
      ["Certificate", staff.certificate],
      ["Schedule", staff.schedule],
      ["Status", staff.status],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 118, 255] },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.row.index === 7) {
          data.cell.styles.fillColor = statusColors[staff.status];
          data.cell.styles.textColor = "#fff";
        }
      },
    });

    doc.save(`staff_${staff.id}.pdf`);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
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
                  <TableCell>
                    <Chip label={row.status} sx={{ backgroundColor: statusColors[row.status], color: "#fff" }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Update">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => selectedStaff(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Export PDF">
                      <IconButton
                        size="small"
                        sx={{ color: "#ff9800" }}
                        onClick={() => generateRowPDF(row)}
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No Data Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
