import jwt
import os
from flask import request, jsonify

SECRET_KEY = os.environ.get("JWT_SECRET", "supersecret")

def generate_token(user_id):
    """生成用户登录 Token"""
    return jwt.encode({"user_id": user_id}, SECRET_KEY, algorithm="HS256")

def verify_token():
    """验证请求头中的 Authorization"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "缺少认证信息"}), 401

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except Exception:
        return jsonify({"error": "Token 无效"}), 401
