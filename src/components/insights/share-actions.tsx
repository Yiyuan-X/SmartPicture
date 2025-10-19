"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserPoints } from "@/hooks/use-user-points";
import { Copy, Share2, CheckCircle2 } from "lucide-react";

type ShareSnippet = {
  platform: "facebook" | "linkedin" | "x" | "wechat" | string;
  message: string;
};

type Props = {
  articleTitle: string;
  shareSnippets: ShareSnippet[];
  slug: string;
  rewardPerShare?: number;
};

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  wechat: "朋友圈",
};

export default function InsightShareActions({
  articleTitle,
  shareSnippets,
  slug,
  rewardPerShare = 10,
}: Props) {
  const { addPoints } = useUserPoints();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sharedPlatforms, setSharedPlatforms] = useState<Set<string>>(new Set());

  const articleUrl = useMemo(() => {
    if (typeof window === "undefined") return `https://smartpicture.ai/insights/${slug}`;
    return window.location.origin + `/insights/${slug}`;
  }, [slug]);

  const handleCopy = useCallback(
    async (snippet: ShareSnippet) => {
      const prefix =
        snippet.message.includes(articleUrl) || snippet.message.includes("http")
          ? snippet.message
          : `${snippet.message}\n\n阅读完整文章：${articleUrl}`;
      try {
        await navigator.clipboard.writeText(prefix);
        const updated = new Set(sharedPlatforms);
        if (!updated.has(snippet.platform)) {
          updated.add(snippet.platform);
          setSharedPlatforms(updated);
          addPoints(rewardPerShare);
        }
        setFeedback(`${LABELS[snippet.platform] ?? snippet.platform} 文案已复制，分享即可获得积分奖励。`);
      } catch (error) {
        console.error("Copy share snippet failed", error);
        setFeedback("复制失败，请稍后再试。");
      }
    },
    [articleUrl, sharedPlatforms, addPoints, rewardPerShare]
  );

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      setFeedback("当前设备不支持系统分享，请复制任一平台文案。");
      return;
    }
    try {
      await navigator.share({
        title: articleTitle,
        text: "一起阅读 SmartPicture Insight Lab 自动生成的洞察文章。",
        url: articleUrl,
      });
      addPoints(rewardPerShare);
      setFeedback("分享成功！积分已记录。");
    } catch (error) {
      console.error("Native share failed or canceled", error);
    }
  }, [articleTitle, articleUrl, addPoints, rewardPerShare]);

  return (
    <Card className="space-y-4 border-emerald-200 bg-white/95 p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">一键复制分享文案</h3>
        <p className="text-sm text-gray-500">
          每成功分享到一个渠道，即可获得 {rewardPerShare} 积分（示例）。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {shareSnippets.map((snippet) => (
          <button
            key={snippet.platform}
            type="button"
            onClick={() => void handleCopy(snippet)}
            className="flex h-full flex-col justify-between rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-left text-sm text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              <Copy className="h-3.5 w-3.5" />
              {LABELS[snippet.platform] ?? snippet.platform.toUpperCase()}
            </span>
            <span className="mt-2 flex-1 whitespace-pre-wrap text-gray-700">{snippet.message}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              点击复制 +{rewardPerShare} 积分
            </span>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        onClick={handleNativeShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        使用系统分享
      </Button>

      {feedback ? <p className="text-xs text-emerald-600">{feedback}</p> : null}
    </Card>
  );
}
