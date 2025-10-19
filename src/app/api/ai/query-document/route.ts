import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getGenerativeModel } from "@/lib/vertex";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";

type QueryDocumentRequestBody = {
  query?: string;
  documentId?: string;
  snippets?: string[];
  locale?: string;
};

const MODEL_ID = process.env.KNOWLEDGE_BASE_MODEL ?? "gemini-1.5-pro-001";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  let body: QueryDocumentRequestBody;

  try {
    body = (await request.json()) as QueryDocumentRequestBody;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求体需为 JSON 格式。" },
      { status: 400 }
    );
  }

  if (!body?.query || !body.query.trim()) {
    return NextResponse.json(
      { success: false, error: "请输入需要查询的问题。" },
      { status: 400 }
    );
  }

  const snippets = (body.snippets ?? []).slice(0, 5);
  const contextText = snippets.map((snippet, index) => `段落${index + 1}：${snippet}`).join("\n\n");

  const instruction =
    body.locale === "en-US"
      ? "Answer the user's question based strictly on the provided document snippets. Return key findings and cite paragraph numbers."
      : "请仅基于提供的文档片段回答用户问题，列出关键信息，并引用段落编号。";

  const model = getGenerativeModel({ model: MODEL_ID });

  try {
    const response = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: instruction }] },
        { role: "user", parts: [{ text: `用户问题：${body.query}` }] },
        { role: "user", parts: [{ text: contextText || "暂无上下文" }] },
      ],
    });

    const answerText =
      response.response?.candidates?.[0]?.content?.parts
        ?.map((part) => ("text" in part ? part.text : ""))
        .join("") ?? "暂无可用回答，请补充更多文档内容。";

    return NextResponse.json(
      {
        success: true,
        uid: authResult.uid,
        locale: body.locale ?? "zh-CN",
        answer: answerText.trim(),
        citations: snippets.map((snippet, index) => ({
          id: `snippet-${index + 1}`,
          excerpt: snippet.slice(0, 160),
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Vertex query-document error:", error);
    const statusCode = getGoogleErrorStatusCode(error);
    if (statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "知识库请求过于频繁，请稍后重试或在 Google Cloud 控制台提升 Vertex AI 配额。",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "查询文档失败，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
