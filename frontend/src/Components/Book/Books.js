// src/components/Books/Books.js
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import BookForm from "./BookForm";
import BooksTable from "./BooksTable";
import Axios from "axios";
import { useEffect, useState } from "react";
import Header from "../Main/Header";
import InsightsIcon from "@mui/icons-material/Insights";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import WorkIcon from "@mui/icons-material/Work";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getBookings();
    generateRecommendations();
  }, []);

  const getBookings = () => {
    Axios.get("http://localhost:3001/api/bookings")
      .then((res) => {
        setBooks(res.data?.response || []);
        setFilteredBooks(res.data?.response || []);
      })
      .catch((err) => console.error(err));
  };

  const addBooking = (data) => {
    setSubmitted(true);
    const maxId = books.length > 0 ? Math.max(...books.map((b) => b.id)) : 0;
    const newData = { ...data, id: maxId + 1 };
    Axios.post("http://localhost:3001/api/createbooking", newData)
      .then(() => {
        getBookings();
        setSubmitted(false);
        setIsEdit(false);
        setSelectedBooking({});
      })
      .catch(() => setSubmitted(false));
  };

  const updateBooking = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatebooking", data)
      .then(() => {
        getBookings();
        setSubmitted(false);
        setIsEdit(false);
        setSelectedBooking({});
      })
      .catch(() => setSubmitted(false));
  };

  const deleteBooking = (data) => {
    Axios.post("http://localhost:3001/api/deletebooking", data)
      .then(() => getBookings())
      .catch((err) => console.error(err));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) return setFilteredBooks(books);
    const filtered = books.filter(
      (b) =>
        b.from.toLowerCase().includes(term.toLowerCase()) ||
        b.to.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  // === AI-Driven Predictive Booking & Recommendation Engine (demo) ===
  const generateRecommendations = () => {
    setRecommendations([
      {
        type: "Best Time",
        message: "Book flights 6–8 weeks early to unlock the lowest fares.",
        icon: <AccessTimeIcon sx={{ fontSize: 32 }} color="info" />,
        color: "linear-gradient(135deg, #42a5f5, #1e88e5)",
      },
      {
        type: "Upgrade",
        message: "Business Class upgrades are trending 20% cheaper this week.",
        icon: <UpgradeIcon sx={{ fontSize: 32 }} color="success" />,
        color: "linear-gradient(135deg, #66bb6a, #388e3c)",
      },
      {
        type: "Baggage",
        message: "Extra baggage is 10% cheaper if purchased during booking.",
        icon: <WorkIcon sx={{ fontSize: 32 }} color="secondary" />,
        color: "linear-gradient(135deg, #ab47bc, #7b1fa2)",
      },
      {
        type: "Disruption Alert",
        message: "Evening flights CMB → DXB may face congestion delays.",
        icon: <WarningAmberIcon sx={{ fontSize: 32 }} color="warning" />,
        color: "linear-gradient(135deg, #ffa726, #ef6c00)",
      },
    ]);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: darkMode ? "#121212" : "#f5f5f5",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <Header />

      <Box
        sx={{
          width: "90%",
          margin: "50px auto",
          padding: "20px",
          borderRadius: 3,
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        }}
      >
        {/* Title + Dark Mode Toggle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ✈️ AI-Driven Predictive Booking & Recommendations
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            }
            label="Dark Mode"
          />
        </Box>

        {/* AI Recommendations Section */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: darkMode ? "#2a2a2a" : "#e8f4fd",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <InsightsIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="600">
              Smart Recommendations
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {recommendations.map((rec, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    height: "100%",
                    background: rec.color,
                    color: "#fff",
                  }}
                >
                  <Box sx={{ mb: 1 }}>{rec.icon}</Box>
                  <Typography variant="subtitle1" fontWeight="700">
                    {rec.type}
                  </Typography>
                  <Typography variant="body2">{rec.message}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Search */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search bookings..."
            fullWidth
            sx={{
              input: { color: darkMode ? "#fff" : "#000" },
              label: { color: darkMode ? "#fff" : "#000" },
            }}
          />
        </Box>

        {/* Booking Form */}
        <BookForm
          addBooking={addBooking}
          updateBooking={updateBooking}
          submitted={submitted}
          data={selectedBooking}
          isEdit={isEdit}
          darkMode={darkMode}
        />

        {/* Bookings Table */}
        <BooksTable
          rows={filteredBooks}
          selectedBooking={(data) => {
            setSelectedBooking(data);
            setIsEdit(true);
          }}
          deleteBooking={deleteBooking}
          darkMode={darkMode}
        />
      </Box>
    </Box>
  );
};

export default Books;
