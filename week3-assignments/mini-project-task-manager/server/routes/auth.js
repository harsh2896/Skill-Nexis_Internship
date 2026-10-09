const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const userResponse = (user) => ({ id: user._id, name: user.name, email: user.email });

// POST /api/auth/register
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (email && (await User.findOne({ email: String(email).toLowerCase() }))) {
    throw httpError(409, "Email is already registered");
  }
  const user = await User.create({ name, email, password }); // password hashed in model
  res.status(201).json({ token: signToken(user._id), user: userResponse(user) });
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, "Email and password are required");

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw httpError(401, "Invalid email or password"); // same message for both cases
  }
  res.json({ token: signToken(user._id), user: userResponse(user) });
}));

// GET /api/auth/me  (protected)
router.get("/me", protect, (req, res) => res.json({ user: userResponse(req.user) }));

module.exports = router;
