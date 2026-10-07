import { useState } from "react";

// Props: title, links. State: mobile menu open/closed
function Header({ title, links }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <h1>{title}</h1>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Close" : "Menu"}
      </button>
      <nav className={open ? "open" : ""}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
      </nav>
    </header>
  );
}
export default Header;
