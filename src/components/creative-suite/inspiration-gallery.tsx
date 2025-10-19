import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const galleryItems = [
  {
    title: "产品主视觉",
    description: "单张产品照即可生成上市级生活场景渲染图。",
    prompt:
      "将这张纯白背景的产品图转换为晨光氛围的精品生活场景，加入暗示晨间使用的道具与柔和光影。",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "活动创意海报",
    description: "帮助营销团队快速产出下一波活动视觉方向。",
    prompt:
      "为可持续主题活动设计一张大胆的未来主义海报，使用霓虹渐变与玻璃拟态 UI 元素。",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "品牌造型手册",
    description: "多张角色照片保持人设一致，适用于 Lookbook。",
    prompt:
      "创作一组时尚人像，采用电影级光影，保持面部特征与服装配色在多张图片中一致。",
    imageUrl:
      "https://images.unsplash.com/photo-1511288599420-5a4c84eb4c59?auto=format&fit=crop&w=1200&q=80",
  },
];

export function InspirationGallery() {
  return (
    <section id="inspiration" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <Badge className="bg-orange-100 text-orange-700">灵感画廊</Badge>
          <h2 className="text-2xl font-semibold text-gray-900">快速点燃创意方向</h2>
        </div>
      </div>

      <p className="text-muted-foreground max-w-2xl text-lg">
        精选来自高表现活动的提示词蓝图，可直接套用或二次创作，数分钟内完成符合品牌调性的视觉产出。
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {galleryItems.map((item) => (
          <Card
            key={item.title}
            className="group overflow-hidden border-orange-200 bg-gradient-to-br from-white to-orange-50/40 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  可直接套用
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="rounded-md border border-dashed border-orange-200 bg-white/70 p-3 text-sm text-gray-700">
                <span className="font-medium text-orange-600">提示词：</span> {item.prompt}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
