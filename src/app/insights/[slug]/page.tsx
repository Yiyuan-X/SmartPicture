import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInsightBySlug } from "@/lib/insights-store";
import InsightShareActions from "@/components/insights/share-actions";
import { ArrowLeft, CalendarDays, Clock, Layers, Sparkles } from "lucide-react";

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

function estimateReadingMinutes(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.round(words / 350));
  return `${minutes} 分钟阅读`;
}

export const dynamic = "force-dynamic";

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  const tocItems = article.outline?.length ? article.outline.slice(0, 12) : [];

  return (
    <div className="bg-gradient-to-b from-white via-blue-50 to-amber-50 pb-24">
      <section className="border-b border-blue-100 bg-white/95">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="px-2 text-gray-500 hover:text-gray-700">
                <Link href="/insights" className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回洞察列表
                </Link>
              </Button>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs uppercase tracking-wide text-blue-600">
                <Sparkles className="h-3.5 w-3.5" />
                {article.source === "auto" ? "自动生成" : "手动生成"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-gray-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDateValue(article.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {estimateReadingMinutes(article.content)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <Badge className="bg-amber-100 text-amber-700">智能洞察 · Insight Lab</Badge>
            <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>
            <p className="text-lg leading-relaxed text-gray-600">{article.summary}</p>
            <div className="flex flex-wrap gap-2">
              {article.keywords.slice(0, 8).map((keyword) => (
                <span key={keyword} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-5xl gap-8 px-4 lg:grid-cols-[1fr,0.38fr]">
        <article className="space-y-8">
          <Card className="border-blue-100 bg-white/95 p-8 shadow-sm">
            <div className="space-y-6">
              <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-4 text-sm text-gray-600">
                <p>
                  <strong>SEO Title：</strong> {article.seoTitle}
                </p>
                <p className="mt-2">
                  <strong>SEO Description：</strong> {article.seoDescription}
                </p>
              </div>

              {tocItems.length ? (
                <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">文章导览</h2>
                  <ol className="mt-3 space-y-2 text-sm text-gray-600">
                    {tocItems.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex items-start gap-2">
                        <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-gray-200 text-center text-[11px] font-semibold text-gray-600">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="prose prose-base max-w-none text-gray-700 prose-headings:text-gray-900 prose-th:text-gray-900">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </div>
          </Card>

          {article.tableSummary?.length ? (
            <Card className="border-amber-100 bg-white/95 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">关键洞察摘要</h2>
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-2">章节</th>
                      <th className="px-4 py-2">关键洞察</th>
                    </tr>
                  </thead>
                  <tbody>
                    {article.tableSummary.map((row, index) => (
                      <tr key={`${row.section}-${index}`} className={index % 2 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-2 font-medium text-gray-700">{row.section}</td>
                        <td className="px-4 py-2 text-gray-600">{row.insight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </article>

        <div className="space-y-6">
          <Card className="space-y-3 border-blue-100 bg-white/95 p-6 shadow-sm text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">AEO + SEO 结构概览</h2>
                <p className="text-xs text-gray-500">
                  我们会自动生成列表、步骤、表格等结构，帮助 Gemini/ChatGPT 等 AI 引擎更好地引用。
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 结构化标题层级：{article.outline.length} 个节点</li>
              <li>• 平台化分享文案：{article.shareSnippets.length} 组</li>
              <li>• 行动建议：{article.actionCallouts.length} 条</li>
            </ul>
            <Button asChild size="sm">
              <Link href="/generate-article">使用此引擎生成自定义文章</Link>
            </Button>
          </Card>

          <InsightShareActions articleTitle={article.title} shareSnippets={article.shareSnippets} slug={article.slug} />
        </div>
      </section>
    </div>
  );
}
