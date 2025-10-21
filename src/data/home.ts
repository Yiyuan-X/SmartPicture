import { siteConfig } from "@/config/site";
import type { IconName } from "@/lib/icon-registry";

export type HomeModule = {
  id: string;
  name: string;
  promise: string;
  description: string;
  href: string;
  features: string[];
  icon: IconName;
};

export type HomeAiEndpoint = {
  endpoint: string;
  description: string;
  icon: IconName;
  status: "已上线" | "开发中" | "规划中";
};

export type HomeStat = {
  label: string;
  value: string;
};

const modules: HomeModule[] = [
  {
    id: "creative_suite",
    name: "创意工作室",
    promise: "灵感一写即显。",
    description:
      "一句提示词即可生成符合品牌调性的商业级视觉，同时保留角色形象的一致性。",
    href: "/creative-suite",
    features: ["AI 图像生成", "灵感画廊", "风格预设"],
    icon: "sparkles",
  },
  {
    id: "content_assistant",
    name: "内容助理",
    promise: "让每一张图都有故事。",
    description:
      "对图片进行深度解析，自动产出文案、关键词与多渠道素材，赋能营销、电商与编辑团队。",
    href: "/content-assistant",
    features: ["图像分析", "视觉问答", "渠道化文案"],
    icon: "message-square",
  },
  {
    id: "multimedia_hub",
    name: "多媒体枢纽",
    promise: "把长视频长音频压缩成行动指南。",
    description:
      "上传长篇音视频，一次流程即可获得摘要、精彩片段与高音质配音。",
    href: "/multimedia-hub",
    features: ["音视频摘要", "语音工作室", "可分享亮点"],
    icon: "video",
  },
  {
    id: "knowledge_base",
    name: "知识库",
    promise: "安心对话您的文档。",
    description:
      "上传 PDF 与知识文件，获得带引用的精准回答，并具备企业级检索能力。",
    href: "/knowledge-base",
    features: ["文档上传", "会话式搜索", "安全历史记录"],
    icon: "book-open",
  },
  {
    id: "insight_lab",
    name: "智能洞察",
    promise: "每天 5 篇 Insight，AEO 领先布局。",
    description:
      "自动生成并排版 SEO + AEO 优化文章，附带跨平台分享素材与积分激励，打造真实可信的品牌内容中枢。",
    href: "/insights",
    features: ["每日 5 篇自动生文", "SEO/AEO 模板", "积分传播闭环"],
    icon: "globe-2",
  },
  {
    id: "screenshot_tool",
    name: "截图与标注",
    promise: "一体化截图、标注、OCR 与分享。",
    description:
      "SmartPix 截图工具支持区域、窗口、滚动截图，并可即时标注、OCR 识别与生成可分享链接，打造 SEO 可见的图片内容。",
    href: "/screenshot",
    features: ["多模式截图", "轻量标注", "OCR 识别", "一键分享"],
    icon: "camera",
  },
];

const aiEndpoints: HomeAiEndpoint[] = [
  {
    endpoint: "/api/ai/generate",
    description: "imagegeneration@006",
    icon: "camera",
    status: "已上线",
  },
  {
    endpoint: "/api/ai/analyze",
    description: "gemini-1.5-flash-001 图像解析",
    icon: "layers",
    status: "开发中",
  },
  {
    endpoint: "/api/ai/chat",
    description: "gemini-1.5-flash-001 视觉问答",
    icon: "bot",
    status: "开发中",
  },
  {
    endpoint: "/api/ai/summarize",
    description: "语音转写 → gemini-1.5-flash-001",
    icon: "video",
    status: "开发中",
  },
  {
    endpoint: "/api/ai/speak",
    description: "文本转语音工作室",
    icon: "laptop",
    status: "规划中",
  },
  {
    endpoint: "/api/ai/query-document",
    description: "gemini-1.5-pro-001 安全检索",
    icon: "book-open",
    status: "规划中",
  },
];

const stats: HomeStat[] = [
  { label: "平均达成价值时间", value: "2 分 17 秒" },
  { label: "Beta 期间客户推荐指数", value: "64" },
  { label: "交付创意素材总量", value: "36,000+" },
];

export function getHomeModules(): HomeModule[] {
  return modules;
}

export function getHomeAiEndpoints(): HomeAiEndpoint[] {
  return aiEndpoints;
}

export function getHomeStats(): HomeStat[] {
  return stats;
}

export const heroTestimonial =
  "「我们希望把创意活动从一周上线缩短到一天完成。」— SmartPicture 体验客户";

export const homePageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: siteConfig.locale,
      publisher: {
        "@type": "Organization",
        name: siteConfig.organization.legalName,
        url: siteConfig.organization.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}${siteConfig.organization.logo}`,
        },
        sameAs: siteConfig.organization.sameAs,
      },
    },
    {
      "@type": "ItemList",
      "@id": `${siteConfig.url}#product-modules`,
      itemListElement: modules.map((module, index) => ({
        "@type": "Product",
        position: index + 1,
        name: module.name,
        description: module.description,
        url: `${siteConfig.url}${module.href}`,
        offers: {
          "@type": "Offer",
          url: `${siteConfig.url}${module.href}`,
          priceCurrency: "CNY",
          availability: "https://schema.org/PreOrder",
        },
      })),
    },
    {
      "@type": "Service",
      "@id": `${siteConfig.url}#ai-gateway`,
      name: "SmartPicture AI 网关",
      provider: {
        "@type": "Organization",
        name: siteConfig.organization.legalName,
      },
      serviceType: "AI 图像生成与内容智能",
      areaServed: ["CN", "US", "SG"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "SmartPicture 模块",
        itemListElement: modules.map((module) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: module.name,
            description: module.description,
          },
        })),
      },
    },
  ],
};
