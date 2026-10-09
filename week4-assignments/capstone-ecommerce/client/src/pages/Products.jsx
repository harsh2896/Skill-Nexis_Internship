import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import ProductCard from "../components/ProductCard";

function Products() {
  const [params, setParams] = useState({ search: "", category: "", sort: "newest", page: 1 });
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  // Search is delayed a little so we do not call the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
        const res = await api.get("/products", { params: query });
        setData(res.data);
        setError("");
      } catch (err) { setError(errorMessage(err)); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [params]);

  const change = (key, value) => setParams({ ...params, [key]: value, page: 1 });
  const goTo = (page) => { setParams({ ...params, page }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <main className="container wide">
      <div className="row toolbar">
        <input type="search" placeholder="Search products" aria-label="Search products" value={params.search} onChange={(e) => change("search", e.target.value)} />
        <select aria-label="Category" value={params.category} onChange={(e) => change("category", e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Sort" value={params.sort} onChange={(e) => change("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {error && <p className="error-banner">{error}</p>}
      {loading ? <p>Loading products...</p> : data.products.length === 0 ? <p className="empty">No products found.</p> : (
        <>
          <p className="muted">{data.total} {data.total === 1 ? "product" : "products"}</p>
          <div className="products">
            {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn btn-outline btn-small" disabled={data.page <= 1} onClick={() => goTo(data.page - 1)}>Previous</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn btn-outline btn-small" disabled={data.page >= data.pages} onClick={() => goTo(data.page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
export default Products;
