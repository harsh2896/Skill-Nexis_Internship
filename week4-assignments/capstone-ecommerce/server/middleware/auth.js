const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, httpError } = require("./error");

// Needs header "Authorization: Bearer <token>"
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw httpError(401, "Not authorized, token missing");

  const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "User no longer exists");

  req.user = user;
  next();
});

// Use after protect: only admins may continue
const adminOnly = (req, res, next) =>
  req.user && req.user.role === "admin" ? next() : next(httpError(403, "Admin access required"));

module.exports = { protect, adminOnly };
