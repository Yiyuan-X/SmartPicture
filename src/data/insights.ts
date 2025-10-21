import { siteConfig } from "@/config/site";
import type { InsightArticle } from "@/lib/insights-store";

export const insightsJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${siteConfig.url}/insights#blog`,
  name: "SmartPicture Insight Lab",
  description:
    "SmartPicture Insight Lab 每日自动生成 5 篇围绕品牌增长的 SEO + AEO 优化文章，并附带平台化分享素材与积分激励。",
  inLanguage: "zh-CN",
  publisher: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}${siteConfig.organization.logo}`,
    },
  },
};

export function buildInsightArticleJsonLd(article: InsightArticle) {
  const url = `${siteConfig.url}/insights/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.summary || article.seoDescription,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    url,
    author: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization.legalName,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}${siteConfig.organization.logo}`,
      },
    },
    keywords: article.keywords,
  };
}
