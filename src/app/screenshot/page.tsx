import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CloudUpload, Languages, Layout, Link2, Sparkles, Wand2 } from "lucide-react";

const captureModes = [
  "区域 / 窗口 / 全屏 / 滚动截图",
  "矢量标注（箭头、马赛克、文字）",
  "自动 OCR 识别（Google Vision API）",
  "Gemini AI 摘要与关键词抽取",
  "多语言翻译（Cloud Translation API）",
  "一键上传至 Google Drive 并生成分享链接",
];

const googleIntegrations = [
  {
    title: "Google Identity",
    description:
      "通过 Google OAuth 2.0 验证，授权使用 Drive / Vision / Translation / Gemini 等服务，权限可按需细分。",
  },
  {
    title: "Cloud Vision OCR",
    description:
      "对截图进行文字识别，支持多语言检测，返回结构化文本与语言置信度，用于后续摘要与翻译。",
  },
  {
    title: "Gemini AI 摘要",
    description:
      "将 OCR 文本提交至 Gemini-Pro 或 Gemini 2.0，生成摘要、关键词与 AEO 结构化提示，提升搜索可见度。",
  },
  {
    title: "Cloud Translation",
    description:
      "快速翻译截图中的要点，支持多语种输出，可直接嵌入分享链接或社交媒体描述中。",
  },
  {
    title: "Google Drive & Workspace",
    description:
      "上传原图与标注版本至 Drive，生成 anyoneWithLink 访问链接，也可自动嵌入 Google Docs/Slides。",
  },
  {
    title: "Google Analytics 4",
    description:
      "通过 GA4 API 记录 capture、OCR、share 等事件，跟踪功能使用情况，优化用户留存。",
  },
];

const shortcuts = [
  { combo: "Ctrl + Alt + S", action: "打开截图工具" },
  { combo: "Ctrl + Shift + 1", action: "区域截图" },
  { combo: "Ctrl + Shift + 2", action: "窗口截图" },
  { combo: "Ctrl + Shift + 3", action: "全屏截图" },
  { combo: "Ctrl + Shift + 4", action: "滚动截图" },
];

export default function ScreenshotToolPage() {
  return (
    <div className="space-y-16 bg-gradient-to-b from-slate-50 via-white to-amber-50 pb-20">
      <section className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-slate-100 text-slate-700">截图与标注</Badge>
              <Badge className="bg-emerald-100 text-emerald-700">Google 增强版</Badge>
            </div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900">
              截图、标注、OCR、翻译、云端分享，一站式完成
            </h1>
            <p className="text-lg text-slate-600">
              SmartPix 截图与标注模块集成 Google Drive、Vision、Gemini 与 Translation API，帮助团队快速截屏、获取文本与摘要、生成多语言内容，并自动存档到 Google Drive。
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              {captureModes.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild>
                <Link href="/api/auth/google">使用 Google 账号体验</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Link href="#google-stack">查看技术栈</Link>
              </Button>
            </div>
          </div>

          <Card className="border-slate-200 bg-white/90 p-6 shadow-lg">
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  AI 增强工作流
                </h2>
                <p className="mt-2 text-slate-600">
                  ① 浏览器使用 <span className="font-semibold text-slate-800">getDisplayMedia</span> 捕获屏幕 →{" "}
                  ② Canvas 进行标注与图层管理 → ③ 上传到 Google Drive → ④ Vision API OCR → ⑤ Gemini 摘要 →
                  ⑥ Translation API 生成多语言描述。
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/70 p-4 text-emerald-700">
                <p className="text-sm font-semibold">提示</p>
                <p className="mt-1 text-xs">
                  实际部署时需配置 Google Cloud 项目（smartpix-ai-tools），并在环境变量中提供客户端 ID、Drive/Vertex/Vision API
                  凭据。此演示页展示 UI 与集成策略，便于在生产环境快速对接。
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section id="google-stack" className="mx-auto max-w-6xl space-y-10 px-4">
        <div className="space-y-3 text-center">
          <Badge className="bg-slate-100 text-slate-700">Google Cloud Stack</Badge>
          <h2 className="text-3xl font-semibold text-slate-900">全套 Google 服务驱动的截图解决方案</h2>
          <p className="text-slate-600">
            从账号登录、存储、识别、翻译到分享，全部采用 Google 官方 API，可在合规与安全要求下交付企业级体验。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {googleIntegrations.map((item) => (
            <Card key={item.title} className="h-full border-slate-200 bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="border-slate-200 bg-white/95 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">界面规划</h2>
              <p className="text-sm text-slate-600">极简工具栏 + 画布区域 + OCR 抽屉，支持深浅色自动切换。</p>
            </div>
          </div>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>
              工具栏提供截图模式切换、标注工具、撤销/重做、上传与分享按钮。OCR 抽屉展示识别文字、AI 摘要与翻译结果，可一键复制或导出为 Google Docs。
            </p>
            <ul className="space-y-2">
              {shortcuts.map((shortcut) => (
                <li
                  key={shortcut.combo}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs"
                >
                  <span className="font-medium text-slate-700">{shortcut.combo}</span>
                  <span className="text-slate-500">{shortcut.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-emerald-200 bg-white/95 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CloudUpload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">上传与分享流程</h3>
                <p className="text-xs text-slate-500">/api/screenshot/upload · Drive API</p>
              </div>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. 前端获取用户 OAuth token，并获取截图二进制数据。</li>
              <li>2. 通过服务端 Next.js Route 调用 Drive multipart 接口上传。</li>
              <li>3. 储存 fileId、分享链接等信息到数据库（screenshots 表）。</li>
              <li>4. 返回文件名、URL、权限状态给前端。</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              asChild
            >
              <Link href="/api/screenshot/share">生成分享链接 API 说明</Link>
            </Button>
          </Card>

          <Card className="border-indigo-200 bg-white/95 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">AI 摘要与翻译</h3>
                <p className="text-xs text-slate-500">/api/screenshot/summarize · /api/screenshot/translate</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              将 Vision OCR 的文本传入 Gemini，生成摘要（≤ 280 字）与 5 个关键词，再通过 Translation API 输出 EN / JA /
              TH 等目标语言，自动写入页面描述，提高 SEO 与 AEO 表现。
            </p>
            <div className="mt-4 grid gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-700">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                结果示例
              </div>
              <p>摘要：本次截图展示了竞品方案的漏斗数据，核心差距集中在激活阶段……</p>
              <p>关键词：#激活留存 #漏斗分析 #竞品对比 #增长回顾 #会议纪要</p>
              <p>翻译：The screenshot highlights the activation gap in the growth funnel…</p>
            </div>
          </Card>

          <Card className="border-slate-200 bg-white/95 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">AEO + 数据追踪</h3>
                <p className="text-xs text-slate-500">Gemini Metadata · GA4 Measurement Protocol</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              生成的摘要自动写入页面 Meta Description 与 OpenGraph 描述；同时间隔向 GA4 上报 screenshot.capture、
              screenshot.ocr、screenshot.share 等事件，以便分析团队监控漏斗。
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4">
        <Card className="border-slate-200 bg-white/95 p-8 shadow-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-900">接入指南</h2>
              <p className="text-sm text-slate-600">
                在生产环境中，请在 Google Cloud Console 中启用 Drive、Vision、Translation、Vertex AI
                API，并配置 OAuth 2.0 客户端。服务端 Next.js Route 使用 Application Default Credentials 或 Service Account
                Impersonation。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">
                  打开 Google Cloud Console
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                asChild
              >
                <Link href="/generate-article">继续体验 SmartPicture 其他能力</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-700"
                asChild
              >
                <Link href="/insights">浏览智能洞察</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
