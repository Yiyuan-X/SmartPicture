import { siteConfig } from "@/config/site";

export const contentAssistantFeatures = [
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
] as const;

export const contentAssistantJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteConfig.url}/content-assistant#software`,
  name: "SmartPicture 内容助理",
  description:
    "SmartPicture 内容助理支持图像解析、视觉问答与渠道化文案生成，帮助营销团队快速产出多渠道素材。",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/content-assistant`,
    price: "0",
    priceCurrency: "CNY",
  },
  creator: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  featureList: contentAssistantFeatures.map((feature) => feature.title),
};
