import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="container">
      <h2>Page not found</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <p><Link to="/">Back to the shop</Link></p>
    </main>
  );
}
export default NotFound;
