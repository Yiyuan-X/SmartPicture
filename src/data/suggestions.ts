import { siteConfig } from "@/config/site";

export const suggestionCategories = [
  { value: "feature", label: "新功能建议" },
  { value: "ui", label: "界面/体验" },
  { value: "bug", label: "Bug 反馈" },
  { value: "other", label: "其它想法" },
] as const;

export const suggestionExamples = [
  {
    id: "SUG-001",
    title: "希望支持团队协作看板",
    category: "新功能建议",
    description:
      "允许创建共享的任务看板，让成员实时追踪创意任务的状态，并能直接在卡片里调用图像生成。",
    votes: 186,
  },
  {
    id: "SUG-002",
    title: "多媒体枢纽导出语音时附带文本",
    category: "界面/体验",
    description:
      "导出语音文件时，同时生成对应的 SRT 字幕与 Markdown 文稿，方便二次编辑。",
    votes: 124,
  },
  {
    id: "SUG-003",
    title: "灵感画廊增加行业模板",
    category: "新功能建议",
    description:
      "在灵感画廊中新增行业筛选，比如电商、教育、地产等，快速找到更贴合场景的提示词。",
    votes: 102,
  },
] as const;

export const suggestionsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWorkSeries",
  "@id": `${siteConfig.url}/suggestions#community`,
  name: "SmartPicture 愿望池",
  description:
    "SmartPicture 愿望池收集用户的功能建议、体验反馈与灵感创意，并通过积分系统激励社区共建。",
  creator: {
    "@type": "Organization",
    name: siteConfig.organization.legalName,
    url: siteConfig.organization.url,
  },
  about: suggestionExamples.map((item) => ({
    "@type": "CreativeWork",
    name: item.title,
    abstract: item.description,
  })),
};
