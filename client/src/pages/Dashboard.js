import { useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Upload an image");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
      );

      setResult(`${res.data.prediction} (Confidence: ${res.data.confidence})`);
    } catch (error) {
      alert("Prediction failed");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
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
