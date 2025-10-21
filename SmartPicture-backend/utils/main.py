"""
Service: Creative Studio
Purpose: Generate brand-consistent, commercial-grade visuals via Vertex AI Imagen 3
Endpoint: /generate-image
Runtime: Flask on Cloud Run
"""

from flask import Flask, request, jsonify
import os
from google.cloud import aiplatform

app = Flask(__name__)
PROJECT_ID = os.getenv("PROJECT_ID", "alert-autumn-467806-j3")
LOCATION = os.getenv("REGION", "us-central1")

@app.route("/")
def home():
    return jsonify({"service": "creative_studio", "status": "ok"})

@app.route("/generate-image", methods=["POST"])
def generate_image():
    """Accepts a prompt and returns a generated image URL from Vertex AI Imagen 3"""
    data = request.get_json()
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400
    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        model = aiplatform.ImageGenerationModel.from_pretrained("imagen-3.0-pro")
        result = model.predict(prompt)
        return jsonify({
            "prompt": prompt,
            "image_url": result.generated_images[0].uri,
            "model": "Vertex AI Imagen 3.0 Pro"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
