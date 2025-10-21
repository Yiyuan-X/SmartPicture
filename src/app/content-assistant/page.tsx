import { JsonLd } from "@/components/seo/json-ld";
import { contentAssistantJsonLd } from "@/data/content-assistant";
import { createMetadata } from "@/lib/metadata";
import ContentAssistantClient from "./content-assistant-client";

export const metadata = createMetadata({
  title: "内容助理",
  description:
    "SmartPicture 内容助理结合图像解析、视觉问答与渠道化文案输出，帮助营销团队在多渠道快速生产高质量素材。",
  path: "/content-assistant",
});

export default function ContentAssistantPage() {
  return (
    <>
      <JsonLd id="content-assistant-json-ld" data={contentAssistantJsonLd} />
      <ContentAssistantClient />
    </>
  );
}
