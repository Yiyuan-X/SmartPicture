import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { VertexAI, Image as VertexImage } from "@google-cloud/vertexai";

const MODEL_ID = process.env.VERTEX_MODEL_ID ?? "gemini-2.0-flash-image";
const LOCATION = process.env.VERTEX_LOCATION ?? "us-central1";
const OUTPUT_DIR = path.join(process.cwd(), "public", "output");

export async function POST(request: NextRequest) {
  const googleJson = process.env.GOOGLE_JSON;

  if (!googleJson) {
    return NextResponse.json(
      {
        error:
          "缺少 GOOGLE_JSON 环境变量，请在 .env.local 中配置 Google 服务账号凭据。",
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const imageFile = formData.get("image");

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

  let credentials: { project_id?: string };

  try {
    credentials = JSON.parse(googleJson);
  } catch (error) {
    console.error("Failed to parse GOOGLE_JSON:", error);
    return NextResponse.json(
      { error: "GOOGLE_JSON 解析失败，请确认 JSON 格式是否正确。" },
      { status: 500 }
    );
  }

  if (!credentials.project_id) {
    return NextResponse.json(
      { error: "GOOGLE_JSON 中缺少 project_id。" },
      { status: 500 }
    );
  }

  const vertex = new VertexAI({
    project: credentials.project_id,
    location: LOCATION,
    googleAuthOptions: { credentials },
  });

  const model = vertex.preview.getGenerativeModel({ model: MODEL_ID });

  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // Keep bandwidth small for faster round-trips.
    const compressedBuffer = await sharp(originalBuffer)
      .resize(512, 512, { fit: "inside" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const imagePart = VertexImage.fromBuffer(compressedBuffer);

    const result = await model.generateContent([prompt.trim(), imagePart]);
    const responseBlob = await result.response?.blob();

    if (!responseBlob) {
      return NextResponse.json(
        { error: "生成失败，Vertex 未返回图片内容。" },
        { status: 500 }
      );
    }

    const generatedBuffer = Buffer.from(await responseBlob.arrayBuffer());

    await mkdir(OUTPUT_DIR, { recursive: true });
    const fileName = `${uuid()}.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    await writeFile(filePath, generatedBuffer);

    const publicUrl = `/output/${fileName}`;

    return NextResponse.json(
      { images: [publicUrl] },
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
      { error: "请求 Vertex 失败，请确认网络或凭据配置。" },
      { status: 500 }
    );
  }
}
