"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentIdToken } from "@/lib/auth-client";
import dynamic from "next/dynamic";
import {
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Sparkles,
  UploadCloud,
  Zap,
  X,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function TryEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [qualityMode, setQualityMode] = useState<"standard" | "high">("standard");

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("图片大小超过 50MB 限制，请选择更小的文件。");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const AuthDialog = dynamic(() => import("@/components/auth/auth-dialog").then((mod) => mod.AuthDialog), {
    ssr: false,
  });

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleGenerate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!prompt.trim()) {
        setErrorMessage("请输入提示词后再生成。");
        return;
      }

      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("qualityMode", qualityMode);

      try {
        setIsLoading(true);
        setErrorMessage(null);

        let idToken = await getCurrentIdToken();
        if (!idToken) {
          setShowAuthPrompt(true);
          setGeneratedImages([]);
          setIsLoading(false);
          setErrorMessage("请先登录后再使用提示词编辑功能。");
          return;
        }

        const sendRequest = async (token: string) =>
          fetch("/api/ai/generate", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        let response = await sendRequest(idToken);

        if (response.status === 401) {
          const refreshedToken = await getCurrentIdToken(true);
          if (refreshedToken && refreshedToken !== idToken) {
            idToken = refreshedToken;
            response = await sendRequest(refreshedToken);
          }
        }

        if (response.status === 401) {
          setShowAuthPrompt(true);
          setGeneratedImages([]);
          setIsLoading(false);
          setErrorMessage("身份验证失败或令牌已过期，请重新登录。");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data?.success) {
          const detailMessage = typeof data?.details === "string" ? ` ${data.details}` : "";
          setGeneratedImages([]);
          setIsLoading(false);
          setErrorMessage((data?.error || "生成失败，请稍后重试。") + detailMessage);
          return;
        }

        if (!Array.isArray(data?.images) || data.images.length === 0) {
          setGeneratedImages([]);
          setIsLoading(false);
          setErrorMessage("未获取到生成的图片，请调整提示词后重试。");
          return;
        }

        const imageUrls = data.images
          .map((item: unknown) => {
            if (typeof item === "string") {
              return item;
            }
            if (
              item &&
              typeof item === "object" &&
              "dataUrl" in item &&
              typeof (item as { dataUrl?: unknown }).dataUrl === "string"
            ) {
              return (item as { dataUrl: string }).dataUrl;
            }
            return null;
          })
          .filter((url: unknown): url is string => typeof url === "string" && url.length > 0);

        if (!imageUrls.length) {
          throw new Error("未获取到生成的图片，请稍后重试。");
        }

        setGeneratedImages(imageUrls);
      } catch (error) {
        console.error("Generate failed:", error);
        setGeneratedImages([]);
        setErrorMessage(
          error instanceof Error ? error.message : "生成失败，请稍后重试。"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, qualityMode, selectedFile]
  );

  const promptPlaceholder = useMemo(
    () => "未来科技城市，纳米能源驱动，傍晚金色光影，超写实质感…",
    []
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <div className="flex w-full flex-col lg:w-1/2">
        <Card className="flex-1 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
            <h3 className="text-xl font-bold text-gray-900">提示词引擎</h3>
            <p className="text-gray-600">使用 AI 增强编辑，瞬间刷新图片故事</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleGenerate}>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              size="sm"
              onClick={handleAddImageClick}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              上传图片
            </Button>
            <Button size="sm" type="button" variant="outline" disabled>
              文字生图（即将上线）
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-yellow-800">批量处理</span>
              <Badge className="bg-yellow-200 text-yellow-800 text-xs">专业版</Badge>
            </div>
            <p className="text-xs text-yellow-700">开通批量模式，可一次处理多张图片</p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={handleAddImageClick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleAddImageClick();
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {previewUrl ? (
              <div className="relative inline-block">
                <Image
                  src={previewUrl}
                  alt={selectedFile?.name || "已上传图片"}
                  width={240}
                  height={240}
                  unoptimized
                  className="mx-auto rounded-lg object-cover max-h-60"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full shadow"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-gray-600">
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <p className="text-sm">可选：点击上传图片</p>
                <p className="text-xs text-gray-500">单张不超过 50MB，可直接提示词生成</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              核心提示词
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              rows={3}
              placeholder={promptPlaceholder}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              输出质量
            </span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={qualityMode === "standard" ? "default" : "outline"}
                className={
                  qualityMode === "standard"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : ""
                }
                onClick={() => setQualityMode("standard")}
              >
                极速模式
              </Button>
              <Button
                type="button"
                variant={qualityMode === "high" ? "default" : "outline"}
                className={
                  qualityMode === "high"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : ""
                }
                onClick={() => setQualityMode("high")}
              >
                原图优先
              </Button>
              <span className="text-xs text-gray-500">
                极速模式压缩到 512×512，更快更省；原图优先保留上传质量。
              </span>
            </div>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                正在生成…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                立即生成
              </>
            )}
          </Button>
        </form>
        </Card>
      </div>

      <div className="flex w-full flex-col lg:w-1/2">
        <Card className="flex-1 overflow-hidden bg-white border-gray-200 p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">生成结果画廊</h3>
              <p className="text-gray-600">所有 AI 生成素材会即时呈现在此</p>
            </div>
          </div>

          <div className="h-full overflow-y-auto rounded-lg bg-gray-50 p-4 md:p-6">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p>感谢耐心等待，SmartPicture 正在为您打磨结果…</p>
            </div>
            ) : generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {generatedImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative overflow-hidden rounded-lg bg-white shadow-sm"
                  >
                    <img
                      src={image}
                      alt={`生成结果 ${index + 1}`}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900">准备随时生成</h4>
                <p className="text-gray-600">输入提示词，体验 SmartPicture 的速度与细节</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      {showAuthPrompt ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">登录后继续操作</h3>
            <p className="mt-2 text-sm text-gray-600">
              使用 SmartPicture 提示词引擎需要先登录账号，请完成登录后再次尝试生成。
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <AuthDialog layout="vertical" onAction={() => setShowAuthPrompt(false)} />
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowAuthPrompt(false)}
              >
                暂时取消
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
