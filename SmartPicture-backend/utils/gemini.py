"""
utils/gemini.py
----------------
封装 Google Generative AI (Gemini) 模型的统一调用接口。
支持多类型任务：文本生成、图像分析、文本嵌入等。
"""

import os
import google.generativeai as genai
from flask import jsonify

# 初始化 Gemini API
API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise EnvironmentError("❌ GOOGLE_API_KEY 未设置，请在 Cloud Run 或本地环境中配置。")

genai.configure(api_key=API_KEY)


def generate_text(prompt: str, model: str = "gemini-pro", temperature: float = 0.7) -> dict:
    """
    使用 Gemini Pro 生成文本
    """
    if not prompt.strip():
        return {"error": "Prompt 不能为空"}

    try:
        model_instance = genai.GenerativeModel(model)
        response = model_instance.generate_content(prompt, generation_config={"temperature": temperature})
        return {"generated_text": response.text.strip()}
    except Exception as e:
        print(f"[Gemini Text Error] {e}")
        return {"error": str(e)}


def analyze_image(image_base64: str, prompt: str = "Describe this image") -> dict:
    """
    使用 Gemini Pro Vision 分析图像
    image_base64: base64 编码的图片字符串
    """
    if not image_base64:
        return {"error": "缺少图像输入"}

    try:
        model_instance = genai.GenerativeModel("gemini-pro-vision")
        response = model_instance.generate_content([prompt, {"mime_type": "image/png", "data": image_base64}])
        return {"analysis": response.text.strip()}
    except Exception as e:
        print(f"[Gemini Vision Error] {e}")
        return {"error": str(e)}


def embed_text(text: str, model: str = "textembedding-gecko@003") -> dict:
    """
    使用 Gemini Text Embedding 模型生成语义向量。
    可用于 RAG（检索增强生成）或相似度搜索。
    """
    if not text.strip():
        return {"error": "文本不能为空"}

    try:
        embed = genai.embed_content(model=model, content=text)
        vector = embed["embedding"]
        return {"embedding": vector, "dimension": len(vector)}
    except Exception as e:
        print(f"[Gemini Embedding Error] {e}")
        return {"error": str(e)}


def safe_json_response(data: dict, status: int = 200):
    """
    返回 Flask 安全 JSON 响应（自动设置 Content-Type）
    """
    response = jsonify(data)
    response.status_code = status
    response.headers["Content-Type"] = "application/json"
    return response
