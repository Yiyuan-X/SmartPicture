import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/metadata";
import { knowledgeBaseJsonLd } from "@/data/knowledge-base";
import { KnowledgeBaseClient } from "./knowledge-base-client";

export const metadata = createMetadata({
  title: "知识库",
  description:
    "SmartPicture 知识库支持安全上传、企业级检索与带引用的问答体验，让团队安心对话自己的文档资产。",
  path: "/knowledge-base",
});

export default function KnowledgeBasePage() {
  return (
    <>
      <JsonLd id="knowledge-base-json-ld" data={knowledgeBaseJsonLd} />
      <KnowledgeBaseClient />
    </>
  );
}
