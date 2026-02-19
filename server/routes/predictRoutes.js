const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      "http://ml-service:8000/predict",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

module.exports = router;
