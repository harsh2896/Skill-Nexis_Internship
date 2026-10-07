import { useState } from "react";
import Button from "./Button.jsx";

// Props: onSubmit(data). State: field values and errors
function Form({ onSubmit }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });

  const validate = () => {
    const err = {};
    if (values.name.trim().length < 2) err.name = "Enter your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) err.email = "Enter a valid email address.";
    if (values.message.trim().length < 10) err.message = "Message must be at least 10 characters.";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length === 0) {
      onSubmit(values);
      setValues({ name: "", email: "", message: "" });
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" value={values.name} onChange={handleChange} />
      {errors.name && <span className="error">{errors.name}</span>}

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
      {errors.email && <span className="error">{errors.email}</span>}

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" rows="4" value={values.message} onChange={handleChange} />
      {errors.message && <span className="error">{errors.message}</span>}

      <Button label="Send message" type="submit" />
    </form>
  );
}
export default Form;
