from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = load_model("efficientNet_model.h5")

def preprocess_image(image):
    image = image.resize((224, 224)) 
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    processed = preprocess_image(image)
    prediction = model.predict(processed)

    result = "Healthy" if prediction[0][0] < 0.5 else "Unhealthy"

    return jsonify({
        "prediction": result,
        "confidence": float(prediction[0][0])
    })

if __name__ == "__main__":
    app.run(port=8000)
