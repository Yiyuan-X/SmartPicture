import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getGenerativeModel } from "@/lib/vertex";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatRequestBody = {
  sessionId?: string;
  messages?: ChatMessage[];
  locale?: string;
};

const MODEL_ID = process.env.CONTENT_ASSISTANT_MODEL ?? "gemini-1.5-flash-001";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求体需为 JSON 格式。" },
      { status: 400 }
    );
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { success: false, error: "请提供会话消息数组。" },
      { status: 400 }
    );
  }

  const formattedMessages = messages
    .filter((message) => message.content?.trim())
    .slice(-12)
    .map((message) => {
      const role = message.role === "assistant" ? "model" : "user";
      return {
        role,
        parts: [{ text: message.content }],
      };
    });

  if (!formattedMessages.some((item) => item.role === "user")) {
    return NextResponse.json(
      { success: false, error: "缺少用户消息内容。" },
      { status: 400 }
    );
  }

  const systemPrompt =
    body.locale === "en-US"
      ? "You are SmartPicture's visual content strategist. Provide concise, actionable suggestions for marketing teams."
      : "你是 SmartPicture 的内容策略师，请结合图片上下文提供精准、可执行的营销建议。";

  formattedMessages.unshift({ role: "user", parts: [{ text: systemPrompt }] });

  const model = getGenerativeModel({ model: MODEL_ID });

  try {
    const response = await model.generateContent({
      contents: formattedMessages,
    });

    const replyText =
      response.response?.candidates?.[0]?.content?.parts
        ?.map((part) => ("text" in part ? part.text : ""))
        .join("") ?? "很抱歉，我暂时无法生成建议，请稍后再试。";

    return NextResponse.json(
      {
        success: true,
        sessionId: body.sessionId ?? `session-${Date.now()}`,
        reply: {
          role: "assistant",
          content: replyText.trim(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Vertex chat error:", error);
    const statusCode = getGoogleErrorStatusCode(error);
    if (statusCode === 429) {
      return NextResponse.json(
        {
          success: false,
          error: "对话请求过于频繁，请稍后重试或在 Google Cloud 控制台提升 Vertex AI 配额。",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "生成回答失败，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
