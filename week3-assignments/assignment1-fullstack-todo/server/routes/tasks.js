const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();
router.use(protect); // all task routes need a valid JWT

const FIELDS = ["title", "description", "completed"];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

// POST /api/tasks
router.post("/", asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body), user: req.user._id });
  res.status(201).json(task);
}));

// GET /api/tasks  (optional ?completed=true|false)
router.get("/", asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.completed !== undefined) filter.completed = req.query.completed === "true";
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json({ count: tasks.length, tasks });
}));

// PUT /api/tasks/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id }, pick(req.body), { new: true, runValidators: true }
  );
  if (!task) throw httpError(404, "Task not found");
  res.json(task);
}));

// DELETE /api/tasks/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw httpError(404, "Task not found");
  res.json({ message: "Task deleted", id: task._id });
}));

module.exports = router;
