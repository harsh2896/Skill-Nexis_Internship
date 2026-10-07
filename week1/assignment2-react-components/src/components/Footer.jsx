function Footer({ name }) {
  return <footer className="footer">&copy; {new Date().getFullYear()} {name}. Built with React.</footer>;
}
export default Footer;
