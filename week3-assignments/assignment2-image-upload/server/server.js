const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Where and under what name Multer saves the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    const err = new Error("Only JPG, PNG, WEBP or GIF images are allowed");
    err.status = 400;
    cb(err);
  },
});

// Uploaded files are served from /uploads/<filename>
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => res.json({ message: "Image upload API is running" }));

// POST /api/upload  (form-data, field name: image)
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image selected" });
  res.status(201).json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
});

// GET /api/images - list uploaded images, newest first
app.get("/api/images", (req, res) => {
  const images = fs
    .readdirSync(uploadDir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .map((f) => ({ filename: f, url: `/uploads/${f}`, uploadedAt: fs.statSync(path.join(uploadDir, f)).mtime }))
    .sort((a, b) => b.uploadedAt - a.uploadedAt);
  res.json({ count: images.length, images });
});

// DELETE /api/images/:filename
app.delete("/api/images/:filename", (req, res) => {
  const file = path.join(uploadDir, path.basename(req.params.filename)); // basename blocks ../ tricks
  if (!fs.existsSync(file)) return res.status(404).json({ message: "Image not found" });
  fs.unlinkSync(file);
  res.json({ message: "Image deleted" });
});

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 2 MB)" : err.message;
    return res.status(400).json({ message });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
