import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import { formatDate, formatPrice } from "../utils";
import ProductImage from "../components/ProductImage";

const emptyProduct = { name: "", description: "", price: "", stock: "", category: "", image: "" };
const STATUSES = ["placed", "shipped", "delivered", "cancelled"];

function Admin() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([api.get("/products", { params: { limit: 50 } }), api.get("/orders")]);
      setProducts(p.data.products);
      setOrders(o.data);
    } catch (err) { setError(errorMessage(err)); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const onForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitProduct = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!form.name.trim() || form.price === "" || form.stock === "") return setError("Name, price and stock are required.");
    const body = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) await api.put(`/products/${editingId}`, body);
      else await api.post("/products", body);
      setMessage(editingId ? "Product updated." : "Product added.");
      setForm(emptyProduct);
      setEditingId(null);
      load();
    } catch (err) { setError(errorMessage(err)); }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, image: p.image });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(emptyProduct); };

  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/products/${id}`); setMessage("Product deleted."); load(); }
    catch (err) { setError(errorMessage(err)); }
  };

  const changeStatus = async (id, status) => {
    setError("");
    try { await api.put(`/orders/${id}/status`, { status }); load(); }
    catch (err) { setError(errorMessage(err)); load(); }
  };

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="container wide">
      <h2>Admin dashboard</h2>
      <div className="stats">
        <div className="stat"><span>Products</span><strong>{products.length}</strong></div>
        <div className="stat"><span>Orders</span><strong>{orders.length}</strong></div>
        <div className="stat"><span>Revenue</span><strong>{formatPrice(revenue)}</strong></div>
      </div>

      <div className="tabs" role="tablist">
        {["products", "orders"].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>
            {t === "products" ? "Products" : "Orders"}
          </button>
        ))}
      </div>

      {error && <p className="error-banner">{error}</p>}
      {message && <p className="success">{message}</p>}

      {tab === "products" ? (
        <>
          <form className="panel form" onSubmit={submitProduct} noValidate>
            <h3>{editingId ? "Edit product" : "Add product"}</h3>
            <div className="row">
              <input name="name" placeholder="Name" value={form.name} onChange={onForm} aria-label="Name" />
              <input name="category" placeholder="Category" value={form.category} onChange={onForm} aria-label="Category" />
            </div>
            <div className="row">
              <input name="price" type="number" min="0" placeholder="Price (INR)" value={form.price} onChange={onForm} aria-label="Price" />
              <input name="stock" type="number" min="0" step="1" placeholder="Stock" value={form.stock} onChange={onForm} aria-label="Stock" />
            </div>
            <input name="image" placeholder="Image URL (optional)" value={form.image} onChange={onForm} aria-label="Image URL" />
            <input name="description" placeholder="Description" value={form.description} onChange={onForm} aria-label="Description" />
            <div className="row actions">
              <button className="btn" type="submit">{editingId ? "Save changes" : "Add product"}</button>
              {editingId && <button className="btn btn-outline" type="button" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><ProductImage src={p.image} name={p.name} /></td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td>{p.stock}</td>
                    <td className="nowrap">
                      <button className="btn btn-outline btn-small" onClick={() => startEdit(p)}>Edit</button>{" "}
                      <button className="btn btn-danger btn-small" onClick={() => removeProduct(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : orders.length === 0 ? <p className="empty">No orders yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}<br /><small className="muted">{formatDate(o.createdAt)}</small></td>
                  <td>
                    {o.user?.name || "Deleted user"}<br /><small className="muted">{o.user?.email}</small><br />
                    <small className="muted">{o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.pincode}, {o.shippingAddress.phone}</small>
                  </td>
                  <td>{o.items.map((i) => <div key={i.product}>{i.name} x {i.quantity}</div>)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <select value={o.status} disabled={o.status === "cancelled"} aria-label="Order status" onChange={(e) => changeStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
export default Admin;
