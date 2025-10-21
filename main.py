
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route("/generate-text", methods=["POST"])
def generate_text():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400
    # 这里假设你稍后会接入 Gemini 或 Vertex
    return jsonify({"generated_text": f"You said: {prompt}"})

@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "Flask is running on Cloud Run."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

