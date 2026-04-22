import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Protect Your Crops with AI</h1>
        <p>
          Advanced machine learning to identify and diagnose plant leaf diseases instantly.
          Empowering farmers with technology for better yields.
        </p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-primary">Get Started</Link>
          <Link to="/dashboard" className="cta-secondary">Try Dashboard</Link>
        </div>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Instant Detection</h3>
          <p>Upload a photo and get results in seconds with our optimized CNN models.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>High Accuracy</h3>
          <p>Multiple specialized models reaching up to 98% accuracy for various plant species.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌿</div>
          <h3>Wide Variety</h3>
          <p>Capable of detecting 38+ different disease classes across numerous crop types.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;