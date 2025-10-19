import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAuth } from "@/lib/api-auth";
import { getGenerativeModel } from "@/lib/vertex";

const MODEL_ID = process.env.VERTEX_MODEL_ID ?? "imagegeneration@006";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const imageFile = formData.get("image");
  const qualityModeRaw = formData.get("qualityMode");
  const qualityMode =
    typeof qualityModeRaw === "string" && qualityModeRaw === "high"
      ? "high"
      : "standard";

  console.log("Prompt provided:", typeof prompt === "string" ? prompt.slice(0, 80) : prompt);
  console.log("Image provided:", imageFile instanceof File);
  console.log("Quality mode:", qualityMode);

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json(
      { error: "请输入提示词（Main Prompt）。" },
      { status: 400 }
    );
  }

  if (!(imageFile instanceof File)) {
    return NextResponse.json(
      { error: "请先上传一张图片再生成。" },
      { status: 400 }
    );
  }

  const model = getGenerativeModel({ model: MODEL_ID });

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    let uploadBuffer: Buffer = originalBuffer;
    let uploadMimeType =
      typeof imageFile.type === "string" && imageFile.type
        ? imageFile.type
        : "image/png";

    if (qualityMode !== "high") {
      // Compress to conserve tokens and speed unless high-quality mode is requested.
      uploadBuffer = await sharp(originalBuffer)
        .resize(512, 512, { fit: "inside" })
        .jpeg({ quality: 85 })
        .toBuffer();
      uploadMimeType = "image/jpeg";
    }

    const requestPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt.trim() },
            {
              inlineData: {
                mimeType: uploadMimeType,
                data: uploadBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(requestPayload);
    const candidates = result.response?.candidates ?? [];

    type InlineImage = { data: string; mimeType?: string };
    const inlineImages: InlineImage[] = [];

    for (const candidate of candidates) {
      const parts = candidate.content?.parts ?? [];
      for (const part of parts) {
        const inlineData = (part as {
          inlineData?: { data?: string; mimeType?: string };
        }).inlineData;
        if (inlineData?.data) {
          inlineImages.push({
            data: inlineData.data,
            mimeType: inlineData.mimeType,
          });
        }
      }
    }

    if (!inlineImages.length) {
      return NextResponse.json(
        { error: "生成失败，Vertex 未返回图片内容。" },
        { status: 500 }
      );
    }

    const imagePayload = inlineImages.map((inlineImage) => ({
      dataUrl: `data:${inlineImage.mimeType ?? "image/png"};base64,${inlineImage.data}`,
    }));

    return NextResponse.json(
      { success: true, images: imagePayload, uid: authResult.uid },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Vertex generateContent failed:", error);
    return NextResponse.json(
      {
        error: "请求 Vertex 失败，请确认网络或凭据配置。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
