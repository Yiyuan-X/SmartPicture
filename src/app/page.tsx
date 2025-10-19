import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  Camera,
  Laptop,
  Layers,
  MessageSquare,
  Sparkles,
  Video,
  BookOpen,
  ShieldCheck,
  Globe2,
} from "lucide-react";

const modules = [
  {
    id: "creative_suite",
    name: "创意工作室",
    promise: "灵感一写即显。",
    description:
      "一句提示词即可生成符合品牌调性的商业级视觉，同时保留角色形象的一致性。",
    href: "/creative-suite",
    features: ["AI 图像生成", "灵感画廊", "风格预设"],
    icon: Sparkles,
  },
  {
    id: "content_assistant",
    name: "内容助理",
    promise: "让每一张图都有故事。",
    description:
      "对图片进行深度解析，自动产出文案、关键词与多渠道素材，赋能营销、电商与编辑团队。",
    href: "/content-assistant",
    features: ["图像分析", "视觉问答", "渠道化文案"],
    icon: MessageSquare,
  },
  {
    id: "multimedia_hub",
    name: "多媒体枢纽",
    promise: "把长视频长音频压缩成行动指南。",
    description:
      "上传长篇音视频，一次流程即可获得摘要、精彩片段与高音质配音。",
    href: "/multimedia-hub",
    features: ["音视频摘要", "语音工作室", "可分享亮点"],
    icon: Video,
  },
  {
    id: "knowledge_base",
    name: "知识库",
    promise: "安心对话您的文档。",
    description:
      "上传 PDF 与知识文件，获得带引用的精准回答，并具备企业级检索能力。",
    href: "/knowledge-base",
    features: ["文档上传", "会话式搜索", "安全历史记录"],
    icon: BookOpen,
  },
];

const aiEndpoints = [
  {
    endpoint: "/api/ai/generate",
    description: "imagegeneration@006",
    icon: Camera,
    status: "已上线",
  },
  {
    endpoint: "/api/ai/analyze",
    description: "gemini-1.5-flash-001 图像解析",
    icon: Layers,
    status: "开发中",
  },
  {
    endpoint: "/api/ai/chat",
    description: "gemini-1.5-flash-001 视觉问答",
    icon: Bot,
    status: "开发中",
  },
  {
    endpoint: "/api/ai/summarize",
    description: "语音转写 → gemini-1.5-flash-001",
    icon: Video,
    status: "开发中",
  },
  {
    endpoint: "/api/ai/speak",
    description: "文本转语音工作室",
    icon: Laptop,
    status: "规划中",
  },
  {
    endpoint: "/api/ai/query-document",
    description: "gemini-1.5-pro-001 安全检索",
    icon: BookOpen,
    status: "规划中",
  },
];

const stats = [
  { label: "平均达成价值时间", value: "2 分 17 秒" },
  { label: "Beta 期间客户推荐指数", value: "64" },
  { label: "交付创意素材总量", value: "36,000+" },
];

export default function Home() {
  return (
    <div className="space-y-20 bg-gradient-to-b from-yellow-50 via-white to-orange-50 pb-24">
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 md:flex-row md:items-center">
          <div className="space-y-6 md:w-1/2">
            <Badge className="bg-orange-100 text-orange-700">vision-core 产品路线</Badge>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              SmartPicture：面向客户成果的轻量 AI 中枢。
            </h1>
            <p className="text-lg text-gray-700">
              构建贴合业务目标的增长漏斗——一站式完成品牌视觉生成、图像洞察与长内容激活，所有模块共用统一的 AI 网关与用户画像。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
              >
                <Link href="/creative-suite" className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  立即体验创意工作室
                </Link>
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50" asChild>
                <Link href="#modules" className="inline-flex items-center gap-2">
                  查看产品矩阵
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Card className="border-orange-200 bg-white/80 p-6 shadow-lg md:w-1/2">
            <div className="flex flex-wrap justify-between gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-[150px] flex-1">
                  <h3 className="text-3xl font-semibold text-orange-500">{stat.value}</h3>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm text-gray-600">
              「我们希望把创意活动从一周上线缩短到一天完成。」— SmartPicture 体验客户
            </div>
          </Card>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="space-y-3 text-center">
          <Badge className="bg-orange-100 text-orange-700">功能模块</Badge>
          <h2 className="text-3xl font-semibold text-gray-900">轻量核心，可插拔创意扩展</h2>
          <p className="text-gray-600">
            选择最能帮助客户达成下一阶段目标的模块。所有体验共用认证、积分与增长系统，统一计费与留存体验。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className="flex h-full flex-col justify-between border-orange-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 shadow-inner">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orange-500">{module.id}</p>
                      <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600">{module.promise}</p>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                >
                  <Link href={module.href} className="inline-flex items-center justify-center gap-2">
                    查看模块详情
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <Card className="border-orange-200 bg-white/85 p-6 shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-orange-100 text-orange-700">AI 网关</Badge>
              <h2 className="text-2xl font-semibold text-gray-900">一个入口，覆盖全部创意流程</h2>
              <p className="text-sm text-gray-600">
                通过统一网关调用模型，随时按需重新验证缓存，并与 SmartPicture Points 积分系统联动计量消耗。
              </p>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                企业就绪
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-orange-500" />
                多语言元数据
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiEndpoints.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.endpoint}
                  className="rounded-lg border border-dashed border-orange-200 bg-orange-50/60 p-4 transition hover:border-orange-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-gray-800">{item.endpoint}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === "已上线"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-orange-500 shadow-inner">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.description}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
