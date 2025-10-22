from flask import jsonify
from utils import seo



def analyze_image(request):
    data = request.get_json(force=True)
    image_url = data.get("image_url", "")
    if not image_url:
        return jsonify({"error": "Missing image_url"}), 400

    seo_payload = build_seo_response(
        data={"description": f"AI分析了图像 {image_url}", "keywords": ["AI视觉", "内容分析"]},
        title="AI图像分析 | SmartPicture 内容助理",
        keywords=["AI视觉", "图像识别", "内容助理"],
        description=f"自动提取关键词、生成文案与素材：{image_url}"
    )
    return jsonify(seo_payload)
