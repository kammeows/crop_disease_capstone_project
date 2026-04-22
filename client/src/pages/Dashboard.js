import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./Dashboard.css";

const MODEL_INFO = {
  "default_model_38.h5": {
    name: "Standard Model (38 Classes)",
    description:
      "The most capable recommended model. It can detect 38 different classes of diseases across various plants.",
    efficiency: "High",
    accuracy: "98%",
  },
  "model2.h5": {
    name: "Alternative CNN Model",
    description:
      "An alternative high-performance model that also supports the full range of 38 disease classes.",
    efficiency: "Medium",
    accuracy: "96%",
  },
  "efficientNet_model.h5": {
    name: "Health Classifier",
    description:
      "A decent model that quickly distinguishes between healthy and unhealthy leaves.",
    efficiency: "Very High",
    accuracy: "92%",
  },
};

function Dashboard() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("default_model_38.h5");
  const [models, setModels] = useState(Object.keys(MODEL_INFO));
  const [history, setHistory] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return alert("Please upload an image first");

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("model", selectedModel);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const newResult = {
        ...response.data,
        timestamp: new Date().toLocaleString(),
        imagePreview: preview, // Store preview URL for display in history
      };

      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (history.length === 0) return alert("No history to download");

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(22);
    doc.text("Crop Disease Analysis Report", 105, yPos, { align: "center" });
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, {
      align: "center",
    });
    yPos += 20;

    for (let i = 0; i < history.length; i++) {
      const item = history[i];

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(46, 125, 50); // Green color for headings
      doc.text(`Analysis #${history.length - i}: ${item.prediction}`, 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 10;

      doc.setFontSize(10);
      // doc.text(`Model: ${item.model_used} | Confidence: ${(item.confidence * 100).toFixed(2)}% | Date: ${item.timestamp}`, 20, yPos);
      yPos += 10;

      if (item.details) {
        const details = item.details;

        const tableData = [
          ["Plant", details.plant || "N/A"],
          ["Status", details.status || "N/A"],
          ["About", details.about || "N/A"],
          ["Symptoms", details.symptoms ? details.symptoms.join(", ") : "N/A"],
          [
            "Treatment",
            details.treatment ? details.treatment.join(", ") : "N/A",
          ],
          [
            "Prevention",
            details.prevention ? details.prevention.join(", ") : "N/A",
          ],
        ];

        autoTable(doc, {
          startY: yPos,
          body: tableData,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { fontStyle: "bold", width: 30 } },
          margin: { left: 20, right: 20 },
        });

        yPos = doc.lastAutoTable.finalY + 20;
      } else {
        yPos += 10;
      }
    }

    doc.save("crop-disease-session-report.pdf");
  };

  const currentModel = MODEL_INFO[selectedModel] || {
    name: selectedModel,
    description: "No description available for this model.",
    efficiency: "N/A",
    accuracy: "N/A",
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className="sidebar">
          <h3>Model Selection</h3>
          <p className="sidebar-subtitle">Choose the AI model for analysis</p>

          <select
            className="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {MODEL_INFO[model]?.name || model}
              </option>
            ))}
          </select>

          <div className="model-details">
            <h4>{currentModel.name}</h4>
            <p className="model-desc">{currentModel.description}</p>
            <div className="model-stats">
              <div className="stat-item">
                <span>Accuracy:</span>
                <strong>{currentModel.accuracy}</strong>
              </div>
              <div className="stat-item">
                <span>Efficiency:</span>
                <strong>{currentModel.efficiency}</strong>
              </div>
            </div>
          </div>

          <div className="session-actions">
            <button
              className="download-session-btn"
              onClick={downloadPDF}
              disabled={history.length === 0}
            >
              Download Session Report (PDF)
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="dashboard-card">
            <h1>Plant Leaf Disease Detection</h1>
            <p className="subtitle">
              Upload a leaf image and let AI detect possible diseases
            </p>

            <div className="upload-container">
              <label htmlFor="file-upload" className="custom-file-upload">
                {image ? "Change Image" : "Choose Image"}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {image && <span className="file-name">{image.name}</span>}
            </div>

            {preview && (
              <div className="preview-section">
                <img src={preview} alt="Preview" />
              </div>
            )}

            <button
              className={`analyze-btn ${loading ? "loading" : ""}`}
              onClick={handleAnalyze}
              disabled={loading || !image}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Analyze Leaf"
              )}
            </button>

            {result && (
              <div className="result-card fade-in">
                <div className="result-header">
                  <h3>Prediction Result</h3>
                  <span
                    className={`status-badge ${result.details?.status?.toLowerCase() || ""}`}
                  >
                    {result.details?.status || "Detected"}
                  </span>
                </div>

                <div className="result-content">
                  <div className="result-main">
                    <div className="result-item">
                      <label>Disease:</label>
                      <span className="prediction-text">
                        {result.prediction}
                      </span>
                    </div>
                    {result.details?.plant && (
                      <div className="result-item">
                        <label>Plant:</label>
                        <span>{result.details.plant}</span>
                      </div>
                    )}
                  </div>

                  {result.details?.about && (
                    <div className="disease-info-section">
                      <h4>About the Disease</h4>
                      <p>{result.details.about}</p>
                    </div>
                  )}

                  <div className="disease-details-grid">
                    {result.details?.symptoms?.length > 0 && (
                      <div className="info-block">
                        <h4>Symptoms</h4>
                        <ul>
                          {result.details.symptoms.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.details?.treatment?.length > 0 && (
                      <div className="info-block">
                        <h4>Treatment</h4>
                        <ul>
                          {result.details.treatment.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.details?.prevention?.length > 0 && (
                      <div className="info-block">
                        <h4>Prevention</h4>
                        <ul>
                          {result.details.prevention.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="history-section fade-in">
              <h2>Session History</h2>
              <div className="history-list">
                {history.map((item, index) => (
                  <div key={index} className="history-item">
                    <img
                      src={item.imagePreview}
                      alt="Thumbnail"
                      className="history-thumb"
                    />
                    <div className="history-info">
                      <div className="history-header">
                        <strong>{item.prediction}</strong>
                        <span>{item.timestamp}</span>
                      </div>
                      <p>
                        Model: {item.model_used} | Confidence:{" "}
                        {(item.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
