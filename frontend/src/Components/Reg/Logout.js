// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token"); // Remove JWT
    alert("You have been logged out.");
    navigate("/login"); // Redirect to login
  }, [navigate]);

  return null; // No UI needed
};

export default Logout;
