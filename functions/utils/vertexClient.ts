import { VertexAI } from "@google-cloud/vertexai";

// 你的 Google Cloud 项目信息
const PROJECT_ID = process.env.GCLOUD_PROJECT || "smartpicture-ai";
const LOCATION = "us-central1"; // 可改为 asia-east1 / asia-northeast1

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * ✨ 使用 Vertex AI 自动总结用户数据
 * @param input 用户的统计数据与元信息
 */
export async function vertexSummarize(input: any): Promise<string> {
  const prompt = `
你是一位智能分析助手。根据以下用户统计数据，总结今日洞察：

用户ID: ${input.userId}
等级: ${input.meta?.level}
邮箱: ${input.meta?.email}
统计数据: ${JSON.stringify(input.stats, null, 2)}

请生成一句简短的中文总结。
`;

  try {
    const result = await model.generateContent(prompt);
    const summary =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "无法生成摘要";
    return summary;
  } catch (err) {
    console.error("❌ Vertex AI summarization error:", err);
    return "生成失败";
  }
}
