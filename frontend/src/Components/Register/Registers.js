import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import Axios from "axios";


const Registers = () => {
  const [registers, setRegisters] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  // Form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getRegisters();
  }, []);

  useEffect(() => {
    if (!submitted) {
      clearForm();
    }
  }, [submitted]);

  useEffect(() => {
    if (selectedRegister && selectedRegister.id) {
      setId(selectedRegister.id);
      setName(selectedRegister.name || "");
      setEmail(selectedRegister.email || "");
      setPassword(selectedRegister.password || "");
      setPhone(selectedRegister.phone || "");
      setPreview(selectedRegister.profilePhoto || null);
    }
  }, [selectedRegister]);

  const getRegisters = () => {
    Axios.get("http://localhost:3001/api/registers")
      .then((response) => {
        setRegisters(response.data?.response || []);
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  const clearForm = () => {
    setId("");
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setPreview(null);
    setSelectedRegister({});
    setIsEdit(false);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const payload = {
      id,
      name,
      email,
      password,
      phone,
      profilePhoto: preview, // sending base64 string
    };

    if (isEdit) {
      Axios.post("http://localhost:3001/api/updateregister", payload)
        .then(() => {
          getRegisters();
          setSubmitted(false);
          clearForm();
        })
        .catch((error) => {
          console.error("Axios error:", error);
          setSubmitted(false);
        });
    } else {
      Axios.post("http://localhost:3001/api/createregister", payload)
        .then(() => {
          getRegisters();
          setSubmitted(false);
          clearForm();
        })
        .catch((error) => {
          console.error("Axios error:", error);
          setSubmitted(false);
        });
    }
  };

  const deleteRegister = (data) => {
    Axios.post("http://localhost:3001/api/deleteregister", data)
      .then(() => {
        getRegisters();
      })
      .catch((error) => {
        console.error("Axios error:", error);
      });
  };

  return (
    <Box sx={{ width: "calc(100% - 100px)", margin: "auto", marginTop: "50px" }}>
      {/* Registration Form */}
      <Box
        sx={{
          backgroundColor: "#fff",
          padding: 3,
          marginBottom: 5,
          borderRadius: 2,
          maxWidth: 600,
          marginX: "auto",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {isEdit ? "Update Register" : "Add New Register"}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          {preview ? (
            <Avatar src={preview} alt="Profile" sx={{ width: 120, height: 120, borderRadius: 2 }} variant="rounded" />
          ) : (
            <Avatar sx={{ width: 120, height: 120, bgcolor: "#ccc", borderRadius: 2 }} variant="rounded" />
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "block" }}
          />
        </Box>

        {/* Form Fields */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>ID</Typography>
            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: 16 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Name</Typography>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: 16 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Email</Typography>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: 16 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Password</Typography>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: 16 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Phone</Typography>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "8px", fontSize: 16 }}
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#00c6e6", color: "#000", width: 150 }}
              onClick={handleSubmit}
              disabled={submitted}
            >
              {isEdit ? "Update" : "Add"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Cards Display */}
      {registers.length === 0 ? (
        <Typography align="center" sx={{ mt: 5, color: "#666" }}>
          No data available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {registers.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 2,
                  gap: 2,
                  minHeight: 140,
                }}
              >
                <Avatar
                  src={row.profilePhoto}
                  alt={row.name}
                  sx={{ width: 100, height: 100, borderRadius: 2 }}
                  variant="rounded"
                />

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {row.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>ID:</strong> {row.id}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Email:</strong> {row.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Phone:</strong> {row.phone}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                    <strong>Password:</strong> {row.password}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedRegister(row);
                      setIsEdit(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      if (window.confirm("Are you sure?")) deleteRegister(row);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Registers;
