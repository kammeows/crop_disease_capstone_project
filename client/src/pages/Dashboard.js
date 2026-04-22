import { useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useTranslation } from "react-i18next";

const MODEL_INFO = {
  "default_model_38.h5": {
    name_en: "Standard Model (38 Classes)",
    name_hi: "मानक मॉडल (38 वर्ग)",
    description_en:
      "The most capable recommended model. It can detect 38 different classes of diseases across various plants.",
    description_hi:
      "सबसे सक्षम अनुशंसित मॉडल। यह विभिन्न पौधों में 38 अलग-अलग रोग वर्गों का पता लगा सकता है।",
    efficiency: "High",
    accuracy: "98%",
  },
  "efficientNet_model.h5": {
    name_en: "Health Classifier",
    name_hi: "स्वास्थ्य वर्गीकरणकर्ता",
    description_en:
      "A decent model that quickly distinguishes between healthy and unhealthy leaves.",
    description_hi:
      "एक अच्छा मॉडल जो स्वस्थ और अस्वस्थ पत्तियों के बीच जल्दी अंतर करता है।",
    efficiency: "Very High",
    accuracy: "92%",
  },
};

function Dashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("default_model_38.h5");
  const [models] = useState(Object.keys(MODEL_INFO));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return alert(t("uploadAlert"));

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("model", selectedModel);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert(t("analysisFailed"));
    } finally {
      setLoading(false);
    }
  };

  const currentModel = MODEL_INFO[selectedModel] || {
    name_en: selectedModel,
    name_hi: selectedModel,
    description_en: "No description available.",
    description_hi: "कोई विवरण उपलब्ध नहीं है।",
    efficiency: "N/A",
    accuracy: "N/A",
  };

  const modelName = lang === "hi" ? currentModel.name_hi : currentModel.name_en;
  const modelDesc = lang === "hi" ? currentModel.description_hi : currentModel.description_en;

  // Show Hindi prediction if available, else English
  const predictionText =
    lang === "hi" && result?.prediction_hi
      ? result.prediction_hi
      : result?.prediction;

  return (
    <div className="dashboard-container">
      {/* Language Toggle */}
      <div style={{ textAlign: "right", padding: "8px 16px" }}>
        <button
          onClick={() => i18n.changeLanguage("en")}
          style={{ marginRight: 8, fontWeight: lang === "en" ? "bold" : "normal" }}
        >
          English
        </button>
        <button
          onClick={() => i18n.changeLanguage("hi")}
          style={{ fontWeight: lang === "hi" ? "bold" : "normal" }}
        >
          हिंदी
        </button>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>{t("modelSelection")}</h3>
          <p className="sidebar-subtitle">{t("chooseModel")}</p>

          <select
            className="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {lang === "hi"
                  ? MODEL_INFO[model]?.name_hi
                  : MODEL_INFO[model]?.name_en || model}
              </option>
            ))}
          </select>

          <div className="model-details">
            <h4>{modelName}</h4>
            <p className="model-desc">{modelDesc}</p>
            <div className="model-stats">
              <div className="stat-item">
                <span>{t("accuracy")}:</span>
                <strong>{currentModel.accuracy}</strong>
              </div>
              <div className="stat-item">
                <span>{t("efficiency")}:</span>
                <strong>{currentModel.efficiency}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-card">
            <h1>{t("pageTitle")}</h1>
            <p className="subtitle">{t("pageSubtitle")}</p>

            <div className="upload-container">
              <label htmlFor="file-upload" className="custom-file-upload">
                {image ? t("changeImage") : t("chooseImage")}
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
                  {t("analyzing")}
                </>
              ) : (
                t("analyzeLeaf")
              )}
            </button>

            {result && (
              <div className="result-card fade-in">
                <div className="result-header">
                  <h3>{t("predictionResult")}</h3>
                  <span
                    className={`status-badge ${result.details?.status?.toLowerCase() || ""}`}
                  >
                    {result.details?.status || t("detected")}
                  </span>
                </div>

                <div className="result-content">
                  <div className="result-main">
                    <div className="result-item">
                      <label>{t("disease")}:</label>
                      <span className="prediction-text">{predictionText}</span>
                    </div>
                    {result.details?.plant && (
                      <div className="result-item">
                        <label>{t("plant")}:</label>
                        <span>{result.details.plant}</span>
                      </div>
                    )}
                  </div>

                  {result.details?.about && (
                    <div className="disease-info-section">
                      <h4>{t("aboutDisease")}</h4>
                      <p>{result.details.about}</p>
                    </div>
                  )}

                  <div className="disease-details-grid">
                    {result.details?.symptoms?.length > 0 && (
                      <div className="info-block">
                        <h4>{t("symptoms")}</h4>
                        <ul>
                          {result.details.symptoms.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.details?.treatment?.length > 0 && (
                      <div className="info-block">
                        <h4>{t("treatment")}</h4>
                        <ul>
                          {result.details.treatment.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.details?.prevention?.length > 0 && (
                      <div className="info-block">
                        <h4>{t("prevention")}</h4>
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;