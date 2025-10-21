"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { contentAssistantFeatures } from "@/data/content-assistant";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Loader2, MessageSquare, UploadCloud, Wand2 } from "lucide-react";

type AnalyzeResult = {
  description: string;
  tags: string[];
  objects: Array<{ label: string; confidence: number }>;
  colors: string[];
  promptSuggestions: string[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ContentAssistantClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("请上传图片文件。");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setSelectedFile(file);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const fileInputId = useMemo(() => `image-upload-${Date.now()}`, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile && !prompt.trim()) {
      setErrorMessage("请上传图片或输入提示词。");
      return;
    }

    try {
      setAnalyzeLoading(true);
      setErrorMessage(null);

      let imageBase64: string | undefined;
      if (selectedFile) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject(new Error("无法读取图片"));
          };
          reader.onerror = () => reject(reader.error ?? new Error("图片读取失败"));
          reader.readAsDataURL(selectedFile);
        });
        imageBase64 = dataUrl;
      }

      const response = await fetchWithAuth("/api/ai/analyze", {
        method: "POST",
        body: JSON.stringify({
          image: imageBase64,
          prompt: prompt.trim() || undefined,
          locale: "zh-CN",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error ?? "解析失败");
      }

      setAnalyzeResult({
        description: data.description,
        tags: data.tags ?? [],
        objects: data.objects ?? [],
        colors: data.colors ?? [],
        promptSuggestions: data.promptSuggestions ?? [],
      });

      const assistantIntro: ChatMessage = {
        role: "assistant",
        content: data.description ?? "解析完成。",
      };
      setMessages([assistantIntro]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "解析失败，请稍后再试。");
    } finally {
      setAnalyzeLoading(false);
    }
  }, [selectedFile, prompt]);

  const handleAsk = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const questionText = question.trim();
      if (!questionText) {
        setErrorMessage("请输入提问内容。");
        return;
      }

      const userMessage: ChatMessage = { role: "user", content: questionText };
      const nextMessages: ChatMessage[] = [...messages, userMessage];
      setMessages(nextMessages);
      setQuestion("");

      try {
        setChatLoading(true);
        setErrorMessage(null);

        const response = await fetchWithAuth("/api/ai/chat", {
          method: "POST",
          body: JSON.stringify({
            messages: nextMessages,
            locale: "zh-CN",
          }),
        });

        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.error ?? "对话失败");
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.reply ?? "已完成回答。",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "对话失败，请稍后再试。");
      } finally {
        setChatLoading(false);
      }
    },
    [messages, question]
  );

  const handleUploadClick = useCallback(() => {
    document.getElementById(fileInputId)?.click();
  }, [fileInputId]);

  return (
    <div className="space-y-16 bg-gradient-to-b from-blue-50 via-white to-amber-50 pb-24">
      <section className="border-b border-blue-100 bg-white/90">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr,0.9fr]">
          <div className="space-y-5">
            <Badge className="bg-blue-100 text-blue-700">内容助理</Badge>
            <h1 className="text-4xl font-bold text-gray-900">SmartPicture 内容助理</h1>
            <p className="text-lg text-gray-600">
              上传图片或描述提示词，SmartPicture 将自动解析品牌要素、生成营销文案，并提供多轮视觉问答，帮助团队更快推动转化。
            </p>
            <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
              {contentAssistantFeatures.map((feature) => (
                <div key={feature.title} className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 shadow-sm">
                  <p className="font-semibold text-blue-700">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-blue-200 bg-white/95 p-6">
            <div className="flex items-center gap-3 text-blue-600">
              <UploadCloud className="h-5 w-5" />
              <span className="font-medium">上传图片或描述提示词</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <p>支持 PNG、JPG、WebP 与含透明通道的素材，单张不超过 20MB。</p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleUploadClick} className="border-blue-200 text-blue-600">
                  选择图片
                </Button>
                <span className="text-xs text-gray-500">或直接拖拽到此处</span>
              </div>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-blue-50/50">
                  <Image
                    src={imagePreview}
                    alt="已上传图片"
                    width={480}
                    height={320}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/50 text-sm text-gray-500">
                  暂未选择图片
                </div>
              )}
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase text-blue-600">提示词</span>
                <Input
                  placeholder="例如：为即将上市的智能手环生成5条朋友圈文案"
                  value={prompt}
                  onChange={(event) => setPrompt(event.currentTarget.value)}
                />
              </label>
            </div>
            {errorMessage ? <p className="mt-3 text-sm text-red-500">{errorMessage}</p> : null}
            <Button onClick={handleAnalyze} disabled={analyzeLoading} className="mt-4 w-full">
              {analyzeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在解析图片…
                </>
              ) : (
                "开始解析"
              )}
            </Button>
          </Card>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr,0.9fr]">
          <Card className="flex flex-col border-blue-200 bg-white/90 p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-blue-700">
              <Wand2 className="h-5 w-5" />
              图像解析结果
            </h2>
            {analyzeResult ? (
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <p className="leading-relaxed">{analyzeResult.description}</p>
                {analyzeResult.tags.length ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-blue-600">关键词标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {analyzeResult.colors.length ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-blue-600">主色板</h3>
                    <div className="flex gap-2">
                      {analyzeResult.colors.map((color) => (
                        <div key={color} className="flex flex-col items-center gap-1 text-xs text-gray-600">
                          <span className="h-8 w-8 rounded-full border" style={{ backgroundColor: color }} />
                          {color}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {analyzeResult.promptSuggestions.length ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-blue-600">提示词建议</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {analyzeResult.promptSuggestions.map((suggestion) => (
                        <li key={suggestion}>· {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 flex flex-1 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/40 text-sm text-gray-500">
                上传图片并点击「开始解析」后，会在此处展示标签、物体与提示词建议。
              </div>
            )}
          </Card>

          <Card className="flex h-full flex-col border-blue-200 bg-white/85 p-6">
            <div className="flex items-center gap-2 text-blue-600">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">视觉问答</span>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-4">
              <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm text-gray-700">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-gray-500">先解析图片，再向 SmartPicture 询问投放策略、标题灵感等问题。</p>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={
                        message.role === "assistant"
                          ? "rounded-lg bg-white p-3 text-gray-700 shadow-sm"
                          : "rounded-lg bg-blue-500/80 p-3 text-white"
                      }
                    >
                      {message.content}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAsk} className="space-y-2">
                <Input
                  placeholder="例如：请给我 3 个适合转化的标题"
                  value={question}
                  onChange={(event) => setQuestion(event.currentTarget.value)}
                />
                <Button type="submit" className="w-full" disabled={chatLoading || messages.length === 0}>
                  {chatLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在生成回复…
                    </>
                  ) : (
                    "发送问题"
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <Card className="border-dashed border-blue-200 bg-white/70 p-6 text-sm text-gray-600">
          <div className="flex items-center gap-3 text-blue-600">
            <MessageSquare className="h-5 w-5" />
            <span>API 网关</span>
          </div>
          <p className="mt-3 font-mono text-xs text-gray-700">POST /api/ai/analyze</p>
          <p className="font-mono text-xs text-gray-700">POST /api/ai/chat</p>
          <p className="mt-4 text-sm">
            我们正把内容助理与 SmartPicture Points 积分打通，让营销团队在创意探索与绩效转化间自由切换。欢迎提交场景需求，帮助我们确定优先级。
          </p>
          <Button variant="outline" className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50">
            <Wand2 className="mr-2 h-4 w-4" />
            预约体验演示
          </Button>
        </Card>
      </div>
    </div>
  );
}
