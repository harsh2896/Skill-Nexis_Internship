import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";
import ProductImage from "./ProductImage";

function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.stock === 0;

  const handleAdd = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <article className="pcard">
      <Link to={`/products/${product._id}`}><ProductImage src={product.image} name={product.name} /></Link>
      <div className="info">
        <small className="muted">{product.category}</small>
        <Link to={`/products/${product._id}`}><strong>{product.name}</strong></Link>
        <span className="price">{formatPrice(product.price)}</span>
        {out && <span className="stock-out">Out of stock</span>}
        {!out && product.stock <= 5 && <span className="stock-low">Only {product.stock} left</span>}
        <button className="btn" onClick={handleAdd} disabled={out}>{added ? "Added" : "Add to cart"}</button>
      </div>
    </article>
  );
}
export default ProductCard;
