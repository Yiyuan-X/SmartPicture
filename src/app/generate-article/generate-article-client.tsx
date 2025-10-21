"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GENERATE_COST, SHARE_REWARD, shareLabels } from "@/data/generate-article";
import { useUserPoints } from "@/hooks/use-user-points";
import { getCurrentIdToken } from "@/lib/auth-client";
import type { GeneratedArticle } from "@/lib/generate-article-flow";
import { Loader2, PenSquare, Award } from "lucide-react";

const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
  ssr: false,
});

const SHARE_LINK = "https://smartpicture.ai";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("copy failed", error);
    return false;
  }
}

export function GenerateArticleClient() {
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { points, isReady: pointsReady, canAfford, deductPoints, addPoints } = useUserPoints();

  const outlineHtml = useMemo(() => {
    if (!article?.outline?.length) return null;
    return article.outline.map((item, index) => (
      <li key={`${item}-${index}`} className="text-sm text-gray-600">
        {item}
      </li>
    ));
  }, [article?.outline]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);
      setSuccessMessage(null);
      setArticle(null);

      if (!topic || topic.trim().length < 4) {
        setErrorMessage("请提供更明确的文章主题（至少 4 个字符）。");
        return;
      }

      if (!pointsReady) {
        setErrorMessage("积分状态加载中，请稍后再试。");
        return;
      }

      if (!canAfford(GENERATE_COST)) {
        setErrorMessage(`当前积分不足（剩余 ${points ?? 0}），生成文章需要 ${GENERATE_COST} 积分。`);
        return;
      }

      const deducted = deductPoints(GENERATE_COST);
      if (!deducted) {
        setErrorMessage(`扣除积分失败，请确认剩余积分（当前 ${points ?? 0}）。`);
        return;
      }

      try {
        setIsLoading(true);
        const token = await getCurrentIdToken();
        if (!token) {
          setShowAuthDialog(true);
          throw new Error("请先登录后再生成文章。");
        }

        const request = async (authToken: string) =>
          fetch("/api/articles/generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ topic }),
          });

        let response = await request(token);

        if (response.status === 401) {
          const refreshed = await getCurrentIdToken(true);
          if (!refreshed) {
            setShowAuthDialog(true);
            throw new Error("身份验证失效，请重新登录。");
          }
          response = await request(refreshed);
        }

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error ?? "自动写作失败，请稍后再试。");
        }

        setArticle(data.article);
        setSuccessMessage(`文章生成成功！本次消耗 ${GENERATE_COST} 积分。`);
      } catch (error) {
        console.error("generate article", error);
        addPoints(GENERATE_COST); // refund points when failure
        setArticle(null);
        setErrorMessage(error instanceof Error ? error.message : "文章生成失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    },
    [topic, pointsReady, canAfford, points, deductPoints, addPoints]
  );

  return (
    <div className="space-y-12 bg-gradient-to-b from-amber-50 via-white to-blue-50 pb-16">
      <section className="border-b border-orange-100 bg-white/90">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <Badge className="bg-orange-100 text-orange-700">AI 自动生文</Badge>
            <h1 className="text-4xl font-bold text-gray-900">每天 5 篇，打造 SEO + AEO 双高质量文章</h1>
            <p className="text-lg text-gray-600">
              SmartPicture Generate-Article Flow 会结合行业数据、结构化输出和平台分享策略，帮助你快速拥有在搜索引擎和 AI 引擎中都能获得高曝光的优质内容。
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>✔ 每日定时自动生成 5 篇草稿，可对接 Zapier / Cron 调度</li>
              <li>✔ 手动触发生成，随时输出品牌需要的专题文章</li>
              <li>✔ 自动准备 SEO 元信息、AEO 列表、表格与行动项</li>
              <li>✔ 分享文章到 Facebook 等平台即可赚取积分，扩大传播</li>
              <li>✔ 邀请朋友体验此功能双方均可获得积分（示例）</li>
            </ul>
          </div>

          <Card className="border-orange-200 bg-white/95 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">手动触发文章生成</CardTitle>
              <CardDescription>
                输入文章主题，点击生成即可获取完整的 SEO+AEO 优化稿件。
                <span className="ml-1 font-semibold text-orange-600">每次生成将消耗 {GENERATE_COST} 积分。</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between rounded-lg border border-dashed border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-gray-600">
                  <span>当前积分：{pointsReady ? points ?? 0 : "加载中…"}</span>
                  <span className="text-orange-600">生成一次消耗 {GENERATE_COST} 积分</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="article-topic">
                    文章主题
                  </label>
                  <Input
                    id="article-topic"
                    placeholder="例如：2025 年品牌出海的 AI 内容策略"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  />
                </div>

                {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
                {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 正在生成…
                    </>
                  ) : (
                    <>
                      <PenSquare className="mr-2 h-4 w-4" /> 生成文章
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        {!article ? (
          <Card className="border-blue-100 bg-white/90 p-8 text-center text-sm text-gray-500">
            <p>提交主题后，系统将在此展示完整文章内容和分享素材。</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <Card className="border-blue-100 bg-white/95 shadow-md">
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>主题：{article.topic}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Award className="h-3.5 w-3.5" /> 已奖励 20 积分（示例）
                  </span>
                </div>
                <CardTitle className="text-2xl text-gray-900">{article.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{article.summary}</CardDescription>
                {article.slug ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-fit border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    <Link href={`/insights/${article.slug}`} target="_blank">
                      在「智能洞察」中查看文章
                    </Link>
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2 text-sm text-gray-600">
                  <p>
                    <strong>SEO Title：</strong> {article.seoTitle}
                  </p>
                  <p>
                    <strong>SEO Description：</strong> {article.seoDescription}
                  </p>
                  <p>
                    <strong>关键词：</strong> {article.keywords.join("， ")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">文章大纲</h3>
                  <ul className="space-y-1 list-disc pl-5 text-sm text-gray-600">{outlineHtml}</ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">正文内容</h3>
                  <article
                    className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>

                {article.tableSummary?.length ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">关键洞察摘要</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500">
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
                  </div>
                ) : null}

                {article.actionCallouts?.length ? (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">立即行动建议</h3>
                    <ul className="space-y-1 list-decimal pl-5 text-sm text-gray-600">
                      {article.actionCallouts.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-orange-100 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">跨平台分享素材</CardTitle>
                  <CardDescription>
                    分享到 Facebook 可立即获赠 {SHARE_REWARD} 积分，其它平台可自定义奖励策略
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {article.shareSnippets.map((snippet, index) => (
                    <button
                      key={`${snippet.platform}-${index}`}
                      type="button"
                      className="w-full rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 transition hover:border-orange-300 hover:bg-orange-50"
                      onClick={async () => {
                        const shareText = snippet.message.includes(SHARE_LINK)
                          ? snippet.message
                          : `${snippet.message}\n\n了解更多：${SHARE_LINK}`;
                        const ok = await copyToClipboard(shareText);
                        if (ok && snippet.platform === "facebook") {
                          addPoints(SHARE_REWARD);
                          setSuccessMessage(
                            `已复制 ${shareLabels[snippet.platform] ?? snippet.platform} 文案，同时奖励 ${SHARE_REWARD} 积分（示例）。`
                          );
                        } else if (ok) {
                          setSuccessMessage(`已复制 ${shareLabels[snippet.platform] ?? snippet.platform} 文案。`);
                        }
                      }}
                    >
                      <span className="text-xs font-semibold uppercase text-orange-600">
                        {shareLabels[snippet.platform] ?? snippet.platform}
                      </span>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{snippet.message}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </section>

      {showAuthDialog ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">登录后继续生成文章</h3>
            <p className="mt-2 text-sm text-gray-600">
              SmartPicture 自动生文模块需要登录账号以便同步积分与历史记录，请先完成登录。
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <AuthDialog layout="vertical" onAction={() => setShowAuthDialog(false)} />
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowAuthDialog(false)}
              >
                暂时稍后再说
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
