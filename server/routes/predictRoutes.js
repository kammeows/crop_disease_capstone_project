const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Changed to localhost since you are running locally without Docker
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000/predict";

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    
    // Get model from body, default to the 38-class model
    const modelName = req.body.model || "default_model_38.h5";
    formData.append("model", modelName);
    
    console.log(`[Backend] Target ML URL: ${ML_SERVICE_URL}`);
    console.log(`[Backend] Selected Model: ${modelName}`);

    const response = await axios.post(
      ML_SERVICE_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    console.log(`[Backend] ML Response:`, response.data.prediction);
    res.json(response.data);
  } catch (error) {
    console.error("[Backend] Prediction error:", error.message);
    if (error.response) {
      console.error("[Backend] ML Service Error Data:", error.response.data);
    }
    res.status(500).json({ 
      error: "Prediction failed", 
      details: error.response?.data?.error || error.message 
    });
  }
});

module.exports = router;
