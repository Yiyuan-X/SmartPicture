import { siteConfig } from "@/config/site";

export const creativeSuiteProofPoints = [
  "90 秒内输出可投放的商业素材。",
  "角色、光线与构图在多轮生成中保持一致。",
  "预设与灵感画廊可一键共享给团队与客户。",
] as const;

export const creativeSuiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/creative-suite#service`,
  name: "SmartPicture 创意工作室",
  description:
    "SmartPicture 创意工作室提供商业级 AI 图片生成、灵感画廊与风格预设，帮助品牌团队快速输出统一调性的视觉资产。",
  provider: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/creative-suite`,
    priceCurrency: "CNY",
    availability: "https://schema.org/InStock",
  },
  areaServed: ["CN", "US", "SG"],
  serviceOutput: [
    "AI 图片生成项目",
    "风格预设管理",
    "灵感画廊分享链接",
  ],
};
