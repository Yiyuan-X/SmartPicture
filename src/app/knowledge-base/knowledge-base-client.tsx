"use client";

import { useCallback, useMemo, useState } from "react";
import { knowledgeBaseSteps } from "@/data/knowledge-base";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Bot, Shield, Upload } from "lucide-react";

type QueryResult = {
  answer: string;
  citations: Array<{ id: string; excerpt: string }>;
};

export function KnowledgeBaseClient() {
  const [query, setQuery] = useState("");
  const [snippetInput, setSnippetInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);

  const snippetList = useMemo(
    () =>
      snippetInput
        .split(/\n\n+/)
        .map((snippet) => snippet.trim())
        .filter(Boolean),
    [snippetInput]
  );

  const handleQuery = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!query.trim()) {
        setErrorMessage("请输入问题。");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await fetchWithAuth("/api/ai/query-document", {
          method: "POST",
          body: JSON.stringify({
            query,
            snippets: snippetList,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error ?? "查询失败");
        }

        setResult({
          answer: data.answer ?? "",
          citations: data.citations ?? [],
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "查询失败，请稍后再试。");
      } finally {
        setLoading(false);
      }
    },
    [query, snippetList]
  );

  return (
    <div className="bg-gradient-to-b from-green-50 via-white to-orange-50 py-20">
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <section className="space-y-6">
          <Badge className="bg-green-100 text-green-700">知识库</Badge>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 md:w-2/3">
              <h1 className="text-4xl font-bold text-gray-900">放心地与文档对话。</h1>
              <p className="text-lg text-gray-700">
                上传报告、SOP 或培训资料，SmartPicture 将提供带引用的即时解答，确保每一次回答可追溯、可审计。
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-orange-500 text-white hover:from-green-600 hover:to-orange-600">
              加入等待名单
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {knowledgeBaseSteps.map((step) => (
            <Card key={step.title} className="h-full border-green-200 bg-white/80 p-5">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{step.description}</p>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-5 border-green-200 bg-white/85 p-6">
            <h2 className="text-lg font-semibold text-gray-900">提问与上下文</h2>
            <form onSubmit={handleQuery} className="space-y-4">
              <Input
                placeholder="例如：季度 OKR 的关键指标有哪些？"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
              <Textarea
                rows={8}
                value={snippetInput}
                onChange={(event) => setSnippetInput(event.currentTarget.value)}
                placeholder={"可选：粘贴文档片段，每段之间留一个空行，帮助模型引用准确内容"}
              />
              {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "正在查询…" : "生成回答"}
              </Button>
            </form>

            {result ? (
              <div className="space-y-3 rounded-lg border border-green-100 bg-green-50/60 p-4 text-sm text-gray-700">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">回答</h3>
                  <p className="mt-2 whitespace-pre-wrap leading-relaxed">{result.answer}</p>
                </div>
                {result.citations.length ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-green-600">引用</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {result.citations.map((cite) => (
                        <li key={cite.id} className="rounded bg-white/80 p-2">
                          {cite.excerpt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card className="h-full border-green-200 bg-white/80 p-6 text-sm text-gray-600">
            <div className="flex items-center gap-3 text-green-600">
              <Shield className="h-5 w-5" />
              <span>数据防护</span>
            </div>
            <p className="mt-3 font-mono text-xs text-gray-700">POST /api/ai/query-document</p>
            <p className="mt-4 text-sm">
              SmartPicture 将提供加密存储、访问控制和会话历史导出，以满足合规需求。欢迎提交行业合规清单，帮助我们排期。
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                <Upload className="mr-2 h-4 w-4" />
                预约试用
              </Button>
              <Button variant="ghost" className="text-green-600 hover:bg-green-50">
                <Bot className="mr-2 h-4 w-4" />
                体验演示对话
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
