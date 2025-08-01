const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Register = require("../../Models/Reg/model");

const JWT_SECRET = "my_secret_key"; // change this for production

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await Register.findOne({ email });

  if (existingUser) return res.json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new Register({ username, email, password: hashedPassword });
  await user.save();

  res.json({ status: "ok" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Register.findOne({ email });
  if (!user) return res.json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: "Incorrect password" });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ status: "ok", token });
});

module.exports = router;
