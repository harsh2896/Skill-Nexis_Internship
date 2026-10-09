import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(null); // { id, title }

  // READ
  useEffect(() => {
    api.get("/tasks")
      .then(({ data }) => setTasks(data.tasks))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // CREATE
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    try {
      const { data } = await api.post("/tasks", { title: title.trim(), description: description.trim() });
      setTasks([data, ...tasks]);
      setTitle("");
      setDescription("");
      setError("");
    } catch (err) { setError(errorMessage(err)); }
  };

  // UPDATE (replace the task in the list with the server's version)
  const updateTask = async (id, changes) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, changes);
      setTasks(tasks.map((t) => (t._id === id ? data : t)));
      setError("");
      return true;
    } catch (err) { setError(errorMessage(err)); return false; }
  };

  const saveEdit = async () => {
    if (!editing.title.trim()) return setError("Title is required");
    if (await updateTask(editing.id, { title: editing.title.trim() })) setEditing(null);
  };

  // DELETE
  const removeTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) { setError(errorMessage(err)); }
  };

  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <main className="container">
      <form className="panel form" onSubmit={addTask}>
        <h2>Add a task</h2>
        <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
        <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn" type="submit">Add task</button>
      </form>

      {error && <p className="error-banner">{error}</p>}

      <h2 className="list-title">My tasks <small>({doneCount}/{tasks.length} done)</small></h2>
      {loading ? <p>Loading...</p> : tasks.length === 0 ? <p className="empty">No tasks yet. Add your first one above.</p> : (
        <ul className="tasks">
          {tasks.map((t) => (
            <li key={t._id} className={t.completed ? "task done" : "task"}>
              <input type="checkbox" checked={t.completed} onChange={() => updateTask(t._id, { completed: !t.completed })} aria-label="Mark complete" />
              <div className="task-body">
                {editing?.id === t._id ? (
                  <input autoFocus value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                ) : (
                  <>
                    <strong className="title">{t.title}</strong>
                    {t.description && <p>{t.description}</p>}
                  </>
                )}
              </div>
              <div className="task-actions">
                {editing?.id === t._id ? (
                  <>
                    <button className="btn btn-small" onClick={saveEdit}>Save</button>
                    <button className="btn btn-outline btn-small" onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline btn-small" onClick={() => setEditing({ id: t._id, title: t.title })}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => removeTask(t._id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
export default Tasks;
