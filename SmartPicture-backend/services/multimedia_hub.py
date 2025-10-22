from flask import jsonify
from utils import seo




def process_media(request):
    data = request.get_json(force=True)
    media_url = data.get("media_url", "")
    if not media_url:
        return jsonify({"error": "Missing media_url"}), 400

    seo_payload = build_seo_response(
        data={"summary": f"为 {media_url} 自动生成摘要与片段"},
        title="AI音视频摘要 | SmartPicture 多媒体枢纽",
        keywords=["AI摘要", "音视频处理", "内容提炼"],
        description=f"将长视频或音频压缩为行动指南，生成高质量摘要内容。"
    )
    return jsonify(seo_payload)
