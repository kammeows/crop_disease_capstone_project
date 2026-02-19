import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  /*
  =====================================
  🔐 Handle login protection + Google token
  =====================================
  */
  useEffect(() => {
    // 1️⃣ Check if token came from Google OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");

    if (googleToken) {
      localStorage.setItem("token", googleToken);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    // 2️⃣ Check stored token
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      navigate("/"); // redirect to login
    }
  }, [navigate]);

  /*
  =====================================
  📤 Upload leaf image for prediction
  =====================================
  */
  const handleUpload = async () => {
    if (!file) return alert("Upload an image");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setResult(`${res.data.prediction} (Confidence: ${res.data.confidence})`);
    } catch (error) {
      alert("Prediction failed or unauthorized");
    }
  };

  /*
  =====================================
  🖼 Handle file preview
  =====================================
  */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  /*
  =====================================
  🚪 Logout function
  =====================================
  */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            float: "right",
            marginBottom: "10px",
            backgroundColor: "#c62828",
            color: "white",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          Logout
        </button>

        <h2>Leaf Disease Detection</h2>

        <div className="upload-section">
          <input type="file" onChange={handleFileChange} />

          {preview && (
            <img src={preview} alt="Preview" className="preview-image" />
          )}

          <button onClick={handleUpload}>Analyze Leaf</button>
        </div>

        {result && (
          <div className="result-box">
            <h3>Prediction Result</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
