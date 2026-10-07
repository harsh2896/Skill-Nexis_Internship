const express = require("express");
const Task = require("../models/Task");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();
const FIELDS = ["title", "description", "completed", "dueDate"];

// Keep only allowed fields that were actually sent
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});

// POST /api/tasks - add a task
router.post("/", asyncHandler(async (req, res) => {
  const task = await Task.create(pick(req.body));
  res.status(201).json(task);
}));

// GET /api/tasks - list tasks (optional ?completed=true|false)
router.get("/", asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.completed !== undefined) filter.completed = req.query.completed === "true";
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  res.json({ count: tasks.length, tasks });
}));

// GET /api/tasks/:id - one task
router.get("/:id", asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw httpError(404, "Task not found");
  res.json(task);
}));

// PUT /api/tasks/:id - update a task
router.put("/:id", asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!task) throw httpError(404, "Task not found");
  res.json(task);
}));

// DELETE /api/tasks/:id - delete a task
router.delete("/:id", asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw httpError(404, "Task not found");
  res.json({ message: "Task deleted", id: task._id });
}));

module.exports = router;
