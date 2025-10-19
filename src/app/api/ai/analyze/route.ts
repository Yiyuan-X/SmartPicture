import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { requireAuth } from "@/lib/api-auth";
import { getGoogleCredentials } from "@/lib/google-service";

type AnalyzeRequestBody = {
  image?: string;
  prompt?: string;
  locale?: string;
};

const DEFAULT_PROMPT_SUGGESTIONS = [
  "为这张图片生成一段适合社媒的文案",
  "提取适合投放广告的关键词",
  "基于图片氛围设计一个活动主题",
];

let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient() {
  if (!visionClient) {
    const credentials = getGoogleCredentials();
    visionClient = new ImageAnnotatorClient({
      credentials,
    });
  }
  return visionClient;
}

function extractImageContent(image?: string) {
  if (!image) return null;
  if (image.startsWith("data:")) {
    const [, base64] = image.split("base64,");
    return base64 ? base64.trim() : null;
  }
  if (/^[A-Za-z0-9+/=]+$/.test(image)) {
    return image;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  let body: AnalyzeRequestBody;

  try {
    body = (await request.json()) as AnalyzeRequestBody;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求体需为 JSON 格式。" },
      { status: 400 }
    );
  }

  const imageContent = extractImageContent(body.image);
  if (!imageContent && !body.prompt) {
    return NextResponse.json(
      { success: false, error: "请提供 base64 图片数据或补充文字提示。" },
      { status: 400 }
    );
  }

  const client = getVisionClient();

  try {
    const [result] = await client.annotateImage({
      image: imageContent ? { content: imageContent } : undefined,
      features: [
        { type: "LABEL_DETECTION", maxResults: 8 },
        { type: "IMAGE_PROPERTIES" },
        { type: "WEB_DETECTION", maxResults: 5 },
      ],
    });

    const labels = result.labelAnnotations ?? [];
    const objects = labels
      .map((label) => ({
        label: label.description ?? "未知元素",
        confidence: label.score ?? 0,
      }))
      .filter((item) => item.label)
      .slice(0, 6);

    const dominantColors =
      result.imagePropertiesAnnotation?.dominantColors?.colors ?? [];

    const colors = dominantColors
      .map((color) => {
        const r = Math.round(color.color?.red ?? 0);
        const g = Math.round(color.color?.green ?? 0);
        const b = Math.round(color.color?.blue ?? 0);
        return `#${[r, g, b]
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("")}`.toUpperCase();
      })
      .slice(0, 5);

    const description = labels[0]?.description
      ? `图片主要包含：${labels
          .slice(0, 3)
          .map((label) => label.description)
          .join("、")}`
      : body.prompt ?? "暂未识别到明确的图片标签。";

    const promptSuggestions = [...DEFAULT_PROMPT_SUGGESTIONS];
    if (labels[0]?.description) {
      promptSuggestions.unshift(`围绕“${labels[0].description}”设计一个营销主题`);
    }

    return NextResponse.json(
      {
        success: true,
        uid: authResult.uid,
        locale: body.locale ?? "zh-CN",
        description,
        tags: labels.map((label) => label.description).filter(Boolean).slice(0, 8),
        objects,
        colors,
        promptSuggestions,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Vision API analyze error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "图片解析失败，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
