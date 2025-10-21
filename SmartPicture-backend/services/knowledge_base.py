from flask import jsonify
from utils import seo
from utils.ai_client import generate_content



def query(request):
    data = request.get_json(force=True)
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "Missing question"}), 400

    seo_payload = build_seo_response(
        data={"answer": f"这是针对你的问题“{question}”的智能回答。"},
        title="知识库问答 | SmartPicture RAG",
        keywords=["知识检索", "AI问答", "文档理解"],
        description=f"上传PDF与知识文件，获得带引用的精准回答：{question}"
    )
    return jsonify(seo_payload)
