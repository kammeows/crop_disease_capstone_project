import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Login.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth error from backend
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("error") === "oauth") {
      alert("Google authentication failed. Please sign up manually.");
    }
  }, [location]);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { name, email, password }
      );

      // If backend returns token (auto login)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        alert("Signup successful! Please login.");
        navigate("/");
      }

    } catch (error) {
      alert(error.response?.data?.msg || "Signup failed");
    }
  };

  const handleGoogleSignup = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create Account 🚀</h2>
        <p className="subtitle">Join Crop Disease Detection 🌱</p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            Sign Up
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          onClick={handleGoogleSignup}
          className="google-btn"
        >
          Continue with Google
        </button>

        <p className="signup-text">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;