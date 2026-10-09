import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";
import ProductImage from "../components/ProductImage";

function Cart() {
  const { items, setQty, remove, clear, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="container">
        <h2>Your cart</h2>
        <p className="empty">Your cart is empty. <Link to="/">Start shopping</Link></p>
      </main>
    );
  }

  return (
    <main className="container wide">
      <h2>Your cart</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th></th><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i._id}>
                <td><ProductImage src={i.image} name={i.name} /></td>
                <td><Link to={`/products/${i._id}`}>{i.name}</Link></td>
                <td>{formatPrice(i.price)}</td>
                <td><input className="qty" type="number" min="1" max={i.stock} value={i.quantity} aria-label={`Quantity of ${i.name}`} onChange={(e) => setQty(i._id, e.target.value)} /></td>
                <td>{formatPrice(i.price * i.quantity)}</td>
                <td><button className="btn btn-danger btn-small" onClick={() => remove(i._id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="summary"><span>Total</span><span>{formatPrice(total)}</span></div>
      <div className="row actions end">
        <button className="btn btn-outline" onClick={clear}>Clear cart</button>
        <Link className="btn linkbtn" to="/checkout">Proceed to checkout</Link>
      </div>
    </main>
  );
}
export default Cart;
