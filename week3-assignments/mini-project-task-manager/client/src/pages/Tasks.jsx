import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api";

const TABS = [
  { value: "", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];
const emptyForm = { title: "", description: "", priority: "medium", dueDate: "" };

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, "in-progress": 0, done: 0 });
  const [filters, setFilters] = useState({ status: "", priority: "", search: "", sort: "newest" });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // { id, title, description }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try { setStats((await api.get("/tasks/stats")).data); } catch { /* shown by task load */ }
  }, []);

  // Server-side filtering: send only the filters that are set
  const fetchTasks = useCallback(async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks);
      setError("");
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [filters]);

  // Small delay so we do not call the API on every keystroke while searching
  useEffect(() => {
    const t = setTimeout(fetchTasks, 250);
    return () => clearTimeout(t);
  }, [fetchTasks]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const refresh = () => { fetchTasks(); loadStats(); };
  const run = async (fn) => {
    try { await fn(); refresh(); } catch (err) { setError(errorMessage(err)); }
  };

  const setFilter = (key, value) => setFilters({ ...filters, [key]: value });
  const onForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTask = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    run(async () => {
      await api.post("/tasks", { ...form, title: form.title.trim(), dueDate: form.dueDate || undefined });
      setForm(emptyForm);
    });
  };
  const update = (id, changes) => run(() => api.put(`/tasks/${id}`, changes));
  const remove = (id) => window.confirm("Delete this task?") && run(() => api.delete(`/tasks/${id}`));
  const saveEdit = () => {
    if (!editing.title.trim()) return setError("Title is required");
    run(async () => {
      await api.put(`/tasks/${editing.id}`, { title: editing.title.trim(), description: editing.description });
      setEditing(null);
    });
  };

  const total = stats.todo + stats["in-progress"] + stats.done;
  const isOverdue = (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date();

  return (
    <main className="container">
      <form className="panel form" onSubmit={addTask}>
        <h2>New task</h2>
        <input name="title" placeholder="Task title" value={form.title} onChange={onForm} maxLength={100} />
        <input name="description" placeholder="Description (optional)" value={form.description} onChange={onForm} />
        <div className="row">
          <select name="priority" value={form.priority} onChange={onForm} aria-label="Priority">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input name="dueDate" type="date" value={form.dueDate} onChange={onForm} aria-label="Due date" />
        </div>
        <button className="btn" type="submit">Add task</button>
      </form>

      {error && <p className="error-banner">{error}</p>}

      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button key={tab.value} role="tab" aria-selected={filters.status === tab.value}
            className={filters.status === tab.value ? "tab active" : "tab"} onClick={() => setFilter("status", tab.value)}>
            {tab.label} <span>{tab.value ? stats[tab.value] : total}</span>
          </button>
        ))}
      </div>

      <div className="row filters">
        <input type="search" placeholder="Search tasks" aria-label="Search tasks" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} />
        <select aria-label="Filter by priority" value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
          <option value="">Any priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select aria-label="Sort tasks" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {loading ? <p>Loading...</p> : tasks.length === 0 ? <p className="empty">No tasks match these filters.</p> : (
        <ul className="tasks">
          {tasks.map((t) => (
            <li key={t._id} className={t.status === "done" ? "task done" : "task"}>
              <div className="task-body">
                {editing?.id === t._id ? (
                  <>
                    <input autoFocus value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                    <input value={editing.description} placeholder="Description" onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  </>
                ) : (
                  <>
                    <strong className="title">{t.title}</strong>
                    {t.description && <p>{t.description}</p>}
                  </>
                )}
                <div className="meta">
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                  <span className={isOverdue(t) ? "overdue" : ""}>
                    {t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString("en-IN")}` : "No due date"}{isOverdue(t) && " (overdue)"}
                  </span>
                </div>
              </div>
              <div className="task-side">
                <select aria-label="Status" value={t.status} onChange={(e) => update(t._id, { status: e.target.value })}>
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="task-actions">
                  {editing?.id === t._id ? (
                    <>
                      <button className="btn btn-small" onClick={saveEdit}>Save</button>
                      <button className="btn btn-outline btn-small" onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline btn-small" onClick={() => setEditing({ id: t._id, title: t.title, description: t.description })}>Edit</button>
                      <button className="btn btn-danger btn-small" onClick={() => remove(t._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
export default Tasks;
