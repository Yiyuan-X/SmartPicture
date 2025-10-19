import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { generateArticleForTopic } from "@/lib/generate-article-flow";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";
import { appendInsightArticle } from "@/lib/insights-store";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = (await request.json()) as { topic?: string };
    const topic = body?.topic ?? "";
    if (!topic || topic.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "请输入完整的文章主题（至少 4 个字符）。" },
        { status: 400 }
      );
    }

    const article = await generateArticleForTopic(topic);
    const stored = await appendInsightArticle(article, { source: "manual" });

    return NextResponse.json(
      {
        success: true,
        article: stored,
        insightSlug: stored.slug,
        rewardPoints: 20,
        message: "文章生成成功！系统已记录积分奖励（示例）。",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("generate article failed", error);
    const statusCode = getGoogleErrorStatusCode(error);
    const message = error instanceof Error ? error.message : "自动写作失败，请稍后再试。";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode === 429 ? 429 : 500 }
    );
  }
}

export const dynamic = "force-dynamic";
