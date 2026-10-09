import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

// Cart lives in the browser (localStorage). Prices are re-checked by the server when the order is placed.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(items)); }, [items]);

  const add = (product, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i._id === product._id);
      if (found) {
        return prev.map((i) => (i._id === product._id ? { ...i, stock: product.stock, quantity: Math.min(i.quantity + qty, product.stock) } : i));
      }
      const { _id, name, price, image, stock } = product;
      return [...prev, { _id, name, price, image, stock, quantity: Math.min(qty, stock) }];
    });
  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: Math.max(1, Math.min(Number(qty) || 1, i.stock)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
