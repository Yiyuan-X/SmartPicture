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
import { getHomeModules } from "@/data/home";
import { resolveIcon } from "@/lib/icon-registry";

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

  const modules = getHomeModules();

  return (
    <div className="space-y-12 bg-gradient-to-b from-slate-50 via-white to-orange-50 pb-16">
      <section className="border-b border-orange-100 bg-white/80 py-12 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge className="bg-orange-100 text-orange-700">个人控制台</Badge>
            <h1 className="text-3xl font-semibold text-gray-900">欢迎回来，{displayName ?? "正在加载"}</h1>
            <p className="text-sm text-gray-600">
              浏览积分、快捷访问模块入口，并第一时间了解 SmartPicture 的最新能力。
            </p>
          </div>
          <Card className="border-orange-200 bg-white/90 px-8 py-6 text-center shadow-md">
            <p className="text-sm text-gray-500">当前积分</p>
            <p className="mt-2 text-4xl font-bold text-orange-500">
              {points === null ? "--" : points}
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">快速入口</h2>
          <Button
            asChild
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Link href="/suggestions">提交功能建议</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = resolveIcon(module.icon);
            return (
              <Card
                key={module.id}
                className="flex h-full flex-col justify-between border-orange-200 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 shadow-inner">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orange-500">{module.id}</p>
                      <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600">{module.promise}</p>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
                <Button
                  asChild
                  className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                >
                  <Link href={module.href}>打开模块</Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
