import { siteConfig } from "@/config/site";

export const knowledgeBaseSteps = [
  {
    title: "安全上传与索引",
    description: "导入 PDF、PPT 与知识档案，文档全程在 Supabase 或 Firestore 中加密存储。",
  },
  {
    title: "会话式搜索",
    description: "基于 gemini-1.5-pro-001，员工可立即获得带引用的准确回答。",
  },
  {
    title: "共享记忆",
    description: "保留历史对话与推荐追问，帮助新人快速上手业务上下文。",
  },
] as const;

export const knowledgeBaseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${siteConfig.url}/knowledge-base#service`,
  name: "SmartPicture 知识库",
  description:
    "SmartPicture 知识库提供安全的文档上传、企业级检索与带引用的上下文问答，帮助团队快速构建私有知识助手。",
  provider: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  areaServed: ["CN", "US", "SG"],
  serviceOutput: [
    "加密存储的私有知识库",
    "带引用的上下文问答",
    "会话历史与追问推荐",
  ],
  offers: {
    "@type": "Offer",
    url: `${siteConfig.url}/knowledge-base`,
    priceCurrency: "CNY",
    availability: "https://schema.org/PreOrder",
  },
  termsOfService: `${siteConfig.url}/terms`,
};
