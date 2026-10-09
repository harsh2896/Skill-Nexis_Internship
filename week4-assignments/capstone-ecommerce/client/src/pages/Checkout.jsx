import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: user.name, phone: "", address: "", city: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return <main className="container"><p className="empty">Your cart is empty. <Link to="/">Start shopping</Link></p></main>;
  }

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (values.fullName.trim().length < 2) err.fullName = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(values.phone.trim())) err.phone = "Enter a valid 10 digit mobile number.";
    if (values.address.trim().length < 5) err.address = "Enter your full address.";
    if (values.city.trim().length < 2) err.city = "Enter your city.";
    if (!/^\d{6}$/.test(values.pincode.trim())) err.pincode = "Enter a 6 digit pincode.";
    return err;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    setServerError("");
    if (Object.keys(err).length > 0) return;

    setBusy(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ productId: i._id, quantity: i.quantity })),
        shippingAddress: values,
      });
      clear();
      navigate("/orders", { state: { placed: true } });
    } catch (error) {
      setServerError(errorMessage(error));
      setBusy(false);
    }
  };

  const field = (name, label, props = {}) => (
    <>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} value={values[name]} onChange={onChange} {...props} />
      {errors[name] && <span className="error">{errors[name]}</span>}
    </>
  );

  return (
    <main className="container">
      <h2>Checkout</h2>
      {serverError && <p className="error-banner">{serverError}</p>}
      <form className="panel form" onSubmit={placeOrder} noValidate>
        <h3>Shipping details</h3>
        {field("fullName", "Full name")}
        {field("phone", "Mobile number", { inputMode: "numeric", maxLength: 10 })}
        {field("address", "Address")}
        {field("city", "City")}
        {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6 })}
        <div className="summary"><span>{items.length} {items.length === 1 ? "item" : "items"}, Cash on Delivery</span><span>{formatPrice(total)}</span></div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Placing order..." : "Place order"}</button>
      </form>
    </main>
  );
}
export default Checkout;
