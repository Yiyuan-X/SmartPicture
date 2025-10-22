"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFirebaseApp, getFirebaseAuth } from "@/lib/firebase-client";
import { resolveDashboardRoute } from "@/lib/resolve-dashboard";

const firestore = getFirestore(getFirebaseApp());

export default function DashboardPage() {
  const router = useRouter();
  const [points, setPoints] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      setDisplayName(user.displayName ?? user.email ?? "SmartPicture 用户");

      const target = await resolveDashboardRoute(user);
      if (target !== "/dashboard") {
        router.replace(target);
        return;
      }

      const ref = doc(firestore, "users", user.uid);
      return onSnapshot(ref, (snapshot) => {
        const data = snapshot.data();
        setPoints(typeof data?.points === "number" ? data.points : 0);
      });
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="space-y-12 bg-gradient-to-b from-slate-50 via-white to-orange-50 pb-16">
      <section className="border-b border-orange-100 bg-white/80 py-12 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge className="bg-orange-100 text-orange-700">个人控制台</Badge>
            <h1 className="text-3xl font-semibold text-gray-900">
              欢迎回来，{displayName ?? "正在加载"}
            </h1>
            <p className="text-sm text-gray-600">
              查看积分、快捷访问各模块功能，持续探索 SmartPicture 的增长手册。
            </p>
          </div>
          <PointsCard points={points} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4">
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardAction
            title="创意工作室"
            description="90 秒生成可投放的商业级视觉素材。"
            href="/creative-suite"
          />
          <DashboardAction
            title="内容助理"
            description="图像解析、视觉问答与渠道化文案一站完成。"
            href="/content-assistant"
          />
          <DashboardAction
            title="多媒体枢纽"
            description="长篇音视频自动提炼摘要、亮点与行动项。"
            href="/multimedia-hub"
          />
          <DashboardAction
            title="知识库"
            description="上传文档，获得带引用的精准问答与企业级检索。"
            href="/knowledge-base"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4">
        <Card className="flex flex-col gap-4 border-orange-200 bg-white/85 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">提交功能愿望</h2>
            <p className="text-sm text-gray-600">
              告诉我们你最希望 SmartPicture 支持的能力，积分激励正在进行中。
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600">
            <Link href="/suggestions">前往愿望池</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}

function PointsCard({ points }: { points: number | null }) {
  return (
    <Card className="border-orange-200 bg-white/90 px-8 py-6 text-center shadow-md">
      <p className="text-sm text-gray-500">当前积分</p>
      <p className="mt-2 text-4xl font-bold text-orange-500">{points === null ? "--" : points}</p>
    </Card>
  );
}

function DashboardAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="flex flex-col justify-between border-orange-200 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <Button asChild variant="outline" className="mt-4 border-orange-300 text-orange-600 hover:bg-orange-50">
        <Link href={href}>进入模块</Link>
      </Button>
    </Card>
  );
}
