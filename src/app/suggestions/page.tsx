import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata } from "@/lib/metadata";
import { suggestionsJsonLd } from "@/data/suggestions";
import { SuggestionsClient } from "./suggestions-client";

export const metadata = createMetadata({
  title: "愿望池",
  description:
    "向 SmartPicture 提交功能愿望、体验建议与灵感创意，积分激励驱动社区共建下一代视觉生产力工具。",
  path: "/suggestions",
});

export default function SuggestionsPage() {
  return (
    <>
      <JsonLd id="suggestions-json-ld" data={suggestionsJsonLd} />
      <SuggestionsClient />
    </>
  );
}
