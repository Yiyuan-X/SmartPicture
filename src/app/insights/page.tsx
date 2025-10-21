import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { insightsJsonLd } from "@/data/insights";
import { createMetadata } from "@/lib/metadata";
import { listInsightArticles } from "@/lib/insights-store";
import { CalendarDays, PenSquare, Sparkles, Share2, TrendingUp } from "lucide-react";
import InsightsReferralCard from "@/components/insights/referral-card";

function formatDateValue(input: string) {
  try {
    const date = new Date(input);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return input;
  }
}

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: "智能洞察",
  description:
    "SmartPicture Insight Lab 每天自动生成覆盖 SEO 与 AEO 的高质量洞察文章，并提供分享素材与积分激励，助力品牌增长。",
  path: "/insights",
});

export default async function InsightsPage() {
  const articles = await listInsightArticles();
  const [featured, ...rest] = articles;
  const today = new Date().toISOString().slice(0, 10);
  const todaysAuto = articles.filter(
    (article) => article.source === "auto" && article.createdAt.startsWith(today)
  ).length;

  return (
    <div className="space-y-16 bg-gradient-to-b from-blue-50 via-white to-amber-50 pb-24">
      <JsonLd id="insights-json-ld" data={insightsJsonLd} />
      <section className="border-b border-blue-100 bg-white/90">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            <Badge className="bg-blue-100 text-blue-700">智能洞察</Badge>
            <h1 className="text-4xl font-bold text-gray-900">SmartPicture Insight Lab</h1>
            <p className="text-lg text-gray-600">
              我们每天自动产出 5 篇围绕品牌增长的 SEO + AEO 优质文章，并将其置入「智能洞察」中，帮助营销与增长团队随时获取可执行的策略、案例与跨平台传播素材。
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1">
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                今日自动文章：{todaysAuto} / 5
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                支持手动或定时生成
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                多平台分享赚积分
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild>
                <Link href="/generate-article" className="inline-flex items-center gap-2">
                  <PenSquare className="h-4 w-4" />
                  立即生成新文章
                </Link>
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                <Link href="#insight-feed" className="inline-flex items-center gap-2">
                  浏览最新洞察
                  <Share2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="space-y-4 border-blue-100 bg-white/95 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">自动生文调度（演示）</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <strong className="text-gray-900">每日 06:00：</strong> 触发智能体，生成 5 篇行业热词文章并同步到「智能洞察」。
              </li>
              <li>
                <strong className="text-gray-900">自动打分：</strong> 根据 AEO 结构与关键词密度生成质量评分，便于内容团队筛选。
              </li>
              <li>
                <strong className="text-gray-900">再分发：</strong> 系统自动生成 Facebook、LinkedIn、X 和 朋友圈分享文案，复制即用。
              </li>
            </ul>

          </Card>
        </div>
      </section>

      <section id="insight-feed" className="mx-auto flex max-w-6xl flex-col gap-12 px-4">
        {featured ? (
          <Card className="overflow-hidden border-amber-200 bg-white/95 shadow-xl">
            <div className="grid gap-0 lg:grid-cols-[1fr,0.9fr]">
              <div className="space-y-5 p-8">
                <Badge className="bg-amber-100 text-amber-700">重点推荐</Badge>
                <h2 className="text-3xl font-semibold text-gray-900">{featured.title}</h2>
                <p className="text-sm uppercase tracking-wide text-amber-600">
                  {featured.source === "auto" ? "自动发布" : "手动生成"} · {formatDateValue(featured.createdAt)}
                </p>
                <p className="text-base leading-relaxed text-gray-600">{featured.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {featured.keywords.slice(0, 6).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600">
                    <Link href={`/insights/${featured.slug}`} className="inline-flex items-center gap-2">
                      阅读文章
                      <Sparkles className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    <Link href="/generate-article">使用此模板生成更多文章</Link>
                  </Button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50 p-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Highlights</h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  {featured.tableSummary.slice(0, 4).map((item, index) => (
                    <li key={`${item.section}-${index}`} className="rounded-lg border border-amber-100 bg-white/80 p-3">
                      <p className="text-xs font-semibold text-amber-600">{item.section}</p>
                      <p className="mt-1 leading-relaxed">{item.insight}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-lg border border-dashed border-amber-200 bg-white/70 p-4 text-xs text-gray-500">
                  <p>复制分享素材，立刻在 Facebook / LinkedIn / X / 朋友圈传播。</p>
                  <p className="mt-2">访问文章详情页可获取平台化文案、积分任务和 AI 推荐标题。</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-blue-100 bg-white/90 p-10 text-center text-sm text-gray-500">
            <p>暂无洞察文章。先在「AI 自动生文」页面生成一篇吧！</p>
          </Card>
        )}

        {rest.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {rest.map((article) => (
              <Card key={article.id} className="flex h-full flex-col justify-between border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                    <span>{article.source === "auto" ? "自动生成" : "手动生成"}</span>
                    <span>·</span>
                    <span>{formatDateValue(article.createdAt)}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                  <p className="line-clamp-4 text-sm text-gray-600">{article.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <Button size="sm" asChild>
                    <Link href={`/insights/${article.slug}`}>阅读全文</Link>
                  </Button>
                  <span className="text-xs text-gray-400">
                    SEO Title：{article.seoTitle.slice(0, 32)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        <InsightsReferralCard />
      </section>
    </div>
  );
}
