import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "SmartPicture - AI图片生成, 智能抠图与图像识别工具",
  description:
    "使用 SmartPicture，一键完成 AI 图片生成、智能抠图、图像识别和批量压缩。专为设计师、营销人员和内容创作者打造的在线 AI 视觉工具。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans">
        <ClientBody>
          <SiteHeader />
          <main>{children}</main>
        </ClientBody>
      </body>
    </html>
  );
}
