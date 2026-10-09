const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler, httpError } = require("./error");

// Protects a route: expects header "Authorization: Bearer <token>"
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw httpError(401, "Not authorized, token missing");

  const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "User no longer exists");

  req.user = user;
  next();
});

module.exports = { protect };
