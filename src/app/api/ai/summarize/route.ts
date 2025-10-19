import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getGenerativeModel } from "@/lib/vertex";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";

type SummarizeRequestBody = {
  transcript?: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  language?: string;
  title?: string;
};

const MODEL_ID = process.env.MULTIMEDIA_SUMMARIZE_MODEL ?? "gemini-1.5-flash-001";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  let body: SummarizeRequestBody;

  try {
    body = (await request.json()) as SummarizeRequestBody;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求体需为 JSON 格式。" },
      { status: 400 }
    );
  }

  const transcript =
    body.transcript ??
    body.segments?.map((segment) => segment.text).join("\n") ??
    "";

  if (!transcript.trim()) {
    return NextResponse.json(
      { success: false, error: "请提供音视频文字稿或分段文本。" },
      { status: 400 }
    );
  }

  const prompt =
    body.language === "en-US"
      ? "Please read the following transcript and return a JSON object with keys summary (string <= 400 chars), highlights (array of up to 5 bullet strings), actionItems (array of up to 5 actionable steps), and quotes (array of up to 3 short quotes). Respond with pure JSON."
      : "请阅读下方文字稿，返回一个 JSON 对象，包含 summary（<=400字的概述）、highlights（最多5条亮点数组）、actionItems（最多5条可执行事项数组）、quotes（最多3条适合传播的金句）。只输出 JSON，勿携带额外说明。";

  const model = getGenerativeModel({ model: MODEL_ID });

  try {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [{ text: transcript.slice(0, 6000) }] },
      ],
    });

    const generated =
      response.response?.candidates?.[0]?.content?.parts
        ?.map((part) => ("text" in part ? part.text : ""))
        .join("") ?? "";

    let parsed: {
      summary?: string;
      highlights?: string[];
      actionItems?: string[];
      quotes?: string[];
    };

    try {
      parsed = JSON.parse(generated || "{}");
    } catch (error) {
      parsed = {
        summary: generated.trim() || "未能成功生成摘要，请稍后重试。",
      };
    }

    return NextResponse.json(
      {
        success: true,
        uid: authResult.uid,
        language: body.language ?? "zh-CN",
        title: body.title ?? "音视频内容摘要",
        summary: parsed.summary ?? "未能成功生成摘要，请稍后重试。",
        highlights: parsed.highlights ?? [],
        actionItems: parsed.actionItems ?? [],
        quotes: parsed.quotes ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Vertex summarize error:", error);
    const statusCode = getGoogleErrorStatusCode(error);
    if (statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "摘要请求过于频繁，请稍后重试或在 Google Cloud 控制台提升 Vertex AI 配额。",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "生成摘要失败，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
