import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Palette, Sun, Camera, PenTool } from "lucide-react";

const stylePresets = [
  {
    id: "brand-kit",
    title: "品牌视觉锁定",
    description: "在每次生成中保持 Logo、配色与字体一致，确保品牌连贯。",
    bestFor: "营销与增长团队",
    icon: Palette,
  },
  {
    id: "studio-light",
    title: "棚拍光线",
    description: "默认加入柔光箱、轮廓光与景深处理，呈现高清写实产品照。",
    bestFor: "电商展示与产品图",
    icon: Sun,
  },
  {
    id: "campaign-story",
    title: "活动故事板",
    description: "多场景连续输出保持人物身份一致，为剧本分镜快速打样。",
    bestFor: "创意代理与内容制作",
    icon: Camera,
  },
  {
    id: "concept-art",
    title: "概念艺术加速",
    description: "电影级调色与手绘质感并存，用于快速探索视觉方向。",
    bestFor: "艺术总监与插画师",
    icon: PenTool,
  },
];

export function StylePresets() {
  return (
    <section id="style-presets" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Badge className="bg-orange-100 text-orange-700">风格预设</Badge>
          <h2 className="text-2xl font-semibold text-gray-900">
            专为商业交付调校的工作室级预设
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          可在工作空间保存自定义预设，并与协作者共享使用。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stylePresets.map((preset) => {
          const Icon = preset.icon;
          return (
            <Card
              key={preset.id}
              className="group flex flex-col gap-4 border-orange-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 shadow-inner">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{preset.title}</h3>
                  <p className="text-sm text-gray-500">{preset.bestFor}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{preset.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-orange-600">
                <span className="rounded-full bg-orange-100 px-3 py-1 font-medium">
                  可调节参数
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 font-medium">
                  一致性模式
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 font-medium">
                  团队共享
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
