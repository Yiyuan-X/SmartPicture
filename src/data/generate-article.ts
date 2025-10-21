import { siteConfig } from "@/config/site";

export const GENERATE_COST = 50;
export const SHARE_REWARD = 10;

export const shareLabels: Record<string, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  wechat: "朋友圈",
};

export const generateArticleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/generate-article#service`,
  name: "SmartPicture 自动生文",
  description:
    "SmartPicture 自动生文引擎每日生成 SEO + AEO 双优化的文章，附带分享素材与积分激励，帮助品牌持续曝光。",
  provider: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  serviceType: "ContentCreation",
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/generate-article`,
    priceCurrency: "CNY",
    availability: "https://schema.org/InStock",
  },
  termsOfService: `${siteConfig.url}/terms`,
};
