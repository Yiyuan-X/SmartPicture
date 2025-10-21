import { siteConfig } from "@/config/site";

export const screenshotCaptureModes = [
  "区域 / 窗口 / 全屏 / 滚动截图",
  "矢量标注（箭头、马赛克、文字）",
  "自动 OCR 识别（Google Vision API）",
  "Gemini AI 摘要与关键词抽取",
  "多语言翻译（Cloud Translation API）",
  "一键上传至 Google Drive 并生成分享链接",
] as const;

export const screenshotGoogleIntegrations = [
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
] as const;

export const screenshotShortcuts = [
  { combo: "Ctrl + Alt + S", action: "打开截图工具" },
  { combo: "Ctrl + Shift + 1", action: "区域截图" },
  { combo: "Ctrl + Shift + 2", action: "窗口截图" },
  { combo: "Ctrl + Shift + 3", action: "全屏截图" },
  { combo: "Ctrl + Shift + 4", action: "滚动截图" },
] as const;

export const screenshotJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteConfig.url}/screenshot#software`,
  name: "SmartPix Screenshot",
  operatingSystem: "Windows, macOS, ChromeOS",
  applicationCategory: "MultimediaApplication",
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/screenshot`,
    price: "0",
    priceCurrency: "CNY",
  },
  featureList: [
    "区域/窗口/滚动截图",
    "矢量标注与马赛克",
    "Google Vision OCR",
    "Gemini AI 摘要与关键词",
    "多语言翻译",
    "Drive 云端分享链接",
  ],
};
