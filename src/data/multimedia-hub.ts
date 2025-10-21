import { siteConfig } from "@/config/site";

export const multimediaWorkflow = [
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
] as const;

export const multimediaSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/multimedia-hub#service`,
  name: "SmartPicture 多媒体枢纽",
  description:
    "SmartPicture 多媒体枢纽为长音视频内容提供摘要、亮点、行动项与高品质语音合成，帮助团队快速分发多模态素材。",
  provider: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  serviceType: "AudioVideoProcessing",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "多媒体工作流",
    itemListElement: multimediaWorkflow.map((item, index) => ({
      "@type": "Offer",
      position: index + 1,
      itemOffered: {
        "@type": "Service",
        name: item.title,
        description: item.description,
      },
    })),
  },
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/multimedia-hub`,
    priceCurrency: "CNY",
    availability: "https://schema.org/PreOrder",
  },
};
