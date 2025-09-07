import React, { useState, useRef, useEffect } from "react";
import { 
  Box, TextField, IconButton, Paper, Typography, Fab, CircularProgress, Avatar, Button 
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

// Styled components
const ChatContainer = styled(Paper)(() => ({
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
  fontSize: "0.875rem",
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
  opacity: open ? 0 : 0.6,
  transition: "opacity 0.3s ease",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

// -------------------- MAIN CHATBOT --------------------
function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your AirGo Airlines assistant. You can type or speak your request, like 'Book a round-trip from Colombo to New York next month'.", quickReplies: ["Flight status", "Booking", "Baggage policy"] }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef();

  // Scroll down when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // --- Voice Recognition Setup ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
  }

  const startListening = () => {
    if (!recognition) return alert("Speech recognition not supported in this browser.");
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendMessage(transcript); // auto-send recognized speech
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  // --- Bot Logic ---
  const processMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    // Simple "book flight" parsing
    if (lowerMsg.includes("book") && (lowerMsg.includes("to") || lowerMsg.includes("from"))) {
      const match = message.match(/from\s+(\w+)\s+to\s+(\w+)/i);
      if (match) {
        return `Got it ✅. You want to book a flight from **${match[1]}** to **${match[2]}**. Please confirm dates and passenger count to continue.`;
      }
      return "Sure! I can help you book a flight. Please provide departure city, destination, and date.";
    }
    if (lowerMsg.includes("status")) return "Please provide your flight number (e.g., AG123).";
    if (lowerMsg.includes("baggage")) return "You can carry 1 cabin bag (10kg) + checked baggage depending on your ticket class.";
    if (lowerMsg.includes("check-in")) return "Online check-in opens 24h before departure via our app or website.";
    return "I'm here to help with bookings, flight status, baggage, or check-in.";
  };

  const sendMessage = (forcedMessage = null) => {
    const userMsg = forcedMessage || input;
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const botReply = processMessage(userMsg);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      setLoading(false);
    }, 1000);
  };

  const sendQuickReply = (msg) => sendMessage(msg);

  return (
    <>
      {/* Floating Icon */}
      <UserIcon open={open}>
        <Avatar sx={{ bgcolor: "rgba(25, 118, 210, 0.7)", width: 56, height: 56, mb: 1 }}>
          <PersonIcon />
        </Avatar>
        <Typography variant="caption" sx={{ color: "rgba(0,0,0,0.6)" }}>Ask me anything</Typography>
      </UserIcon>

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 30, right: 30, zIndex: 999, background: "linear-gradient(90deg,#1a2a6c,#2b59c3)" }}
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
              <Typography variant="caption">Voice & Chat Booking</Typography>
            </Box>
            <ResetButton onClick={() => setMessages([{ sender: "bot", text: "New session started. How can I help you?" }])}>
              <RefreshIcon />
            </ResetButton>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "white", marginLeft: "auto" }}>
              <CloseIcon />
            </IconButton>
          </Header>

          {/* Messages */}
          <ChatArea>
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <MessageBubble sender={msg.sender}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{msg.text}</Typography>
                  {msg.quickReplies && (
                    <QuickReplies>
                      {msg.quickReplies.map((r, idx) => (
                        <QuickReply key={idx} onClick={() => sendQuickReply(r)}>{r}</QuickReply>
                      ))}
                    </QuickReplies>
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
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              size="small"
            />
            <IconButton onClick={startListening} color={listening ? "error" : "primary"}>
              {listening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton 
              onClick={() => sendMessage()}
              sx={{ background: "linear-gradient(90deg,#2b59c3,#1a2a6c)", color: "white" }}
            >
              <SendIcon />
            </IconButton>
          </InputArea>
        </ChatContainer>
      )}

      <style>
        {`
          @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
        `}
      </style>
    </>
  );
}

export default Chatbot;
