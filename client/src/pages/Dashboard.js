import { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Please upload an image first");

    setLoading(true);

    // Fake delay (replace with real API later)
    setTimeout(() => {
      setResult("Leaf Blight Detected ");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        <h1> Plant Leaf Disease Detection</h1>
        <p className="subtitle">
          Upload a leaf image and let AI detect possible diseases
        </p>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {preview && (
          <div className="preview-section">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Leaf"}
        </button>

        {result && (
          <div className="result-card">
            <h3>Prediction Result</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;