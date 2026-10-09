import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One page for both login and register (mode = "login" | "register")
function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (isRegister && values.name.trim().length < 2) err.name = "Enter your name (at least 2 characters).";
    if (!EMAIL_RE.test(values.email.trim())) err.email = "Enter a valid email address.";
    if (values.password.length < 6) err.password = "Password must be at least 6 characters.";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    setServerError("");
    if (Object.keys(err).length > 0) return;

    setBusy(true);
    try {
      if (isRegister) await register(values.name.trim(), values.email.trim(), values.password);
      else await login(values.email.trim(), values.password);
      // on success the user state changes and we are redirected to "/"
    } catch (error) {
      setServerError(errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <main className="auth panel">
      <h2>{isRegister ? "Create account" : "Login"}</h2>
      {serverError && <p className="error-banner">{serverError}</p>}
      <form onSubmit={onSubmit} noValidate className="form">
        {isRegister && (
          <>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={values.name} onChange={onChange} />
            {errors.name && <span className="error">{errors.name}</span>}
          </>
        )}
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={onChange} />
        {errors.email && <span className="error">{errors.email}</span>}

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={onChange} />
        {errors.password && <span className="error">{errors.password}</span>}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
      <p className="switch">
        {isRegister ? <>Already have an account? <Link to="/login">Login</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
      </p>
    </main>
  );
}
export default AuthPage;
