from flask import Blueprint, request, jsonify
from utils.seo import build_seo_response
import os


# ✅ 定义 Flask Blueprint（推荐在 Cloud Run / Flask App 注册）
smart_insights_bp = Blueprint("smart_insights", __name__)

@smart_insights_bp.route("/api/generate_text", methods=["POST"])
def generate_text():
    """
    生成 AI 文本内容并返回带 SEO 元数据的 JSON 响应
    """
    try:
        data = request.get_json(force=True)
        prompt = (data.get("prompt") or "").strip()

        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400

        # 🧠 调用 Gemini-Pro 模型
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        content = getattr(response, "text", "").strip()

        if not content:
            return jsonify({"error": "Model returned empty content"}), 500

        # 📈 构建 SEO 响应（调用 utils.seo 模块中的函数）
        seo_payload = build_seo_response(
            data={"generated_text": content},
            title="AI文章生成 | SmartPicture 智能洞察",
            keywords=["AI内容生成", "AEO优化", "品牌内容中心"],
            description=f"基于AI的内容生成工具，为品牌提供高质量AEO文章：{prompt[:60]}"
        )

        return jsonify(seo_payload), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ 可选：如果你想直接运行这个文件单独测试
if __name__ == "__main__":
    from flask import Flask

    app = Flask(__name__)
    app.register_blueprint(smart_insights_bp)

    print("🚀 SmartInsights service running at http://127.0.0.1:8080")
    app.run(host="0.0.0.0", port=8080, debug=True)
