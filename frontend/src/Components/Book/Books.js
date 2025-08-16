import { Box, Typography, TextField, Switch, FormControlLabel } from "@mui/material";
import BookForm from "./BookForm";
import BooksTable from "./BooksTable";
import Axios from "axios";
import { useEffect, useState } from "react";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => { getBookings(); }, []);

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
    const maxId = books.length > 0 ? Math.max(...books.map(b => b.id)) : 0;
    const newData = { ...data, id: maxId + 1 };
    Axios.post("http://localhost:3001/api/createbooking", newData)
      .then(() => { getBookings(); setSubmitted(false); setIsEdit(false); setSelectedBooking({}); })
      .catch(() => setSubmitted(false));
  };

  const updateBooking = (data) => {
    setSubmitted(true);
    Axios.post("http://localhost:3001/api/updatebooking", data)
      .then(() => { getBookings(); setSubmitted(false); setIsEdit(false); setSelectedBooking({}); })
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
      b => b.from.toLowerCase().includes(term.toLowerCase()) || b.to.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBooks(filtered);
  };

  return (
    <Box sx={{ width: "90%", margin: "50px auto", padding: "20px", borderRadius: 3, backgroundColor: darkMode ? "#121212" : "#f5f5f5", color: darkMode ? "#fff" : "#000" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Flight Bookings</Typography>
        <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark Mode" />
      </Box>

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

      {/* Form */}
      <BookForm addBooking={addBooking} updateBooking={updateBooking} submitted={submitted} data={selectedBooking} isEdit={isEdit} darkMode={darkMode} />

      {/* Table */}
      <BooksTable rows={filteredBooks} selectedBooking={(data) => { setSelectedBooking(data); setIsEdit(true); }} deleteBooking={deleteBooking} darkMode={darkMode} />
    </Box>
  );
};

export default Books;
