from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from keras.models import load_model
import numpy as np
from PIL import Image
import io
import os
import json

app = Flask(__name__)
CORS(app)

# Use absolute paths or check relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
CONFIG_DIR = os.path.join(BASE_DIR, "config")

models_cache = {}
disease_info = {}

# Load disease info
try:
    json_path = os.path.join(CONFIG_DIR, "disease.json")
    with open(json_path, "r") as f:
        disease_info = json.load(f)
    print(f"[ML] Loaded {len(disease_info)} disease mappings from {json_path}")
except Exception as e:
    print(f"[ML] Error loading disease.json: {e}")

# Get class names in order for models that use the 38-class mapping
CLASS_NAMES = list(disease_info.keys())

def get_model(model_name):
    if model_name not in models_cache:
        model_path = os.path.join(MODELS_DIR, model_name)
        
        # Check if file exists
        if not os.path.exists(model_path):
            # Fallback to BASE_DIR (root of ml-service)
            model_path = os.path.join(BASE_DIR, model_name)
            
        if not os.path.exists(model_path):
            print(f"[ML] ERROR: Model file not found: {model_name}")
            return None
            
        print(f"[ML] Loading model from: {model_path}")
        try:
            # models_cache[model_name] = load_model(model_path)
            models_cache[model_name] = load_model(model_path, compile=False)
            print(f"[ML] Model {model_name} loaded successfully")
        except Exception as e:
            print(f"[ML] ERROR loading {model_name}: {e}")
            return None
            
    return models_cache[model_name]

def preprocess_image(image, target_size=(224, 224)):
    image = image.resize(target_size) 
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Get model name from form data
    model_name = request.form.get("model", "default_model_38.h5")
    print(f"[ML] Request for model: {model_name}")
    
    selected_model = get_model(model_name)
    if selected_model is None:
        return jsonify({"error": f"Model {model_name} not found or failed to load"}), 404

    file = request.files["file"]
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # Detect input size from model
    input_shape = selected_model.input_shape
    target_size = (input_shape[1], input_shape[2]) if input_shape and len(input_shape) >= 3 else (224, 224)
    
    print(f"[ML] Preprocessing image to {target_size}")
    processed = preprocess_image(image, target_size=target_size)
    
    print(f"[ML] Running prediction...")
    prediction = selected_model.predict(processed)
    
    extra_info = {}
    is_binary = prediction.shape[1] == 1
    
    # Priority 1: Multi-class mapping for disease-specific models
    if model_name in ["default_model_38.h5", "model2.h5"]:
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        
        if predicted_class_idx < len(CLASS_NAMES):
            class_key = CLASS_NAMES[predicted_class_idx]
            info = disease_info.get(class_key, {})
            result = info.get("disease", class_key)
            extra_info = info
            print(f"[ML] Model {model_name} matched index {predicted_class_idx} to {class_key}")
        else:
            result = f"Unknown Disease ({predicted_class_idx})"
            print(f"[ML] Model {model_name} index {predicted_class_idx} out of range")

    # Priority 2: Binary logic for health classifier
    elif model_name == "efficientNet_model.h5" or is_binary:
        confidence = float(prediction[0][0])
        result = "Unhealthy" if confidence > 0.5 else "Healthy"
        if result == "Healthy":
            confidence = 1.0 - confidence
        print(f"[ML] Binary model result: {result}")

    # Priority 3: Generic multi-class
    else:
        predicted_class_idx = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_idx])
        result = f"Class {predicted_class_idx}"
        print(f"[ML] Generic model result index: {predicted_class_idx}")

    print(f"[ML] Final Response - Prediction: {result}, Confidence: {confidence:.4f}")

    return jsonify({
        "prediction": result,
        "confidence": confidence,
        "model_used": model_name,
        "details": extra_info
    })

@app.route("/models", methods=["GET"])
def list_models():
    # Only return the requested models for consistency
    allowed_models = ["default_model_38.h5", "efficientNet_model.h5", "model2.h5"]
    models = []
    if os.path.exists(MODELS_DIR):
        models = [f for f in os.listdir(MODELS_DIR) if f in allowed_models]
    return jsonify({"models": models})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)

# testing2