import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/metadata";
import { multimediaSchema } from "@/data/multimedia-hub";
import { MultimediaHubClient } from "./multimedia-hub-client";

export const metadata = createMetadata({
  title: "多媒体枢纽",
  description:
    "SmartPicture 多媒体枢纽将长篇音视频转化为摘要、亮点、行动项与高品质语音播报，支持多渠道内容复用。",
  path: "/multimedia-hub",
});

export default function MultimediaHubPage() {
  return (
    <>
      <JsonLd id="multimedia-hub-json-ld" data={multimediaSchema} />
      <MultimediaHubClient />
    </>
  );
}
