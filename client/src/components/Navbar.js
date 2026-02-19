import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>Crop Disease Detection</h2>
      <Link to="/">Home</Link> |<Link to="/register">Register</Link>
    </nav>
  );
}

export default Navbar;
