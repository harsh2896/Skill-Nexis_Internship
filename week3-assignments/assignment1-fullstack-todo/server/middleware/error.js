// Wraps async route handlers so errors go to the error middleware
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Helper to throw an error with an HTTP status
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") { status = 400; message = "Invalid id"; }
  else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  else if (err.code === 11000) { status = 409; message = "That value already exists"; }
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401; message = "Invalid or expired token";
  }
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

module.exports = { asyncHandler, httpError, notFound, errorHandler };
