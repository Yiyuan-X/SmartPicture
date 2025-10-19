"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Loader2, Mic, Waves } from "lucide-react";

const workflow = [
  {
    title: "上传长篇音视频",
    description: "导入访谈、直播或播客的文字稿，系统立即启动摘要分析。",
  },
  {
    title: "生成摘要与亮点片段",
    description: "Gemini 自动产出概述、亮点和行动清单，适配多渠道。",
  },
  {
    title: "语音工作室",
    description: "将脚本转换为高品质配音，并支持多种音色。",
  },
];

type SummaryResult = {
  summary: string;
  highlights: string[];
  actionItems: string[];
  quotes: string[];
};

export default function MultimediaHubPage() {
  const [transcript, setTranscript] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [speechText, setSpeechText] = useState("");
  const [voice, setVoice] = useState<"standard" | "warm" | "bright">("standard");
  const [speechLoading, setSpeechLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const handleSummarize = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!transcript.trim()) {
        setSummaryError("请先粘贴或输入文字稿内容。");
        return;
      }

      try {
        setSummaryLoading(true);
        setSummaryError(null);

        const response = await fetchWithAuth("/api/ai/summarize", {
          method: "POST",
          body: JSON.stringify({ transcript }),
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error ?? "生成摘要失败");
        }

        setSummaryResult({
          summary: data.summary ?? "",
          highlights: data.highlights ?? [],
          actionItems: data.actionItems ?? [],
          quotes: data.quotes ?? [],
        });
        setSpeechText(data.summary ?? "");
      } catch (error) {
        setSummaryError(error instanceof Error ? error.message : "生成摘要失败，请稍后再试。");
      } finally {
        setSummaryLoading(false);
      }
    },
    [transcript]
  );

  const handleSpeak = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!speechText.trim()) {
        setSpeechError("请输入需要合成语音的文本。");
        return;
      }

      try {
        setSpeechLoading(true);
        setSpeechError(null);
        setAudioUrl(null);

        const response = await fetchWithAuth("/api/ai/speak", {
          method: "POST",
          body: JSON.stringify({ text: speechText, voice }),
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error ?? "语音合成失败");
        }

        setAudioUrl(data.audio?.dataUrl ?? null);
      } catch (error) {
        setSpeechError(error instanceof Error ? error.message : "语音合成失败，请稍后再试。");
      } finally {
        setSpeechLoading(false);
      }
    },
    [speechText, voice]
  );

  return (
    <div className="bg-gradient-to-b from-purple-50 via-white to-orange-50 py-20">
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <section className="space-y-6">
          <Badge className="bg-purple-100 text-purple-700">多媒体枢纽</Badge>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="md:w-2/3 space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">把数小时音视频压缩成即时洞察。</h1>
              <p className="text-lg text-gray-700">
                将长视频、采访或会议记录交给 SmartPicture，立即获得摘要、行动项与高光金句，再配上自然语音播报。
              </p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:from-purple-600 hover:to-orange-600">
              注册候补名单
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {workflow.map((step) => (
            <Card key={step.title} className="h-full border-purple-200 bg-white/85 p-5">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{step.description}</p>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card className="space-y-5 border-purple-200 bg-white/85 p-6">
            <div className="flex items-center gap-3 text-purple-600">
              <Waves className="h-5 w-5" />
              <span className="font-medium">音视频文字稿</span>
            </div>

            <form onSubmit={handleSummarize} className="space-y-4">
              <Textarea
                rows={10}
                value={transcript}
                onChange={(event) => setTranscript(event.currentTarget.value)}
                placeholder="粘贴完整的会议记录、访谈稿或视频转写内容"
              />

              {summaryError ? <p className="text-sm text-red-500">{summaryError}</p> : null}

              <Button type="submit" disabled={summaryLoading} className="w-full">
                {summaryLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在提炼要点…
                  </>
                ) : (
                  "生成摘要"
                )}
              </Button>
            </form>

            {summaryResult ? (
              <div className="space-y-4 rounded-lg border border-purple-100 bg-purple-50/60 p-4 text-sm text-gray-700">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">核心摘要</h3>
                  <p className="mt-2 leading-relaxed">{summaryResult.summary}</p>
                </div>
                {summaryResult.highlights.length ? (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-purple-600">亮点 Highlights</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {summaryResult.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {summaryResult.actionItems.length ? (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-purple-600">行动要点 Action Items</h4>
                    <ul className="list-disc space-y-1 pl-5">
                      {summaryResult.actionItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {summaryResult.quotes.length ? (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase text-purple-600">金句 Quotes</h4>
                    <ul className="space-y-1">
                      {summaryResult.quotes.map((quote) => (
                        <li key={quote} className="rounded-lg bg-white/80 p-2 italic text-purple-700">
                          “{quote}”
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card className="flex h-full flex-col border-purple-200 bg-white/85 p-6">
            <div className="flex items-center gap-3 text-purple-600">
              <Mic className="h-5 w-5" />
              <span className="font-medium">语音工作室</span>
            </div>

            <form onSubmit={handleSpeak} className="mt-4 flex flex-1 flex-col gap-4">
              <Textarea
                rows={6}
                value={speechText}
                onChange={(event) => setSpeechText(event.currentTarget.value)}
                placeholder="将摘要或自定义脚本转换为语音播报"
              />

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600">音色</label>
                <select
                  className="flex-1 rounded-md border border-purple-200 bg-white px-3 py-2 text-sm"
                  value={voice}
                  onChange={(event) => setVoice(event.currentTarget.value as typeof voice)}
                >
                  <option value="standard">标准女声</option>
                  <option value="warm">温暖磁性</option>
                  <option value="bright">青春活力</option>
                </select>
              </div>

              {speechError ? <p className="text-sm text-red-500">{speechError}</p> : null}

              <Button type="submit" disabled={speechLoading} className="w-full">
                {speechLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成语音…
                  </>
                ) : (
                  "合成语音"
                )}
              </Button>

              {audioUrl ? (
                <audio controls src={audioUrl} className="w-full" />
              ) : null}
            </form>
          </Card>
        </div>

        <Card className="border-dashed border-purple-200 bg-white/75 p-6 text-sm text-gray-600">
          <div className="flex items-center gap-3 text-purple-600">
            <Waves className="h-5 w-5" />
            <span>模型链路</span>
          </div>
          <p className="mt-3 font-mono text-xs text-gray-700">speech-to-text ➝ gemini-1.5-flash-001 ➝ text-to-speech</p>
          <p className="font-mono text-xs text-gray-700">POST /api/ai/summarize</p>
          <p className="font-mono text-xs text-gray-700">POST /api/ai/speak</p>
          <p className="mt-4 text-sm">
            我们正在与上游媒体平台对接，确保发布者可以一键同步剪辑与语音。提交使用场景，帮助我们规划优先级。
          </p>
          <Button variant="outline" className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50">
            <Mic className="mr-2 h-4 w-4" />
            提交使用场景
          </Button>
        </Card>
      </div>
    </div>
  );
}
