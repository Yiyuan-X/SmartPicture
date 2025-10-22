from utils import seo
from flask import Blueprint, request, jsonify
from utils.auth import verify_token
from utils.points import get_points, deduct_points


creative_studio_bp = Blueprint("creative_studio", __name__)

@creative_studio_bp.route("/api/generate_image", methods=["POST"])
def generate_image():
    user_id = verify_token()
    if isinstance(user_id, tuple):  # 返回错误响应
        return user_id

    if get_points(user_id) < 5:
        return jsonify({"error": "积分不足，请先邀请好友或充值"}), 403

    data = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()
    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    deduct_points(user_id, 5)
    image = generate_content(prompt, mode="image")
    return jsonify({
        "message": "✅ 图片生成成功，已扣除5积分",
        "image": image
    }), 200


def generate_image(request):
    data = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    fake_url = f"https://dummyimage.com/512x512/222/fff&text={prompt.replace(' ', '+')}"
    seo_payload = build_seo_response(
        data={"image_url": fake_url},
        title=f"AI图像生成 | {prompt}",
        keywords=["AI图像", "品牌视觉", "生成式AI"],
        description=f"AI创意工作室为你生成符合品牌调性的视觉内容：{prompt}"
    )

    return jsonify(seo_payload)
