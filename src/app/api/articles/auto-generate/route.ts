import { NextRequest, NextResponse } from "next/server";
import { generateArticleForTopic } from "@/lib/generate-article-flow";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";
import { appendInsightArticle, countInsightsForDate } from "@/lib/insights-store";
import { randomUUID } from "crypto";

const FALLBACK_TOPICS = [
  "基于 AI 的电商视觉增长策略",
  "B2B 品牌如何利用 AEO 增加曝光",
  "2025 年营销团队的内容协同趋势",
  "多语言出海品牌的视觉资产管理",
  "社媒短视频创作者的工作流自动化",
  "生成式 AI 在教育行业的应用"
];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-cron-secret");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== secret) {
    return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { topics?: string[] };
    const requestedTopics = body?.topics?.filter((topic) => typeof topic === "string" && topic.trim());
    const sourceTopics = requestedTopics && requestedTopics.length >= 5 ? requestedTopics : FALLBACK_TOPICS;

    const todayISO = new Date().toISOString();
    const existingToday = await countInsightsForDate(todayISO);
    if (existingToday >= 5) {
      return NextResponse.json(
        {
          success: true,
          generated: [],
          count: 0,
          message: "今日已生成 5 篇文章，跳过自动任务。",
          skipped: true,
        },
        { status: 200 }
      );
    }

    const availableSlots = Math.max(0, 5 - existingToday);
    const selectedTopics = sourceTopics.slice(0, availableSlots);
    if (!selectedTopics.length) {
      return NextResponse.json(
        {
          success: true,
          generated: [],
          count: 0,
          message: "今日配额已满，未生成新的文章。",
          skipped: true,
        },
        { status: 200 }
      );
    }

    const results = [];
    const scheduleId = randomUUID();
    for (const topic of selectedTopics) {
      const article = await generateArticleForTopic(topic);
      const stored = await appendInsightArticle(article, { source: "auto", scheduleId });
      results.push(stored);
    }

    return NextResponse.json(
      {
        success: true,
        generated: results,
        count: results.length,
        message: "已自动生成文章草稿（示例）。",
        scheduleId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("auto generate articles failed", error);
    const statusCode = getGoogleErrorStatusCode(error);
    const message = error instanceof Error ? error.message : "自动写作任务执行失败。";
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
