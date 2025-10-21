import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/metadata";
import { generateArticleJsonLd } from "@/data/generate-article";
import { GenerateArticleClient } from "./generate-article-client";

export const metadata = createMetadata({
  title: "AI 自动生文",
  description:
    "SmartPicture 自动生文流程结合行业数据、SEO/AEO 模板与积分激励，每天输出 5 篇可快速分发的品牌文章。",
  path: "/generate-article",
});

export default function GenerateArticlePage() {
  return (
    <>
      <JsonLd id="generate-article-json-ld" data={generateArticleJsonLd} />
      <GenerateArticleClient />
    </>
  );
}
