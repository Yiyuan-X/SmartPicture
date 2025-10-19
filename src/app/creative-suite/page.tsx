import TryEditor from "@/components/try-editor";
import { InspirationGallery } from "@/components/creative-suite/inspiration-gallery";
import { StylePresets } from "@/components/creative-suite/style-presets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Sparkles, Zap } from "lucide-react";

const proofPoints = [
  "90 秒内输出可投放的商业素材。",
  "角色、光线与构图在多轮生成中保持一致。",
  "预设与灵感画廊可一键共享给团队与客户。",
];

export default function CreativeSuitePage() {
  return (
    <div className="space-y-16 bg-gradient-to-b from-yellow-50 via-white to-orange-50 pb-20">
      <section className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-br from-orange-100 via-yellow-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 md:flex-row md:items-center">
          <div className="space-y-6 md:w-1/2">
            <Badge className="bg-orange-100 text-orange-700">创意工作室</Badge>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              将灵感即时可视化
            </h1>
            <p className="text-lg text-gray-700">
              上传参考图或产品照片，描述你想讲述的故事。SmartPicture 保留原始构图与角色特征，输出适用于上市发布、营销投放与电商上架的视觉素材。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2 text-base shadow-lg hover:from-yellow-600 hover:to-orange-600">
                <Sparkles className="mr-2 h-4 w-4" />
                新建生成项目
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                查看 2 分钟操作演示
              </Button>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              {proofPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2 space-y-6">
            <Card className="border-orange-200 bg-white/80 p-6 shadow-lg">
              <div className="flex items-center gap-3 border-b border-dashed border-orange-100 pb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-200 text-orange-700">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI 图像生成</h2>
                  <p className="text-sm text-gray-600">
                    基于 imagegeneration@006 模型，通过 /api/ai/generate 提供服务
                  </p>
                </div>
              </div>
              <p className="pt-4 text-sm text-gray-600">
                上传单张产品图或场景图，Vertex AI 集成会在执行创意指令时保持构图、光线与角色身份稳定。
              </p>
            </Card>
            <TryEditor />
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-4">
        <StylePresets />
        <InspirationGallery />
      </section>
    </div>
  );
}
