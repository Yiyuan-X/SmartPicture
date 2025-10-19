import Link from "next/link";
import { LeadPortalActions } from "@/components/lead/lead-portal";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-orange-100 bg-white/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-center text-sm text-gray-600">
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 px-6 py-8 text-gray-700">
          <h2 className="text-lg font-semibold text-gray-900">
            如果你也想拥有一个属于自己的智能工具，或想学习如何开发定制化的 AI 应用，
          </h2>
          <p className="mt-3">
            欢迎联系我们，一起把创意变成真正可用的产品。我们相信——每个人都能打造出自己喜欢、真正好用的定制化工具。
          </p>
          <LeadPortalActions />
        </div>
        <p>Copyright © 2015-2025 Changxinkai All Rights Reserved</p>
        <p className="flex flex-wrap items-center justify-center gap-2">
          <span>福建省厦门市公安局莲前西路派出所监督备案：</span>
          <a
            href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35020302036093"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
          >
            <img
              src="https://www.beian.gov.cn/img/new/gongan.png"
              alt="公安网备案图标"
              className="h-4 w-auto"
            />
            闽公网安备35020302036093号
          </a>
        </p>
        <p>
          工信部备案号：
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 font-medium text-blue-700 hover:underline"
          >
            闽ICP备2024033359号-1
          </a>
        </p>
      </div>
    </footer>
  );
}
