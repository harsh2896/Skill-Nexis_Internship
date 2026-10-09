import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api, { errorMessage } from "../api";
import { formatDate, formatPrice } from "../utils";

function Orders() {
  const placed = useLocation().state?.placed;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/mine")
      .then((r) => setOrders(r.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrders(orders.map((o) => (o._id === id ? data : o)));
      setError("");
    } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <main className="container">
      <h2>My orders</h2>
      {placed && <p className="success">Thank you! Your order has been placed.</p>}
      {error && <p className="error-banner">{error}</p>}
      {loading ? <p>Loading...</p> : orders.length === 0 ? <p className="empty">No orders yet. <Link to="/">Start shopping</Link></p> : (
        orders.map((o) => (
          <article className="panel order" key={o._id}>
            <header>
              <div><strong>Order #{o._id.slice(-6).toUpperCase()}</strong><br /><small className="muted">{formatDate(o.createdAt)}</small></div>
              <span className={`badge badge-${o.status}`}>{o.status}</span>
            </header>
            <ul>
              {o.items.map((i) => <li key={i.product}>{i.name} x {i.quantity} <span className="muted">({formatPrice(i.price * i.quantity)})</span></li>)}
            </ul>
            <footer>
              <span>Total: <strong>{formatPrice(o.total)}</strong></span>
              {o.status === "placed" && <button className="btn btn-danger btn-small" onClick={() => cancel(o._id)}>Cancel order</button>}
            </footer>
          </article>
        ))
      )}
    </main>
  );
}
export default Orders;
