const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { asyncHandler, httpError } = require("../middleware/error");

const router = express.Router();
router.use(protect); // all task routes need a valid JWT

const FIELDS = ["title", "description", "status", "priority", "dueDate"];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const RANK = { high: 0, medium: 1, low: 2 };

// POST /api/tasks
router.post("/", asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body), user: req.user._id });
  res.status(201).json(task);
}));

// GET /api/tasks/stats - number of tasks per status (for the filter tabs)
router.get("/stats", asyncHandler(async (req, res) => {
  const rows = await Task.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const stats = { todo: 0, "in-progress": 0, done: 0 };
  rows.forEach((r) => { stats[r._id] = r.count; });
  res.json(stats);
}));

// GET /api/tasks?status=&priority=&search=&sort=newest|oldest|dueDate|priority
router.get("/", asyncHandler(async (req, res) => {
  const { status, priority, search, sort } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const rx = new RegExp(escapeRegex(String(search)), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const tasks = await Task.find(filter).sort({ createdAt: sort === "oldest" ? 1 : -1 });
  const BIG = Number.MAX_SAFE_INTEGER;
  if (sort === "priority") tasks.sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  if (sort === "dueDate") tasks.sort((a, b) => (a.dueDate ? a.dueDate.getTime() : BIG) - (b.dueDate ? b.dueDate.getTime() : BIG));

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
