import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, IconButton, Paper, Typography, Fab, CircularProgress, Avatar, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";

// Styled components for the chatbot
const ChatContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 90,
  right: 30,
  width: 360,
  height: 500,
  borderRadius: 12,
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  zIndex: 999,
  overflow: "hidden",
  transition: "all 0.3s ease",
}));

const Header = styled(Box)(({ theme }) => ({
  background: "linear-gradient(90deg, #1a2a6c, #2b59c3)",
  color: "white",
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  backgroundColor: "#f8f9fa",
}));

const MessageBubble = styled(Paper)(({ theme, sender }) => ({
  padding: theme.spacing(1.5),
  maxWidth: "75%",
  borderRadius: 18,
  wordBreak: "break-word",
  backgroundColor: sender === "user" ? "#1976d2" : "#e0e0e0",
  color: sender === "user" ? "#fff" : "#000",
  borderBottomRightRadius: sender === "user" ? 4 : 18,
  borderBottomLeftRadius: sender === "user" ? 18 : 4,
  alignSelf: sender === "user" ? "flex-end" : "flex-start",
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: "white",
  display: "flex",
  gap: theme.spacing(1),
  borderTop: "1px solid #e9ecef",
}));

const QuickReplies = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const QuickReply = styled(Paper)(({ theme }) => ({
  backgroundColor: "#e9ecef",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 18,
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "#dee2e6",
  },
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 1.5),
  backgroundColor: "#e9ecef",
  borderRadius: 18,
  alignSelf: "flex-start",
  marginBottom: theme.spacing(1),
  maxWidth: 70,
}));

const TypingDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  backgroundColor: "#6c757d",
  borderRadius: "50%",
  animation: "typingAnimation 1.4s infinite ease-in-out",
}));

const ResetButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: 10,
  right: 50,
  minWidth: "auto",
  padding: theme.spacing(0.5),
  color: "white",
}));

const UserIcon = styled(Box)(({ theme, open }) => ({
  position: "fixed",
  bottom: 100,
  right: 100,
  zIndex: 998,
  opacity: open ? 0 : 0.6,
  transition: "opacity 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

// AirGo flight data
const flightData = {
  "AG123": {
    route: "New York (JFK) to London (LHR)",
    status: "On Time",
    departure: "08:45 AM",
    arrival: "08:30 PM",
    gate: "B12",
    duration: "7h 45m"
  },
  "AG456": {
    route: "Los Angeles (LAX) to Tokyo (HND)",
    status: "Delayed",
    departure: "10:30 AM (Now 11:15 AM)",
    arrival: "02:00 PM (Next day)",
    gate: "A5",
    duration: "12h 30m"
  },
  "AG789": {
    route: "Paris (CDG) to Dubai (DXB)",
    status: "On Time",
    departure: "06:20 PM",
    arrival: "03:40 AM (Next day)",
    gate: "C8",
    duration: "6h 50m"
  }
};

// AirGo responses
const responses = {
  "greeting": "Hello! Welcome to AirGo Airlines. How can I assist you with your travel today?",
  "flight status": "I can check the status of your flight. Please provide your flight number (e.g., AG123).",
  "booking": "For booking information, I'll need your booking reference number. You can find it in your confirmation email.",
  "baggage": "AirGo Airlines allows 1 carry-on bag (up to 10kg) and 1 personal item. Checked baggage allowance depends on your fare class: Economy - 1 bag (23kg), Premium Economy - 2 bags (23kg each), Business - 3 bags (32kg each).",
  "check-in": "Online check-in opens 24 hours before departure and closes 2 hours before departure. You can check in on our website or mobile app.",
  "flight change": "Flight changes are subject to fare rules. You can change your flight online or contact our support team for assistance.",
  "refund": "Refund policies depend on your fare type. Please provide your booking reference for specific information.",
  "contact": "You can reach AirGo customer service at 1-800-AIR-GO-123 or support@airgo.com. We're available 24/7.",
  "default": "I'm sorry, I didn't understand that. Could you please rephrase or ask about flight status, booking, baggage, check-in, or other airline services?"
};

// Track user sessions
const userSessions = new Map();
let sessionId = 1;

function Chatbot() {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm your AirGo Airlines virtual assistant. How can I help you with your travel plans today?",
      quickReplies: ["Flight status", "Booking information", "Baggage policy", "Check-in"]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    // Initialize a new session when component mounts or when reset
    if (!currentSession) {
      const newSessionId = `user_${sessionId++}`;
      setCurrentSession(newSessionId);
      userSessions.set(newSessionId, {
        messages: [
          { 
            sender: "bot", 
            text: "Hello! I'm your AirGo Airlines virtual assistant. How can I help you with your travel plans today?",
            quickReplies: ["Flight status", "Booking information", "Baggage policy", "Check-in"]
          }
        ],
        createdAt: new Date()
      });
    }
  }, [currentSession]);

  const processMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    let response = "";
    
    // Check for flight number pattern like AG123
    const flightNumberMatch = message.match(/\bAG\d{3}\b/i);
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      response = responses["greeting"];
    } else if (flightNumberMatch) {
      const flightNum = flightNumberMatch[0].toUpperCase();
      if (flightData[flightNum]) {
        const flight = flightData[flightNum];
        response = `Flight ${flightNum} (${flight.route}):\nStatus: ${flight.status}\nDeparture: ${flight.departure}\nArrival: ${flight.arrival}\nGate: ${flight.gate}\nDuration: ${flight.duration}`;
        
        // Check if this looks like a completed interaction
        if (message.toLowerCase().includes('thank') || message.includes('👍')) {
          setTimeout(() => {
            // Add a prompt for new user after a short delay
            setMessages(prev => [...prev, { 
              sender: "bot", 
              text: "Is there anything else I can help you with? If not, you can start a new conversation by clicking the refresh button.",
              quickReplies: ["New conversation", "Flight status", "Booking"]
            }]);
          }, 1500);
        }
      } else {
        response = `I couldn't find information for flight ${flightNum}. Please check the flight number and try again. Valid examples: AG123, AG456, AG789`;
      }
    } else if (lowerMsg.includes('status')) {
      response = responses["flight status"];
    } else if (lowerMsg.includes('book') || lowerMsg.includes('reservation')) {
      response = responses["booking"];
    } else if (lowerMsg.includes('baggage') || lowerMsg.includes('luggage')) {
      response = responses["baggage"];
    } else if (lowerMsg.includes('check-in') || lowerMsg.includes('check in')) {
      response = responses["check-in"];
    } else if (lowerMsg.includes('change') || lowerMsg.includes('modify')) {
      response = responses["flight change"];
    } else if (lowerMsg.includes('refund') || lowerMsg.includes('cancel')) {
      response = responses["refund"];
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('call') || lowerMsg.includes('phone')) {
      response = responses["contact"];
    } else if (lowerMsg.includes('new conversation') || lowerMsg.includes('start over')) {
      resetConversation();
      return "Starting a new conversation. How can I help you today?";
    } else {
      response = responses["default"];
    }
    
    return response;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setLoading(true);
    const userMessage = input;
    setInput("");

    // Simulate API call delay
    setTimeout(() => {
      const botReply = processMessage(userMessage);
      
      // Add quick replies for common follow-up questions
      let quickReplies = [];
      if (userMessage.match(/\bAG\d{3}\b/i)) {
        quickReplies = ["Baggage policy", "Check-in", "Flight change"];
      } else if (userMessage.toLowerCase().includes('status')) {
        quickReplies = ["AG123", "AG456", "AG789"];
      } else if (userMessage.toLowerCase().includes('thank')) {
        quickReplies = ["New conversation", "Flight status", "Booking information"];
      } else {
        quickReplies = ["Flight status", "Booking", "Baggage policy", "Check-in"];
      }
      
      setMessages(prev => [...prev, { sender: "bot", text: botReply, quickReplies }]);
      setLoading(false);
    }, 1000);
  };

  const sendQuickReply = (message) => {
    setInput(message);
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const resetConversation = () => {
    setCurrentSession(null);
    setMessages([
      { 
        sender: "bot", 
        text: "Hello! I'm your AirGo Airlines virtual assistant. How can I help you with your travel plans today?",
        quickReplies: ["Flight status", "Booking information", "Baggage policy", "Check-in"]
      }
    ]);
  };

  return (
    <>
      {/* User Icon (dimmed when chat is closed) */}
      <UserIcon open={open}>
        <Avatar sx={{ 
          bgcolor: "rgba(25, 118, 210, 0.7)", 
          width: 56, 
          height: 56,
          mb: 1
        }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="caption" sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
          Ask me anything
        </Typography>
      </UserIcon>

      {/* Floating Chat Icon */}
      <Fab
        color="primary"
        sx={{ 
          position: "fixed", 
          bottom: 30, 
          right: 30, 
          zIndex: 999, 
          boxShadow: 3,
          background: "linear-gradient(90deg, #1a2a6c, #2b59c3)"
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      {open && (
        <ChatContainer>
          {/* Header */}
          <Header>
            <Avatar sx={{ bgcolor: "white", color: "#2b59c3" }}>
              <FlightTakeoffIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">AirGo Assistant</Typography>
              <Typography variant="caption">We're here to help</Typography>
            </Box>
            <ResetButton onClick={resetConversation}>
              <RefreshIcon />
            </ResetButton>
            <IconButton 
              onClick={() => setOpen(false)} 
              sx={{ color: "white", marginLeft: "auto" }}
            >
              <CloseIcon />
            </IconButton>
          </Header>

          {/* Messages */}
          <ChatArea>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1
                }}
              >
                <MessageBubble sender={msg.sender}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {msg.text}
                  </Typography>
                  
                  {msg.quickReplies && (
                    <>
                      <Typography variant="caption" sx={{ display: "block", mt: 1, color: msg.sender === "user" ? "rgba(255,255,255,0.8)" : "text.secondary" }}>
                        Suggested questions:
                      </Typography>
                      <QuickReplies>
                        {msg.quickReplies.map((reply, idx) => (
                          <QuickReply 
                            key={idx} 
                            onClick={() => sendQuickReply(reply)}
                            elevation={0}
                          >
                            {reply}
                          </QuickReply>
                        ))}
                      </QuickReplies>
                    </>
                  )}
                </MessageBubble>
              </Box>
            ))}
            
            {loading && (
              <TypingIndicator>
                <TypingDot sx={{ animationDelay: "0s" }} />
                <TypingDot sx={{ animationDelay: "0.2s" }} />
                <TypingDot sx={{ animationDelay: "0.4s" }} />
              </TypingIndicator>
            )}
            
            <div ref={bottomRef} />
          </ChatArea>

          {/* Input */}
          <InputArea>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
            />
            <IconButton 
              color="primary" 
              onClick={sendMessage}
              sx={{ 
                background: "linear-gradient(90deg, #2b59c3, #1a2a6c)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(90deg, #1a2a6c, #2b59c3)",
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </InputArea>
        </ChatContainer>
      )}
      
      <style>
        {`
          @keyframes typingAnimation {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>
    </>
  );
}

export default Chatbot;