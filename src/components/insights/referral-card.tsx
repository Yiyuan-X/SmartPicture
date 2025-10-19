"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserPoints } from "@/hooks/use-user-points";
import { Gift, Share2, Wallet } from "lucide-react";

const STORAGE_KEY = "smartpicture_referral_code";
const REFERRAL_REWARD = 30;
const REFERRAL_COMMISSION_RATE = 0.2;

function getOrCreateReferralCode() {
  if (typeof window === "undefined") return "demo-ref";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const code =
    typeof window.crypto !== "undefined" && "randomUUID" in window.crypto
      ? window.crypto.randomUUID().split("-")[0]
      : Math.random().toString(36).slice(2, 10);
  window.localStorage.setItem(STORAGE_KEY, code);
  return code;
}

export default function InsightsReferralCard() {
  const { addPoints } = useUserPoints();
  const [message, setMessage] = useState<string | null>(null);
  const [hasRewarded, setHasRewarded] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("demo-ref");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReferralCode(getOrCreateReferralCode());
  }, []);

  const referralLink = useMemo(
    () => `https://smartpicture.ai/invite?campaign=insight-lab&code=${referralCode}`,
    [referralCode]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `加入 SmartPicture Insight Lab，体验自动生成 SEO/AEO 高质量文章：${referralLink}`
      );
      setMessage("邀请链接已复制！好友下单后你们双方都将获得 20% 现金抵扣券，可续费或提现。");
      if (!hasRewarded) {
        addPoints(REFERRAL_REWARD);
        setHasRewarded(true);
      }
    } catch (error) {
      console.error("Failed to copy referral link", error);
      setMessage("复制失败，请手动复制链接。");
    }
  }, [referralLink, addPoints, hasRewarded]);

  const handleShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      void handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "SmartPicture Insight Lab 自动生文",
        text: "好友完成订单后，你和好友均获 20% 现金抵扣券，可用于续费或提现，亦可申请合伙人。",
        url: referralLink,
      });
      setMessage("分享成功！提醒好友下单解锁 30% 现金奖励。");
      if (!hasRewarded) {
        addPoints(REFERRAL_REWARD);
        setHasRewarded(true);
      }
    } catch (error) {
      console.error("Share canceled or failed", error);
    }
  }, [referralLink, addPoints, hasRewarded, handleCopy]);

  return (
    <Card className="space-y-4 border-dashed border-blue-200 bg-white/90 p-6 text-sm text-gray-600">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Gift className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">邀请伙伴体验自动生文</h3>
          <p className="text-xs text-gray-500">
            分享功能页面给伙伴，双方均可获得 {REFERRAL_REWARD} 积分；好友任意订单完成后，你和好友都将获得订单金额
            {` ${(REFERRAL_COMMISSION_RATE * 100).toFixed(0)}%`} 的现金抵扣券，可提现或升级为合伙人。
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-3 font-mono text-xs text-blue-600">
        {referralLink}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={handleCopy}>
          复制邀请链接
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          分享给朋友
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-700">
        <div className="flex items-start gap-2">
          <Wallet className="mt-0.5 h-4 w-4" />
          <p>
            好友完成任何订单，你和好友都将获得订单金额 {` ${(REFERRAL_COMMISSION_RATE * 100).toFixed(0)}%`} 的现金抵扣券，可用于续费，也可提交提现申请。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-700">
          <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-100" asChild>
            <Link href="mailto:finance@smartpicture.ai?subject=%E6%8F%90%E7%8E%B0%E7%94%B3%E8%AF%B7%20-%20SmartPicture">
              申请提现
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white hover:from-blue-500 hover:to-indigo-600"
            asChild
          >
            <Link href="/programs/ai-creators?from=referral">
              申请成为合伙人
            </Link>
          </Button>
        </div>
      </div>

      {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
    </Card>
  );
}
