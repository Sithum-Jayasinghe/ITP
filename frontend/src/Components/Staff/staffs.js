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
import StaffVideo from "../Images/st1.mp4"; // ✅ video file

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Custom theme
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
      }),
    [darkMode]
  );

  // ✅ Fetch staff
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
    const filtered = staffs.filter((s) =>
      s.id.toString().toLowerCase().includes(term.toLowerCase()) || // ✅ convert number to string
      s.name.toLowerCase().includes(term.toLowerCase()) ||
      s.role.toLowerCase().includes(term.toLowerCase()) ||
      s.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }
};


 

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />

      {/* ✅ Full Page Video Banner Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          mb: 5,
        }}
      >
        {/* Background Video */}
        <video
          src={StaffVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)", // darken video for text contrast
          }}
        />

        {/* Overlay Text */}
        <Typography
          variant="h3"
          sx={{
            position: "absolute",
            color: "#fff",
            fontWeight: "bold",
            textShadow: "3px 3px 12px rgba(0,0,0,0.8)",
            textAlign: "center",
          }}
        >
          Staff Management System
          <Typography
            variant="h6"
            sx={{ fontWeight: 400, mt: 1, opacity: 0.9 }}
          >
            Manage your airline workforce with ease
          </Typography>
        </Typography>

        {/* Dark mode toggle on banner */}
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        >
          {darkMode ? (
            <Brightness7Icon sx={{ color: "#fff" }} />
          ) : (
            <Brightness4Icon sx={{ color: "#fff" }} />
          )}
        </IconButton>
      </Box>

      {/* ✅ Main Content */}
      <Box sx={{ width: "90%", margin: "auto" }}>
        {/* Search + PDF Export */}
        

        {/* Staff Form */}
        <StaffForm
          addStaff={addStaff}
          updateStaff={updateStaff}
          submitted={submitted}
          data={selectedStaff}
          isEdit={isEdit}
        />

        {/* Staff Table */}
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
