import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Logged-in users only. With adminOnly, regular users are sent back to the shop.
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
export default ProtectedRoute;
