from flask import jsonify
from utils import seo
from utils.ai_client import generate_content



def capture(request):
    seo_payload = build_seo_response(
        data={"status": "ready"},
        title="截图与标注 | SmartPix Capture",
        keywords=["截图工具", "OCR识别", "图片标注"],
        description="一体化截图、标注、OCR与分享，让内容可被AI索引。"
    )
    return jsonify(seo_payload)
