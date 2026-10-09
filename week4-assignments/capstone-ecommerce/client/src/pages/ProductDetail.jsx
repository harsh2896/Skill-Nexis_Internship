import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";
import ProductImage from "../components/ProductImage";

function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch((err) => setError(err.response?.status === 400 || err.response?.status === 404 ? "Product not found." : errorMessage(err)));
  }, [id]);

  if (error) return <main className="container"><p className="error-banner">{error}</p><Link to="/">Back to the shop</Link></main>;
  if (!product) return <main className="container"><p>Loading...</p></main>;

  const out = product.stock === 0;
  const handleAdd = () => { add(product, qty); setAdded(true); };

  return (
    <main className="container wide">
      <p><Link to="/">&larr; Back to the shop</Link></p>
      <div className="detail">
        <ProductImage src={product.image} name={product.name} />
        <div className="info">
          <small className="muted">{product.category}</small>
          <h2>{product.name}</h2>
          <span className="price big">{formatPrice(product.price)}</span>
          <p>{product.description || "No description available."}</p>
          {out ? <span className="stock-out">Out of stock</span> : (
            <>
              <span className="muted">{product.stock} in stock</span>
              <div className="row actions">
                <input className="qty" type="number" min="1" max={product.stock} value={qty} aria-label="Quantity"
                  onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))} />
                <button className="btn" onClick={handleAdd}>Add to cart</button>
              </div>
            </>
          )}
          {added && <p className="success">Added to cart. <Link to="/cart">Go to cart</Link></p>}
        </div>
      </div>
    </main>
  );
}
export default ProductDetail;
