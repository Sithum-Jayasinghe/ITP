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
  Chip,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
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
import FlightIcon from "@mui/icons-material/Flight";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChatIcon from "@mui/icons-material/Chat";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [flightStatus, setFlightStatus] = useState({});
  const [openChat, setOpenChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // ✅ Country → ISO code mapper for flagcdn.com
  const getCountryCode = (countryName) => {
    const codes = {
      "Sri Lanka": "lk",
      "India": "in",
      "United Arab Emirates": "ae",
      "Singapore": "sg",
      "Thailand": "th",
      "United States": "us",
      "Canada": "ca",
      "United Kingdom": "gb",
      "Germany": "de",
      "France": "fr",
      "Australia": "au",
      "Japan": "jp",
      "Brazil": "br",
      "South Africa": "za",
      "China": "cn",
      "Italy": "it",
      "Spain": "es",
      "Netherlands": "nl",
      "Sweden": "se"
    };
    return codes[countryName] || "xx"; // fallback
  };

  // ✅ Get flag URL from flagcdn
  const getCountryFlag = (countryName) => {
    const code = getCountryCode(countryName);
    return `https://flagcdn.com/w40/${code}.png`;
  };

  // USD to LKR conversion rate
  const USD_TO_LKR = 300;

  // Convert USD → LKR
  const convertToLKR = (usdAmount) => Math.round(usdAmount * USD_TO_LKR);

  // Format as currency
  const formatLKR = (amount) => `LKR ${amount.toLocaleString()}`;

  // Simulated data setup
  useEffect(() => {
    getBookings();
    generateRecommendations();
    setupRealTimeData();

    const interval = setInterval(() => {
      simulateRealTimeUpdates();
      checkFlightStatus();
      updatePriceAlerts();
    }, 5000);

    return () => clearInterval(interval);
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
        addRealTimeUpdate(`New booking created: ${data.from} → ${data.to}`);
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
        addRealTimeUpdate(`Booking #${data.id} updated successfully`);
      })
      .catch(() => setSubmitted(false));
  };

  const deleteBooking = (data) => {
    Axios.post("http://localhost:3001/api/deletebooking", data)
      .then(() => {
        getBookings();
        addRealTimeUpdate(`Booking #${data.id} deleted`);
      })
      .catch((err) => console.error(err));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) return setFilteredBooks(books);
    const filtered = books.filter(
      (b) =>
        b.from.toLowerCase().includes(term.toLowerCase()) ||
        b.to.toLowerCase().includes(term.toLowerCase()) ||
        b.id.toString().includes(term)
    );
    setFilteredBooks(filtered);
  };

  const setupRealTimeData = () => {
    setRealTimeUpdates([
      { id: 1, message: "Flight prices to Paris dropped by 15%", timestamp: new Date(), type: "price" },
      { id: 2, message: "New flight route added: Tokyo → Sydney", timestamp: new Date(), type: "route" },
      { id: 3, message: "System updated with new features", timestamp: new Date(), type: "system" }
    ]);

    setPriceAlerts([
      { id: 1, route: "New York → London", oldPrice: convertToLKR(650), newPrice: convertToLKR(550), change: -15.4 },
      { id: 2, route: "Dubai → Singapore", oldPrice: convertToLKR(420), newPrice: convertToLKR(380), change: -9.5 },
      { id: 3, route: "Colombo → Mumbai", oldPrice: convertToLKR(601), newPrice: convertToLKR(526), change: -12.5 }
    ]);

    setFlightStatus({
      "New York → London": { status: "On Time", departure: "08:30", arrival: "20:45", gate: "B12" },
      "Dubai → Singapore": { status: "Delayed", departure: "14:20", arrival: "22:10", gate: "C05" },
      "Colombo → Mumbai": { status: "On Time", departure: "10:15", arrival: "11:45", gate: "A08" }
    });
  };

  const simulateRealTimeUpdates = () => {
    const updateTypes = ["price", "route", "system", "weather", "promotion"];
    const messages = [
      "Last minute deals available for weekend flights",
      "New security measures implemented at major airports",
      "Extra baggage promotion: 25% off this week",
      "Weather alert may affect flights in Northeast region",
      "Loyalty points bonus: Double points on all bookings this month"
    ];

    const newUpdate = {
      id: Date.now(),
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      type: updateTypes[Math.floor(Math.random() * updateTypes.length)]
    };

    setRealTimeUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
  };

  const updatePriceAlerts = () => {
    const routes = [
      "London → Paris",
      "Tokyo → Seoul",
      "Sydney → Melbourne",
      "Berlin → Rome",
      "Colombo → Dubai",
      "Colombo → Singapore"
    ];
    const newRoute = routes[Math.floor(Math.random() * routes.length)];
    const change = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 15);

    const basePriceUSD = 500 + Math.random() * 300;
    const oldPriceLKR = convertToLKR(basePriceUSD);
    const newPriceLKR = convertToLKR(basePriceUSD * (1 + change / 100));

    const newAlert = {
      id: Date.now(),
      route: newRoute,
      oldPrice: oldPriceLKR,
      newPrice: newPriceLKR,
      change: parseFloat(change.toFixed(1))
    };

    setPriceAlerts(prev => [newAlert, ...prev.slice(0, 3)]);
  };

  const checkFlightStatus = () => {
    const statuses = ["On Time", "Delayed", "Boarding", "Departed"];
    const routes = [
      "New York → London",
      "Dubai → Singapore",
      "Tokyo → Sydney",
      "Paris → Berlin",
      "Colombo → Mumbai",
      "Colombo → Male"
    ];

    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    setFlightStatus(prev => ({
      ...prev,
      [randomRoute]: {
        status: randomStatus,
        departure: "08:30",
        arrival: "20:45",
        gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(10 + Math.random() * 20)}`
      }
    }));
  };

  const addRealTimeUpdate = (message) => {
    const newUpdate = {
      id: Date.now(),
      message,
      timestamp: new Date(),
      type: "booking"
    };
    setRealTimeUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "On Time": return "success";
      case "Delayed": return "warning";
      case "Boarding": return "info";
      case "Departed": return "secondary";
      default: return "default";
    }
  };

  const generateRecommendations = () => {
    setRecommendations([
      {
        type: "Best Time",
        message: `Book flights 6–8 weeks early to unlock fares from ${formatLKR(convertToLKR(450))}.`,
        icon: <AccessTimeIcon sx={{ fontSize: 32 }} color="info" />,
        color: "linear-gradient(135deg, #42a5f5, #1e88e5)",
      },
      {
        type: "Upgrade",
        message: `Business Class upgrades from ${formatLKR(convertToLKR(1200))} - 20% cheaper this week.`,
        icon: <UpgradeIcon sx={{ fontSize: 32 }} color="success" />,
        color: "linear-gradient(135deg, #66bb6a, #388e3c)",
      },
      {
        type: "Baggage",
        message: `Extra baggage ${formatLKR(convertToLKR(50))} if purchased during booking.`,
        icon: <WorkIcon sx={{ fontSize: 32 }} color="secondary" />,
        color: "linear-gradient(135deg, #ab47bc, #7b1fa2)",
      },
      {
        type: "Special Offer",
        message: `Colombo to Mumbai: ${formatLKR(convertToLKR(601))} → ${formatLKR(convertToLKR(526))}`,
        icon: <PriceCheckIcon sx={{ fontSize: 32 }} color="warning" />,
        color: "linear-gradient(135deg, #ffa726, #ef6c00)",
      },
    ]);
  };

  const sendChatMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      const responses = [
        "I can help you with that! What specific information do you need?",
        "Great choice! That route is very popular this time of year.",
        `Current best price for Colombo to Mumbai: ${formatLKR(convertToLKR(526))}`,
        "I'll check the availability for you right away.",
        "Based on your preferences, I recommend considering these options...",
        `There's a special promotion running! Prices start from ${formatLKR(convertToLKR(450))}`
      ];

      const aiMessage = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "ai",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
          width: '95%',
          margin: "20px auto",
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
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ✈️ AI-Powered Flight Booking System
            </Typography>
            <Chip
              icon={<LiveTvIcon />}
              label="LIVE"
              color="error"
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              }
              label="Dark Mode"
            />
            <Tooltip title="Refresh real-time data">
              <IconButton onClick={() => {
                setupRealTimeData();
              }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="AI Assistant">
              <IconButton onClick={() => setOpenChat(true)}>
                <ChatIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Dashboard" />
          <Tab label="Bookings" />
          <Tab label="Price Alerts" />
          <Tab label="Flight Status" />
        </Tabs>

        {activeTab === 0 && (
          <>
            {/* Real-Time Updates */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <NotificationsActiveIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" fontWeight="600">
                  Real-Time Updates
                </Typography>
                <Chip label="LIVE" size="small" color="error" sx={{ ml: 2 }} />
              </Box>
              <List>
                {realTimeUpdates.map((update) => (
                  <ListItem key={update.id}>
                    <ListItemIcon>
                      {update.type === 'price' && <TrendingUpIcon color="success" />}
                      {update.type === 'route' && <FlightIcon color="info" />}
                      {update.type === 'system' && <UpgradeIcon color="warning" />}
                      {update.type === 'booking' && <PriceCheckIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={update.message}
                      secondary={new Date(update.timestamp).toLocaleTimeString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Popular Routes */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                🌍 Popular Routes
              </Typography>
              <Grid container spacing={2}>
                {[
                  { from: "Sri Lanka", to: "India", price: convertToLKR(526) },
                  { from: "Canada", to: "United Arab Emirates", price: convertToLKR(850) },
                  { from: "United States", to: "Singapore", price: convertToLKR(720) },
                  { from: "Germany", to: "Thailand", price: convertToLKR(650) }
                ].map((route, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                          <Avatar src={getCountryFlag(route.from)} sx={{ width: 32, height: 32, mr: 1 }} />
                          <FlightIcon sx={{ mx: 1 }} />
                          <Avatar src={getCountryFlag(route.to)} sx={{ width: 32, height: 32, ml: 1 }} />
                        </Box>
                        <Typography variant="body2" fontWeight="500">
                          {route.from} → {route.to}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          From {formatLKR(route.price)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>

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

          </>
        )}

        {activeTab === 1 && (
          <>
            <Divider sx={{ mb: 3 }} />
            <BookForm
              addBooking={addBooking}
              updateBooking={updateBooking}
              submitted={submitted}
              data={selectedBooking}
              isEdit={isEdit}
              darkMode={darkMode}
              bookings={books}
            />
            <BooksTable
              rows={filteredBooks}
              selectedBooking={(data) => {
                setSelectedBooking(data);
                setIsEdit(true);
              }}
              deleteBooking={deleteBooking}
              darkMode={darkMode}
            />
          </>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              🚨 Price Alerts
            </Typography>
            <List>
              {priceAlerts.map((alert) => {
                const [from, to] = alert.route.split('→').map(s => s.trim());
                return (
                  <ListItem key={alert.id}>
                    <ListItemAvatar>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={getCountryFlag(from)} sx={{ width: 24, height: 24, mr: 1 }} />
                        <FlightTakeoffIcon fontSize="small" />
                        <Avatar src={getCountryFlag(to)} sx={{ width: 24, height: 24, ml: 1 }} />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.route}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            color={alert.change < 0 ? "success.main" : "error.main"}
                          >
                            {alert.change < 0 ? '↓' : '↑'} {Math.abs(alert.change)}%
                          </Typography>
                          <Typography variant="body2">
                            {formatLKR(alert.oldPrice)} → {formatLKR(alert.newPrice)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Flight Status
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(flightStatus).map(([route, status]) => {
                const [from, to] = route.split('→').map(s => s.trim());
                return (
                  <Grid item xs={12} sm={6} key={route}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={getCountryFlag(from)} sx={{ width: 24, height: 24, mr: 1 }} />
                          <FlightTakeoffIcon fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>{from}</Typography>
                          <FlightLandIcon fontSize="small" />
                          <Avatar src={getCountryFlag(to)} sx={{ width: 24, height: 24, ml: 1, mr: 1 }} />
                          <Typography variant="body2">{to}</Typography>
                        </Box>
                        <Chip
                          label={status.status}
                          color={getStatusColor(status.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">Departure: {status.departure}</Typography>
                        <Typography variant="body2">Arrival: {status.arrival}</Typography>
                        <Typography variant="body2">Gate: {status.gate}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        )}

        {/* AI Chat */}
        <Dialog open={openChat} onClose={() => setOpenChat(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ChatIcon />
              </Avatar>
              <Typography variant="h6">AI Travel Assistant</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ height: '300px', overflow: 'auto' }}>
            <List>
              {chatMessages.map((msg) => (
                <ListItem key={msg.id}>
                  <Card
                    sx={{
                      bgcolor: msg.sender === 'ai' ? 'primary.light' : 'grey.100',
                      color: msg.sender === 'ai' ? 'white' : 'text.primary',
                      ml: msg.sender === 'user' ? 'auto' : 0,
                      maxWidth: '80%'
                    }}
                  >
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2">{msg.text}</Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <TextField
              placeholder="Ask about flights, prices, or recommendations..."
              fullWidth
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  sendChatMessage(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Books;
