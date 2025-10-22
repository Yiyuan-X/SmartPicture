"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  toAuthSuccessPayload,
  logout,
} from "@/lib/auth-client";
import { getFirebaseAuth } from "../../lib/firebase-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useUserPoints } from "@/hooks/use-user-points";

type AuthMode = "login" | "register";

type AuthDialogProps = {
  layout?: "horizontal" | "vertical";
  onAction?: () => void;
};

export function AuthDialog({ layout = "horizontal", onAction }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email?: string | null; name?: string | null } | null>(null);
  const { addPoints } = useUserPoints();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({ email: user.email, name: user.displayName });
      } else {
        setUserInfo(null);
      }
    });
    return unsubscribe;
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const openDialog = useCallback(
    (nextMode: AuthMode) => {
      setMode(nextMode);
      setIsOpen(true);
      setErrorMessage(null);
      onAction?.();
    },
    [onAction]
  );

  const handleGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const credential = await signInWithGoogle();
      const payload = await toAuthSuccessPayload(credential);
      setUserInfo({ email: payload.email, name: payload.displayName });
      closeDialog();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Google 登录失败，请稍后再试。"
      );
    } finally {
      setIsLoading(false);
    }
  }, [closeDialog]);

  const handleEmailSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email || !password) {
        setErrorMessage("请输入邮箱与密码。");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (mode === "login") {
          const credential = await loginWithEmail(email.trim(), password);
          const payload = await toAuthSuccessPayload(credential);
          setUserInfo({ email: payload.email, name: payload.displayName });
          setSuccessMessage("登录成功，欢迎回来！");
        } else {
          const credential = await registerWithEmail(
            email.trim(),
            password,
            displayName.trim() || undefined
          );
          const payload = await toAuthSuccessPayload(credential);
          setUserInfo({ email: payload.email, name: payload.displayName });
          addPoints(100);
          setSuccessMessage("首次注册成功，已获赠 100 积分，祝你创作顺利！");
        }
        setTimeout(() => {
          closeDialog();
        }, 800);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "邮箱登录失败，请稍后再试。"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, displayName, mode, closeDialog, addPoints]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserInfo(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "退出登录失败。");
    }
  }, []);

  const dialogContent = !isOpen ? null : (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "login" ? "登录 SmartPicture" : "注册 SmartPicture"}
            </h2>
            <p className="text-xs text-gray-500">
              使用 Google 一键登录或邮箱密码体验 SmartPicture
            </p>
          </div>
            <Button variant="ghost" size="sm" onClick={closeDialog}>
              关闭
            </Button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <Button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在连接 Google…
              </>
            ) : (
              "使用 Google 账号继续"
            )}
          </Button>

          <div className="relative text-center text-xs uppercase text-gray-400">
            <span className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-gray-200" />
            <span className="bg-white px-2">或使用邮箱</span>
          </div>

          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            {mode === "register" ? (
              <Input
                autoComplete="name"
                placeholder="昵称 / 显示名称"
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
              />
            ) : null}

            <Input
              type="email"
              autoComplete="email"
              placeholder="邮箱"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />

            <Input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "密码" : "设置密码（至少 6 位）"}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-emerald-600">{successMessage}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中…
                </>
              ) : mode === "login" ? (
                "登录"
              ) : (
                "注册并体验"
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {mode === "login" ? "还没有账号？" : "已经注册过？"}
            </span>
            <button
              type="button"
              className="text-orange-600 hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "立即注册" : "直接登录"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={cn(
          "flex gap-2",
          layout === "horizontal" ? "items-center" : "flex-col items-stretch"
        )}
      >
        {userInfo ? (
          <>
            <div
              className={cn(
                "text-xs text-gray-600",
                layout === "horizontal"
                  ? "hidden flex-col text-right sm:flex"
                  : "flex flex-col text-left w-full"
              )}
            >
              <span>{userInfo.name ?? "SmartPicture 用户"}</span>
              <span>{userInfo.email ?? "未绑定邮箱"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className={layout === "vertical" ? "w-full" : undefined}>
              退出登录
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => openDialog("login")} className={layout === "vertical" ? "w-full" : undefined}>
              登录
            </Button>
            <Button
              className={cn(
                "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600",
                layout === "vertical" ? "w-full" : undefined
              )}
              onClick={() => openDialog("register")}
            >
              注册并体验
            </Button>
          </>
        )}
      </header>

      {isOpen ? createPortal(dialogContent, document.body) : null}
    </>
  );
}
