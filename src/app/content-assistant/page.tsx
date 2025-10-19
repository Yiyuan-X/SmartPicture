"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2, MessageSquare, UploadCloud, Wand2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth-fetch";

const features = [
  {
    title: "图像拆解",
    description: "基于 Cloud Vision 与 Gemini 模型，秒级识别标签、物体与品牌安全风险。",
  },
  {
    title: "视觉问答",
    description: "用自然语言询问图片内容，获得具备上下文的精准回答。",
  },
  {
    title: "渠道化文案",
    description: "自动生成适配 SEO、广告与社媒的多语种文案，保持品牌语调一致。",
  },
];

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

export default function ContentAssistantPage() {
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
          content: data.reply?.content ?? "",
        };
        setMessages([...nextMessages, assistantMessage]);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "对话请求失败，请稍后再试。");
        setMessages((prev) => prev.filter((msg) => msg !== userMessage));
      } finally {
        setChatLoading(false);
      }
    },
    [messages, question]
  );

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-orange-50 py-20">
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <section className="space-y-6">
          <Badge className="bg-blue-100 text-blue-700">内容助理</Badge>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="md:w-2/3 space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">让每张图片都能开口讲故事。</h1>
              <p className="text-lg text-gray-700">
                SmartPicture 内容助理结合 Cloud Vision 与 Gemini，自动理解图片并生成营销故事线。
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600">
              即将上线，加入候补名单
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full border-blue-200 bg-white/80 p-5">
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-5 border-blue-200 bg-white/85 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">上传图片并解析</h2>
                <p className="text-sm text-gray-500">需要登录账号后才能调用 SmartPicture 内容助理。</p>
              </div>
              <label
                htmlFor={fileInputId}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-blue-200 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
              >
                <UploadCloud className="h-4 w-4" /> 上传图片
              </label>
              <input id={fileInputId} type="file" accept="image/*" hidden onChange={handleFileChange} />
            </div>

            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="已选择的图片"
                width={512}
                height={512}
                className="w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-200 text-blue-500">
                <UploadCloud className="h-8 w-8" />
                <p className="text-sm">点击右上角按钮上传图片</p>
              </div>
            )}

            <Input
              placeholder="补充说明或针对图片的诉求，例如“为这张图片生成适合小红书投放的标题”"
              value={prompt}
              onChange={(event) => setPrompt(event.currentTarget.value)}
            />

            {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}

            <Button onClick={handleAnalyze} disabled={analyzeLoading} className="w-full">
              {analyzeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在解析图片…
                </>
              ) : (
                "开始解析"
              )}
            </Button>

            {analyzeResult ? (
              <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-gray-700">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">解析概述</h3>
                  <p className="mt-2 leading-relaxed">{analyzeResult.description}</p>
                </div>
                {analyzeResult.tags.length ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-blue-600">关键词标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-blue-700 shadow-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {analyzeResult.colors.length ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-blue-600">主色板</h4>
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
                    <h4 className="text-xs font-semibold uppercase text-blue-600">提示词建议</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {analyzeResult.promptSuggestions.map((suggestion) => (
                        <li key={suggestion}>· {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
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
