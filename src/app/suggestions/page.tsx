"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Sparkles, Star } from "lucide-react";

const categories = [
  { value: "feature", label: "新功能建议" },
  { value: "ui", label: "界面/体验" },
  { value: "bug", label: "Bug 反馈" },
  { value: "other", label: "其它想法" },
];

const mockSuggestions = [
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
];

export default function SuggestionsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.value ?? "feature");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pointsReward = useMemo(() => 10, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (title.trim().length < 10) {
      setErrorMessage("标题至少需要 10 个字符，请提供更明确的想法。");
      return;
    }
    if (description.trim().length < 30) {
      setErrorMessage("详细描述至少需要 30 个字符，请补充更多背景或期望效果。");
      return;
    }

    setTitle("");
    setDescription("");
    setCategory(categories[0]?.value ?? "feature");
    setSuccessMessage(`感谢你的建议！系统已为你发放 ${pointsReward} 积分奖励（示例）。`);
  };

  return (
    <div className="space-y-12 bg-gradient-to-b from-orange-50 via-white to-blue-50 pb-16">
      <section className="border-b border-orange-100 bg-white/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              <Wand2 className="h-4 w-4" /> 功能建议 · 愿望池
            </div>
            <h1 className="text-4xl font-bold text-gray-900">把你的灵感交给 SmartPicture</h1>
            <p className="text-lg text-gray-600">
              我们希望与创作者共同打造世界领先的视觉生产力工具。提交建议、评价想法，每一次贡献都将获得积分奖励，推动 SmartPicture 的下一次升级。
            </p>
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-gray-600">
              <h2 className="text-base font-semibold text-orange-700">Contact Us</h2>
              <p>Xiamen Changxinkai Technology Co., Ltd.</p>
              <p>
                Email：
                <a className="text-orange-600" href="mailto:info@cxktech.top">
                  info@cxktech.top
                </a>
              </p>
              <p>Hours：8:00AM - 4:00PM (Mon - Fri)</p>
            </div>
          </div>

          <Card className="border-orange-200 bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">提交你的愿望</CardTitle>
              <CardDescription>每条高质量建议将在审核后奖励 {pointsReward} 积分</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="suggest-title">
                    标题
                  </label>
                  <Input
                    id="suggest-title"
                    placeholder="例如：希望支持批量导入品牌素材库"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="suggest-category">
                    分类
                  </label>
                  <select
                    id="suggest-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="suggest-description">
                    详细描述
                  </label>
                  <Textarea
                    id="suggest-description"
                    rows={6}
                    placeholder="请描述你遇到的场景、期望的解决方案或你看到的灵感，我们将认真倾听。"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>

                {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
                {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> 提交建议
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge className="bg-blue-100 text-blue-700">社区愿望池</Badge>
            <h2 className="text-2xl font-semibold text-gray-900">最新建议</h2>
            <p className="text-sm text-gray-500">公开展示经过审核的用户建议，欢迎继续投票与讨论。</p>
          </div>
          <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            <Star className="mr-2 h-4 w-4" /> 查看积分规则
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockSuggestions.map((item) => (
            <Card key={item.id} className="border-blue-100 bg-white/90 shadow-sm">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-blue-50 text-blue-600">{item.category}</Badge>
                <CardTitle className="text-lg text-gray-900">{item.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID: {item.id}</span>
                  <span>社区支持度：{item.votes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
