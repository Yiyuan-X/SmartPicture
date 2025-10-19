"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const handleGenerate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedFile) {
        setErrorMessage("请先上传一张图片。");
        return;
      }

      if (!prompt.trim()) {
        setErrorMessage("请输入提示词后再生成。");
        return;
      }

      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      formData.append("image", selectedFile);
      formData.append("qualityMode", qualityMode);

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          const detailMessage = typeof data?.details === "string" ? ` ${data.details}` : "";
          throw new Error((data?.error || "生成失败，请稍后重试。") + detailMessage);
        }

        if (!Array.isArray(data?.images) || data.images.length === 0) {
          throw new Error("未获取到生成的图片，请调整提示词后重试。");
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
    <>
      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200">
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
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
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-gray-600">
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <p className="text-sm">点击上传图片</p>
                <p className="text-xs text-gray-500">单张不超过 50MB</p>
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

      <Card className="p-6 bg-white border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">生成结果画廊</h3>
            <p className="text-gray-600">所有 AI 生成素材会即时呈现在此</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                准备随时生成
              </h4>
              <p className="text-gray-600">输入提示词，体验 SmartPicture 的速度与细节</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
