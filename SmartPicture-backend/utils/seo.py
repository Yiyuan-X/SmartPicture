# utils/seo.py
from datetime import datetime
from typing import Any, Dict, List, Optional
import re


def detect_content_type(data: Dict[str, Any]) -> str:
    """
    🔍 自动识别内容类型：
    - 图片类 → ImageObject
    - 视频类 → VideoObject
    - 音频类 → AudioObject
    - 文本类 → Article
    - 其他 → CreativeWork
    """
    if not data:
        return "CreativeWork"

    content_str = str(data).lower()
    if any(k in content_str for k in ["jpg", "jpeg", "png", "webp", "image"]):
        return "ImageObject"
    if any(k in content_str for k in ["mp4", "video", "clip", "youtube"]):
        return "VideoObject"
    if any(k in content_str for k in ["mp3", "audio", "podcast"]):
        return "AudioObject"
    if any(k in content_str for k in ["text", "content", "article", "blog"]):
        return "Article"

    return "CreativeWork"


def evaluate_seo_health(title: str, description: str, keywords: List[str]) -> Dict[str, Any]:
    """
    📈 基于基本规则的 SEO + AEO 健康度评分系统
    返回评分与改进建议
    """
    score = 100
    suggestions = []

    if not title or len(title) < 10:
        score -= 10
        suggestions.append("标题过短，建议添加更多描述性关键词。")

    if not description or len(description) < 50:
        score -= 15
        suggestions.append("描述不足，建议补充150字符左右自然语言摘要。")

    if len(keywords) < 3:
        score -= 10
        suggestions.append("关键词数量较少，建议至少提供3-5个。")

    if not re.search(r"(AI|智能|SmartPicture|Growth|Content|工具)", title):
        score -= 5
        suggestions.append("标题中缺少核心品牌词或主题关键词。")

    return {
        "seo_score": max(0, score),
        "suggestions": suggestions or ["优化良好，表现优秀 ✅"]
    }


def build_seo_response(
    data: Optional[Dict[str, Any]] = None,
    title: str = "AI Generated Content",
    description: str = "",
    keywords: Optional[List[str]] = None,
    lang: str = "zh-CN",
    region: str = "CN",
    canonical: str = "https://ai-growth-tools.com",
) -> Dict[str, Any]:
    """
    🚀 SmartPicture Growth Hub
    智能 SEO + AEO + GEO 响应封装器（v4）
    - 自动识别内容类型
    - 自动生成结构化Schema
    - 自动计算SEO健康度评分
    - 自动添加多语言与GEO信息
    """

    keywords = keywords or ["AI", "SmartPicture", "Growth", "Content", "SEO", "AEO"]
    description = (description or "")[:180]
    content_type = detect_content_type(data)

    # 计算SEO健康度
    seo_eval = evaluate_seo_health(title, description, keywords)

    # Schema.org 结构化数据
    structured_data = {
        "@context": "https://schema.org",
        "@type": content_type,
        "headline": title,
        "description": description,
        "keywords": keywords,
        "inLanguage": lang,
        "contentLocation": region,
        "datePublished": datetime.utcnow().isoformat() + "Z",
        "provider": {
            "@type": "Organization",
            "name": "SmartPicture Growth Hub",
            "url": canonical
        },
        "publisher": {
            "@type": "Organization",
            "name": "AI Growth Tools Matrix",
            "url": "https://ai-growth-tools.com"
        },
        "author": {
            "@type": "Organization",
            "name": "SmartPicture AI"
        }
    }

    # 多语言 GEO hreflang 支持
    hreflang_links = [
        {"hreflang": "zh-CN", "href": f"{canonical}/zh-CN"},
        {"hreflang": "en-US", "href": f"{canonical}/en-US"},
        {"hreflang": "ja-JP", "href": f"{canonical}/ja-JP"},
    ]

    # 最终封装响应
    response = {
        "status": "ok",
        "title": title,
        "description": description,
        "keywords": ", ".join(keywords),
        "canonical": canonical,
        "hreflang": lang,
        "region": region,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "structured_data": structured_data,
        "hreflang_links": hreflang_links,
        "seo_analysis": seo_eval,  # ← 包含分数与建议
    }

    if data:
        response["data"] = data

    return response
