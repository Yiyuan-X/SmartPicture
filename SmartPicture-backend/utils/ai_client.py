"""
ai_client.py
统一的 AI 模型调度模块
支持：
- google-generativeai (Gemini)
- google-cloud-aiplatform (Vertex AI, 可选)
"""

import os
import google.generativeai as genai

# === 初始化 Gemini (API Key 模式) ===
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# === 尝试导入 Vertex AI (服务账号模式，可选) ===
try:
    from google.cloud import aiplatform
    aiplatform.init(
        project=os.environ.get("GOOGLE_CLOUD_PROJECT", "smartpicture-ai"),
        location=os.environ.get("GCP_LOCATION", "us-central1"),
    )
    VERTEX_ENABLED = True
except Exception as e:
    print(f"⚠️ Vertex AI 初始化失败（可能未配置或未安装）: {e}")
    VERTEX_ENABLED = False


# === 智能调度函数 ===
def generate_content(prompt: str, mode: str = "text", **kwargs):
    """
    智能调度AI模型
    :param prompt: 输入提示词
    :param mode: 模式类型：text / image / code / speech
    :return: 生成结果文本或描述
    """
    try:
        if mode == "text":
            # Gemini - 文本生成
            model = genai.GenerativeModel("gemini-pro")
            response = model.generate_content(prompt)
            return getattr(response, "text", "").strip()

        elif mode == "image":
            # Vertex AI - 图像生成（可选）
            if not VERTEX_ENABLED:
                return "⚠️ Vertex AI 模块不可用，请检查 google-cloud-aiplatform 安装或凭证配置。"
            model = aiplatform.GenerativeModel("imagegeneration@006")
            response = model.generate_content(prompt)
            return getattr(response, "text", "").strip()

        elif mode == "code":
            # Gemini Code 模式（示例）
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"编写以下功能代码: {prompt}")
            return getattr(response, "text", "").strip()

        elif mode == "speech":
            # 保留接口：未来可接入 TTS 模型
            return "Speech generation not implemented yet."

        else:
            return f"❌ Unsupported mode: {mode}"

    except Exception as e:
        return f"⚠️ AI 调用失败: {e}"


# === 测试入口 ===
if __name__ == "__main__":
    print("🧠 Testing ai_client:")
    print(generate_content("写一段关于AI创意和艺术结合的短文", mode="text"))
    print(generate_content("生成一张梦幻城市的图像", mode="image"))
