import { getGenerativeModel } from "@/lib/vertex";
import { getGoogleErrorStatusCode } from "@/lib/google-errors";

export type GeneratedArticle = {
  topic: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  summary: string;
  outline: string[];
  content: string;
  tableSummary: {
    section: string;
    insight: string;
  }[];
  actionCallouts: string[];
  shareSnippets: {
    platform: "facebook" | "linkedin" | "x" | "wechat";
    message: string;
  }[];
  id?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: "manual" | "auto";
  scheduleId?: string;
};

const MODEL_ID = process.env.ARTICLE_MODEL_ID ?? "gemini-1.5-pro-001";

const articlePrompt = (topic: string) => `You are an elite content strategist for the SmartPicture platform.
Generate a long-form article optimised for both SEO and AEO (AI Engine Optimisation) using the topic below.

Instructions:
1. ALWAYS write in zh-CN.
2. Create a compelling H1 title containing the main keyword.
3. Provide an SEO title (<= 60 chars) and SEO meta description (120-160 chars) in Chinese.
4. Produce a comma separated list of 8-12 long-tail keywords.
5. Generate a 2-3 sentence executive summary aimed at business decision makers.
6. Provide a bullet outline of all sections before the main content.
7. Create the full article using semantic HTML headings (H2, H3) with short paragraphs, numbered steps, comparison tables, and call-to-action hints that highlight SmartPicture value. 
8. Include data points or referenced statistics where relevant (you may synthesise credible numbers labelled as行业调研).
9. Summarise main takeaways in a final table with columns【章节】and【关键洞察】.
10. Provide 3 actionable callouts that readers can implement immediately.
11. Draft shareable snippets for Facebook, LinkedIn, X, and WeChat Moments, each within that platform's best practice char limit, referencing SmartPicture.

Topic: ${topic}
Return the answer strictly in JSON with keys: title, seoTitle, seoDescription, keywords (array), summary, outline (array), content (string with HTML markup allowed), tableSummary (array of {section, insight}), actionCallouts (array), shareSnippets (array of {platform, message}).`;

export async function generateArticleForTopic(topic: string): Promise<GeneratedArticle> {
  const trimmedTopic = topic.trim();
  if (!trimmedTopic) {
    throw new Error("请输入文章主题。");
  }

  const model = getGenerativeModel({ model: MODEL_ID });
  const prompt = articlePrompt(trimmedTopic);

  let result;
  try {
    result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
  } catch (error) {
    const statusCode = getGoogleErrorStatusCode(error);
    if (statusCode === 429) {
      const quotaError = new Error("文章生成请求过于频繁，请稍后重试或在 Google Cloud 控制台提升 Vertex AI 配额。");
      (quotaError as { status?: number }).status = 429;
      throw quotaError;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }

  const raw = result.response?.candidates?.[0]?.content?.parts?.[0];
  const text = (raw && "text" in raw ? raw.text : undefined) ?? "";

  if (!text) {
    throw new Error("未获取到生成内容，请稍后重试。");
  }

  try {
    const parsed = JSON.parse(text) as Omit<GeneratedArticle, "topic">;
    return {
      topic: trimmedTopic,
      title: parsed.title,
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      keywords: parsed.keywords ?? [],
      summary: parsed.summary,
      outline: parsed.outline ?? [],
      content: parsed.content,
      tableSummary: parsed.tableSummary ?? [],
      actionCallouts: parsed.actionCallouts ?? [],
      shareSnippets: parsed.shareSnippets ?? [],
    };
  } catch (error) {
    console.error("Failed to parse article JSON:", error, text);
    throw new Error("文章生成格式解析失败，请稍后再试。");
  }
}
