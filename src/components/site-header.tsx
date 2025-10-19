"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const navItems = [
  { href: "/creative-suite", label: "创意工作室" },
  { href: "/content-assistant", label: "内容助理" },
  { href: "/multimedia-hub", label: "多媒体枢纽" },
  { href: "/knowledge-base", label: "知识库" },
];

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-full px-3 py-1 text-sm font-medium transition ${
        isActive
          ? "bg-orange-100 text-orange-700"
          : "text-gray-700 hover:text-orange-600"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 text-lg">
            🌅
          </span>
          <span className="text-lg font-semibold text-gray-900">SmartPicture</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <AuthActions />
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 text-orange-600"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-orange-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-2 py-3">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} onNavigate={handleNavigate} />
            ))}
          </nav>
          <div className="mt-4">
            <AuthActions isMobile onNavigate={handleNavigate} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
  ssr: false,
});

function AuthActions({ isMobile, onNavigate }: { isMobile?: boolean; onNavigate?: () => void }) {
  return (
    <div className={isMobile ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      <AuthDialog layout={isMobile ? "vertical" : "horizontal"} onAction={onNavigate} />
    </div>
  );
}
