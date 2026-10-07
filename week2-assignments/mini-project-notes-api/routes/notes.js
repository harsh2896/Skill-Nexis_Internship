const express = require("express");
const Note = require("../models/Note");
const { protect } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();
router.use(protect); // every notes route needs a valid JWT

const FIELDS = ["title", "content", "tags", "pinned"];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/notes - create
router.post("/", asyncHandler(async (req, res) => {
  const note = await Note.create({ ...pick(req.body), user: req.user._id });
  res.status(201).json(note);
}));

// GET /api/notes - list my notes (?search=word &tag=name &pinned=true)
router.get("/", asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search)), "i");
    filter.$or = [{ title: rx }, { content: rx }];
  }
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.pinned !== undefined) filter.pinned = req.query.pinned === "true";

  const notes = await Note.find(filter).sort({ pinned: -1, updatedAt: -1 });
  res.json({ count: notes.length, notes });
}));

// GET /api/notes/:id - one of my notes
router.get("/:id", asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw httpError(404, "Note not found");
  res.json(note);
}));

// PUT /api/notes/:id - update my note
router.put("/:id", asyncHandler(async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    pick(req.body),
    { new: true, runValidators: true }
  );
  if (!note) throw httpError(404, "Note not found");
  res.json(note);
}));

// DELETE /api/notes/:id - delete my note
router.delete("/:id", asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!note) throw httpError(404, "Note not found");
  res.json({ message: "Note deleted", id: note._id });
}));

module.exports = router;
