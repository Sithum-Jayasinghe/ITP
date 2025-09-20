import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Fab,
  Avatar,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { styled } from "@mui/material/styles";

// ---------------- Styled Components ----------------
const ChatContainer = styled(Paper)(() => ({
  position: "fixed",
  bottom: 90,
  right: 30,
  width: 380,
  height: 520,
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
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

const MessageBubble = styled(Paper)(({ sender }) => ({
  padding: "12px 16px",
  maxWidth: "75%",
  borderRadius: 18,
  wordBreak: "break-word",
  backgroundColor: sender === "user" ? "#1976d2" : "#e0e0e0",
  color: sender === "user" ? "#fff" : "#000",
  borderBottomRightRadius: sender === "user" ? 4 : 18,
  borderBottomLeftRadius: sender === "user" ? 18 : 4,
  alignSelf: sender === "user" ? "flex-end" : "flex-start",
  fontSize: "0.9rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  animation: "fadeIn 0.4s ease",
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: "white",
  display: "flex",
  gap: theme.spacing(1),
  borderTop: "1px solid #e9ecef",
  alignItems: "center",
}));

const QuickReplies = styled(Box)(() => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
}));

const QuickReply = styled(Paper)(() => ({
  backgroundColor: "#e9ecef",
  padding: "4px 12px",
  borderRadius: 18,
  fontSize: "0.8rem",
  cursor: "pointer",
  "&:hover": { backgroundColor: "#dee2e6" },
}));

const TypingIndicator = styled(Box)(() => ({
  display: "flex",
  gap: 6,
  padding: "8px 12px",
  backgroundColor: "#e9ecef",
  borderRadius: 18,
  alignSelf: "flex-start",
  marginBottom: 8,
  maxWidth: 70,
}));

const TypingDot = styled(Box)(() => ({
  width: 8,
  height: 8,
  backgroundColor: "#6c757d",
  borderRadius: "50%",
  animation: "typingAnimation 1.4s infinite ease-in-out",
}));

const ResetButton = styled(Button)(() => ({
  position: "absolute",
  top: 10,
  right: 50,
  minWidth: "auto",
  padding: 4,
  color: "white",
}));

const UserIcon = styled(Box)(({ open }) => ({
  position: "fixed",
  bottom: 100,
  right: 100,
  zIndex: 998,
  opacity: open ? 0 : 0.7,
  transition: "opacity 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

// ---------------- Chatbot ----------------
function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to **AirGo Airlines**! I can help you with bookings, flight status, baggage, and check-in.",
      quickReplies: [
        "✈️ Book flight",
        "📍 Flight status",
        "🎒 Baggage policy",
        "🕒 Check-in",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef();

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Voice recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
  }

  const startListening = () => {
    if (!recognition) return alert("Speech recognition not supported.");
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  // ---------------- AI Bot Logic ----------------
  const processMessage = (msg) => {
    const m = msg.toLowerCase();

    // Booking detection
    if (m.includes("book")) {
      const routeMatch = msg.match(/from\s+(\w+)\s+to\s+(\w+)/i);
      const dateMatch = msg.match(/on\s+(\d{1,2}\s+\w+)/i);
      let reply = "✈️ Sure, let's book your flight.";
      if (routeMatch) {
        reply += ` I see you're flying from **${routeMatch[1]}** to **${routeMatch[2]}**.`;
      }
      if (dateMatch) {
        reply += ` Departure on **${dateMatch[1]}**.`;
      }
      reply += "\n\n➡️ Please confirm passengers and class (Economy/Business).";
      return reply;
    }

    // Flight status
    if (m.includes("status")) {
      return "📍 Please provide your flight number (e.g., AG123).";
    }

    // Baggage
    if (m.includes("baggage")) {
      return "🎒 *Baggage Policy*: \n- **Economy**: 1 cabin (10kg) + 20kg checked\n- **Business**: 2 cabin + 40kg checked\n- **First Class**: 2 cabin + 50kg checked";
    }

    // Check-in
    if (m.includes("check-in") || m.includes("checkin")) {
      return "🕒 Online check-in opens **24h before departure**. Visit our app or website.";
    }

    // Greetings
    if (m.includes("hello") || m.includes("hi") || m.includes("hey")) {
      return "👋 Hello! How can I help you today?";
    }

    return "🤖 I can assist with bookings, flight status, baggage, or check-in. Try asking me!";
  };

  const sendMessage = (forcedMessage = null) => {
    const userMsg = forcedMessage || input;
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply = processMessage(userMsg);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setLoading(false);
    }, 900);
  };

  const sendQuickReply = (msg) => sendMessage(msg);

  // ---------------- UI ----------------
  return (
    <>
      {/* Floating Icon */}
      <UserIcon open={open}>
        <Avatar
          sx={{
            bgcolor: "rgba(25, 118, 210, 0.7)",
            width: 56,
            height: 56,
            mb: 1,
          }}
        >
          <PersonIcon />
        </Avatar>
        <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)" }}>
          Ask me anything
        </Typography>
      </UserIcon>

      {/* FAB Toggle */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          zIndex: 999,
          background: "linear-gradient(90deg,#1a2a6c,#2b59c3)",
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {open && (
        <ChatContainer>
          {/* Header */}
          <Header>
            <Avatar sx={{ bgcolor: "white", color: "#2b59c3" }}>
              <FlightTakeoffIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">AirGo Assistant</Typography>
              <Typography variant="caption">
                Real-time flight & booking support
              </Typography>
            </Box>
            <ResetButton
              onClick={() =>
                setMessages([
                  {
                    sender: "bot",
                    text: "🔄 New session started. How can I help you?",
                  },
                ])
              }
            >
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
            {messages.map((msg, i) => (
              <MessageBubble key={i} sender={msg.sender}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {msg.text}
                </Typography>
                {msg.quickReplies && (
                  <QuickReplies>
                    {msg.quickReplies.map((r, idx) => (
                      <QuickReply key={idx} onClick={() => sendQuickReply(r)}>
                        {r}
                      </QuickReply>
                    ))}
                  </QuickReplies>
                )}
              </MessageBubble>
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
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              size="small"
            />
            <IconButton
              onClick={startListening}
              color={listening ? "error" : "primary"}
            >
              {listening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton
              onClick={() => sendMessage()}
              sx={{
                background: "linear-gradient(90deg,#2b59c3,#1a2a6c)",
                color: "white",
              }}
            >
              <SendIcon />
            </IconButton>
          </InputArea>
        </ChatContainer>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
}

export default Chatbot;
