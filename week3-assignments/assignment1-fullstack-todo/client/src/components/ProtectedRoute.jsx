import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only logged-in users can see the wrapped page
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
export default ProtectedRoute;
