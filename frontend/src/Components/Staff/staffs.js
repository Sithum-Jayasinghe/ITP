import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import StaffForm from "./StaffForm";
import StaffsTable from "./StaffsTable";
import Axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "../Main/Header";

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Custom theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#007acc" },
          secondary: { main: "#00c6e6" },
          background: {
            default: darkMode ? "#121212" : "#f5f5f5",
            paper: darkMode ? "#1e1e1e" : "#fff",
          },
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                "& label": { color: darkMode ? "#ccc" : "rgba(0,0,0,0.7)" },
                "& label.Mui-focused": { color: "#00c6e6" },
                "& .MuiInputBase-input": { color: darkMode ? "#fff" : "#000" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: darkMode ? "#555" : "#ccc" },
                  "&:hover fieldset": { borderColor: "#00c6e6" },
                  "&.Mui-focused fieldset": { borderColor: "#00c6e6" },
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [darkMode]
  );

  useEffect(() => {
    getStaffs();
  }, []);

  const getStaffs = () => {
    Axios.get("http://localhost:3001/api/staffs")
      .then((res) => {
        setStaffs(res.data?.response || []);
        setFilteredStaffs(res.data?.response || []);
      })
      .catch((err) => console.error(err));
  };

  const addStaff = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/createstaff", data)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((err) => console.error(err));
  };

  const updateStaff = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatestaff", data)
      .then(() => {
        getStaffs();
        setSubmitted(false);
        setIsEdit(false);
      })
      .catch((err) => console.error(err));
  };

  const deleteStaff = (data) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      Axios.post("http://localhost:3001/api/deletestaff", data)
        .then(() => getStaffs())
        .catch((err) => console.error(err));
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === "") {
      setFilteredStaffs(staffs);
    } else {
      const filtered = staffs.filter(
        (s) =>
          s.name.toLowerCase().includes(term.toLowerCase()) ||
          s.role.toLowerCase().includes(term.toLowerCase()) ||
          s.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredStaffs(filtered);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Staff List", 14, 20);

    const tableColumn = [
      "ID",
      "Name",
      "Role",
      "Contact",
      "Email",
      "Certificate",
      "Schedule",
      "Status",
    ];
    const tableRows = [];

    filteredStaffs.forEach((staff) => {
      const staffData = [
        staff.id,
        staff.name,
        staff.role,
        staff.num,
        staff.email,
        staff.certificate,
        staff.schedule,
        staff.status,
      ];
      tableRows.push(staffData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 118, 255] },
    });

    doc.save("staff_list.pdf");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header /> {/* Added Header at the top */}
      <Box sx={{ width: "90%", margin: "50px auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
            Staff Management System
          </Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {/* Search and PDF */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Search Staff..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.secondary.main,
              "&:hover": { backgroundColor: "#009bbf" },
            }}
            onClick={generatePDF}
          >
            Export PDF
          </Button>
        </Box>

        <StaffForm
          addStaff={addStaff}
          updateStaff={updateStaff}
          submitted={submitted}
          data={selectedStaff}
          isEdit={isEdit}
        />

        <StaffsTable
          rows={filteredStaffs}
          selectedStaff={(data) => {
            setSelectedStaff(data);
            setIsEdit(true);
          }}
          deleteStaff={deleteStaff}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Staffs;
