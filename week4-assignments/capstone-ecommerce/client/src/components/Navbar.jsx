import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav">
      <Link to="/" className="brand">ShopEasy</Link>
      <nav className="nav-right">
        <Link to="/">Shop</Link>
        <Link to="/cart">Cart<span className="cart-count">{count}</span></Link>
        {user && <Link to="/orders">My orders</Link>}
        {isAdmin && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <span>Hi, {user.name.split(" ")[0]}</span>
            <button className="btn btn-outline btn-small light" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
export default Navbar;
