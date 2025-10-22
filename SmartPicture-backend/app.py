from flask import Flask, request, jsonify
from google.cloud import firestore
from utils.fb_auth import verify_token


db = firestore.Client()
app = Flask(__name__)

def get_points(uid):
    doc = db.collection("users").document(uid).get()
    return (doc.to_dict() or {}).get("points", 0)

def add_tx(uid, amount, meta):
    db.collection("transactions").add({
        "uid": uid, "type": "earn" if amount>0 else "spend",
        "amount": amount, "meta": meta,
        "createdAt": firestore.SERVER_TIMESTAMP
    })
    db.collection("users").document(uid).set({
        "points": firestore.Increment(amount),
        "lastActiveAt": firestore.SERVER_TIMESTAMP
    }, merge=True)

@app.post("/api/generate_text")
def api_generate_text():
    try:
        uid = verify_token(request.headers.get("Authorization"))
        cost = 10
        if get_points(uid) < cost:
            return jsonify({"error":"INSUFFICIENT_POINTS"}), 403
        prompt = (request.get_json(force=True).get("prompt") or "").strip()
        content = generate_content(prompt, mode="text")
        add_tx(uid, -cost, {"module":"smart_insights","prompt":prompt})
        return jsonify({"generated_text": content, "spent": cost})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.post("/api/generate_image")
def api_generate_image():
    try:
        uid = verify_token(request.headers.get("Authorization"))
        cost = 5
        if get_points(uid) < cost:
            return jsonify({"error":"INSUFFICIENT_POINTS"}), 403
        prompt = (request.get_json(force=True).get("prompt") or "").strip()
        result = generate_content(prompt, mode="image")  # 返回URL或Base64
        add_tx(uid, -cost, {"module":"creative_studio","prompt":prompt})
        return jsonify({"image": result, "spent": cost})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=8080, host="0.0.0.0")
