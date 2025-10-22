"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  consumePendingRedirect,
  getAvailableSignInMethods,
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  sendResetEmail,
  toAuthSuccessPayload,
  logout,
} from "@/lib/auth-client";
import { getFirebaseAuth } from "../../lib/firebase-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useUserPoints } from "@/hooks/use-user-points";
import { resolveDashboardRoute } from "@/lib/resolve-dashboard";
import { FirebaseError } from "firebase/app";

type AuthMode = "login" | "register" | "reset";

type AuthDialogProps = {
  layout?: "horizontal" | "vertical";
  onAction?: () => void;
};

export function AuthDialog({ layout = "horizontal", onAction }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
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

  useEffect(() => {
    void consumePendingRedirect();
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
      setSuccessMessage(null);
      setHasAcceptedPolicies(false);
      setMarketingOptIn(false);
      onAction?.();
    },
    [onAction]
  );

  const switchMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setHasAcceptedPolicies(false);
    setMarketingOptIn(false);
  }, []);

  const handleGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const credential = await signInWithGoogle();
      const payload = await toAuthSuccessPayload(credential);
      setUserInfo({ email: payload.email, name: payload.displayName });
      try {
        const target = await resolveDashboardRoute(credential.user);
        if (typeof window !== "undefined") {
          window.location.assign(target);
        }
      } catch (error) {
        console.warn("Failed to resolve dashboard route after Google login", error);
      }
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
          const methods = await getAvailableSignInMethods(email.trim());
          if (
            methods.includes("google.com") &&
            !methods.includes("password")
          ) {
            setErrorMessage("该邮箱曾使用 Google 登录，请点击上方按钮使用 Google 继续。");
            setIsLoading(false);
            return;
          }

          const credential = await loginWithEmail(email.trim(), password);
          const payload = await toAuthSuccessPayload(credential);
          setUserInfo({ email: payload.email, name: payload.displayName });
          setSuccessMessage("登录成功，欢迎回来！");
          try {
            const target = await resolveDashboardRoute(credential.user);
            if (typeof window !== "undefined") {
              window.location.assign(target);
            }
          } catch (error) {
            console.warn("Failed to resolve dashboard route after email login", error);
          }
        } else {
          const methods = await getAvailableSignInMethods(email.trim());
          if (methods.includes("password")) {
            setErrorMessage("该邮箱已注册，请直接登录或通过“忘记密码”重置密码。");
            setIsLoading(false);
            return;
          }
          if (methods.includes("google.com")) {
            setErrorMessage("该邮箱已绑定 Google 登录，请点击上方按钮使用 Google 继续。");
            setIsLoading(false);
            return;
          }

          if (!hasAcceptedPolicies) {
            setErrorMessage("请先阅读并同意使用条款与隐私政策。");
            return;
          }

          const credential = await registerWithEmail(email.trim(), password);
          const payload = await toAuthSuccessPayload(credential);
          setUserInfo({ email: payload.email, name: payload.displayName });
          addPoints(100);
          setSuccessMessage("首次注册成功，已获赠 100 积分，祝你创作顺利！");
          try {
            const target = await resolveDashboardRoute(credential.user);
            if (typeof window !== "undefined") {
              window.location.assign(target);
            }
          } catch (error) {
            console.warn("Failed to resolve dashboard route after registration", error);
          }
        }
        setTimeout(() => {
          closeDialog();
        }, 800);
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (error.code === "auth/email-already-in-use") {
            setErrorMessage("该邮箱已注册，请直接登录或使用“忘记密码”找回密码。");
          } else if (error.code === "auth/invalid-login-credentials") {
            setErrorMessage("邮箱或密码有误，请重新输入或重置密码。");
          } else {
            setErrorMessage(error.message);
          }
        } else {
          setErrorMessage(
            error instanceof Error ? error.message : "邮箱登录失败，请稍后再试。"
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, mode, closeDialog, addPoints, hasAcceptedPolicies]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserInfo(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "退出登录失败。");
    }
  }, []);

  const handleResetSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email) {
        setErrorMessage("请填写需要找回的邮箱。");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const methods = await getAvailableSignInMethods(email.trim());
        if (methods.length === 0) {
          setErrorMessage("该邮箱尚未注册 SmartPicture 账户。");
          return;
        }
        if (!methods.includes("password")) {
          setErrorMessage("该账号未设置密码，请使用 Google 登录或联系管理员。");
          return;
        }
        await sendResetEmail(email.trim());
        setSuccessMessage("重置邮件已发送，请检查邮箱中的操作提示。");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "密码重置失败，请稍后再试。");
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

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
          {mode !== "reset" ? (
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
          ) : null}

          {mode !== "reset" ? (
            <div className="relative text-center text-xs uppercase text-gray-400">
              <span className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-gray-200" />
              <span className="bg-white px-2">或使用邮箱</span>
            </div>
          ) : null}

          {mode === "reset" ? (
            <form className="space-y-4" onSubmit={handleResetSubmit}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="请输入注册邮箱"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
              {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    发送重置邮件…
                  </>
                ) : (
                  "发送密码重置邮件"
                )}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
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

              {mode === "register" ? (
                <div className="space-y-3 text-xs text-gray-600">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={hasAcceptedPolicies}
                      onChange={(event) => setHasAcceptedPolicies(event.currentTarget.checked)}
                      className="mt-1 h-4 w-4"
                      required
                    />
                    <span>
                      我已阅读并同意
                      <Link href="/legal/terms" target="_blank" className="text-orange-600 hover:underline">
                        《使用条款》
                      </Link>
                      和
                      <Link href="/legal/privacy" target="_blank" className="ml-1 text-orange-600 hover:underline">
                        《隐私政策》
                      </Link>
                      ，并同意 SmartPicture 按 GDPR 要求处理我的数据。
                    </span>
                  </label>
                  <label className="flex items-start gap-2 text-gray-500">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(event) => setMarketingOptIn(event.currentTarget.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>我愿意接收 SmartPicture 的产品动态与营销信息（可随时取消订阅）。</span>
                  </label>
                </div>
              ) : null}

              {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}

              <div className="flex items-center justify-between text-xs text-orange-600">
                {mode === "login" ? (
                  <button type="button" className="hover:underline" onClick={() => switchMode("reset")}>
                    忘记密码？
                  </button>
                ) : (
                  <span />
                )}
                {mode === "register" ? (
                  <button type="button" className="hover:underline" onClick={() => switchMode("login")}
                  >
                    已有账号？去登录
                  </button>
                ) : (
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => switchMode(mode === "login" ? "register" : "login")}
                  >
                    {mode === "login" ? "还没有账号？立即注册" : "已有账号？直接登录"}
                  </button>
                )}
              </div>

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
          )}

          {mode === "reset" ? (
            <div className="text-sm text-gray-600">
              <button
                type="button"
                className="text-orange-600 hover:underline"
                onClick={() => switchMode("login")}
              >
                返回登录
              </button>
            </div>
          ) : null}
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
