import type { Metadata } from "next";

const fallbackUrl = "https://smartpicture.app";
const resolvedUrl = (() => {
  const input = process.env.NEXT_PUBLIC_APP_URL ?? fallbackUrl;
  try {
    return new URL(input).toString();
  } catch {
    return fallbackUrl;
  }
})();

export type SiteNavigationItem = {
  label: string;
  href: string;
  description?: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  description: string;
  locale: string;
  url: string;
  contactEmail: string;
  keywords: string[];
  defaultOgImage: string;
  navigation: SiteNavigationItem[];
  socialProfiles: Array<{ name: string; url: string }>;
  organization: {
    legalName: string;
    url: string;
    logo: string;
    sameAs: string[];
  };
};

export const siteConfig: SiteConfig = {
  name: "SmartPicture",
  shortName: "SmartPicture",
  description:
    "SmartPicture 让品牌团队一站式完成 AI 图片生成、图像洞察、SEO/AEO 内容与积分增长活动，打造高转化的视觉体验。",
  locale: "zh-CN",
  url: resolvedUrl,
  contactEmail: "hello@smartpicture.app",
  keywords: [
    "AI 图片生成",
    "智能抠图",
    "图像识别",
    "营销自动化",
    "SEO",
    "AEO",
    "品牌增长",
    "多媒体内容",
    "视觉智能",
  ],
  defaultOgImage: "/output/6e67fc62-f805-4339-85d2-c31c6874175c.png",
  navigation: [
    { label: "首页", href: "/" },
    { label: "创意工作室", href: "/creative-suite" },
    { label: "内容助理", href: "/content-assistant" },
    { label: "多媒体枢纽", href: "/multimedia-hub" },
    { label: "知识库", href: "/knowledge-base" },
    { label: "智能洞察", href: "/insights" },
    { label: "截图与标注", href: "/screenshot" },
  ],
  socialProfiles: [
    { name: "LinkedIn", url: "https://www.linkedin.com/company/smartpicture" },
    { name: "X", url: "https://x.com/smartpicture" },
    { name: "YouTube", url: "https://www.youtube.com/@smartpicture" },
  ],
  organization: {
    legalName: "SmartPicture Labs",
    url: resolvedUrl,
    logo: "/output/6e67fc62-f805-4339-85d2-c31c6874175c.png",
    sameAs: [
      "https://www.linkedin.com/company/smartpicture",
      "https://x.com/smartpicture",
      "https://www.youtube.com/@smartpicture",
    ],
  },
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "SmartPicture - AI 视觉中枢与智能内容增长平台",
    template: "%s | SmartPicture",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    title: "SmartPicture - AI 视觉中枢与智能内容增长平台",
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: "SmartPicture - AI 视觉中枢与智能内容增长平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartPicture - AI 视觉中枢与智能内容增长平台",
    description: siteConfig.description,
    images: [siteConfig.defaultOgImage],
  },
  alternates: {
    canonical: siteConfig.url,
  },
};
