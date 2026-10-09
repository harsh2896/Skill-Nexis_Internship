const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: [100, "Title is too long (max 100)"] },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: { values: ["todo", "in-progress", "done"], message: "Status must be todo, in-progress or done" }, default: "todo" },
    priority: { type: String, enum: { values: ["low", "medium", "high"], message: "Priority must be low, medium or high" }, default: "medium" },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
