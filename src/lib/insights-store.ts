import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { GeneratedArticle } from "@/lib/generate-article-flow";
import { slugify } from "@/lib/slugify";

const DATA_DIR = path.join(process.cwd(), "data");
const INSIGHTS_FILE = path.join(DATA_DIR, "insights.json");

export type InsightArticle = GeneratedArticle & {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  source: "manual" | "auto";
  scheduleId?: string;
};

async function ensureStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(INSIGHTS_FILE);
  } catch {
    await fs.writeFile(INSIGHTS_FILE, "[]", "utf8");
  }
}

async function readRawInsights(): Promise<InsightArticle[]> {
  await ensureStorage();
  const raw = await fs.readFile(INSIGHTS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as InsightArticle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse insights.json, resetting file.", error);
    await fs.writeFile(INSIGHTS_FILE, "[]", "utf8");
    return [];
  }
}

async function writeRawInsights(list: InsightArticle[]) {
  await ensureStorage();
  await fs.writeFile(INSIGHTS_FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function listInsightArticles(): Promise<InsightArticle[]> {
  const articles = await readRawInsights();
  return articles.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

type AppendOptions = {
  source: "manual" | "auto";
  scheduleId?: string;
};

export async function appendInsightArticle(
  article: GeneratedArticle,
  options: AppendOptions
): Promise<InsightArticle> {
  const articles = await readRawInsights();
  const now = new Date();
  const iso = now.toISOString();
  const slugBase = slugify(article.title || article.topic, { maxLength: 60 });
  let slug = slugBase;
  let counter = 2;
  const existingSlugs = new Set(articles.map((item) => item.slug));
  while (existingSlugs.has(slug)) {
    slug = `${slugBase}-${counter++}`;
  }

  const record: InsightArticle = {
    ...article,
    id: randomUUID(),
    slug,
    createdAt: iso,
    updatedAt: iso,
    source: options.source,
    scheduleId: options.scheduleId,
  };

  articles.push(record);
  await writeRawInsights(articles);
  return record;
}

export async function getInsightBySlug(slug: string) {
  const articles = await readRawInsights();
  return articles.find((item) => item.slug === slug) ?? null;
}

export async function countInsightsForDate(dateISO: string) {
  const dayPrefix = dateISO.slice(0, 10);
  const articles = await readRawInsights();
  return articles.filter((item) => item.createdAt.startsWith(dayPrefix)).length;
}

export async function getLatestInsightArticles(limit = 20) {
  const all = await listInsightArticles();
  return all.slice(0, limit);
}
