import { useMemo, useState } from "react";
import posts from "./data/posts.json";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(posts.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [search, category]);

  return (
    <>
      <header className="header">
        <h1>Dev Blog</h1>
        <p>Notes on web development</p>
      </header>

      <main className="container">
        <div className="controls">
          <input
            type="search"
            placeholder="Search posts"
            aria-label="Search posts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filters">
            {categories.map((c) => (
              <button key={c} className={c === category ? "chip active" : "chip"} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="result-count">{filtered.length} {filtered.length === 1 ? "post" : "posts"}</p>

        {filtered.length === 0 ? (
          <p className="empty">No posts match your search. Try a different word or choose "All".</p>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <article className="card" key={p.id}>
                <span className="tag">{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
                <small>{p.author} &middot; {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
export default App;
