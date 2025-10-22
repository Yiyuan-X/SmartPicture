import Head from "next/head";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeModules, getHomeStats, heroTestimonial, homePageJsonLd } from "@/data/home";
import { resolveIcon } from "@/lib/icon-registry";
import { createMetadata } from "@/lib/metadata";

const homeModules = getHomeModules();
const homeStats = getHomeStats();

const ArrowRightIcon = resolveIcon("arrow-right");
const SparklesIcon = resolveIcon("sparkles");

const toUrlString = (value: string | URL | undefined): string | undefined => {
  if (!value) return undefined;
  return value instanceof URL ? value.toString() : value;
};

// ✅ Metadata 对象
const pageMetadata = createMetadata({
  title: "AI 视觉中枢与智能内容增长平台",
  description:
    "SmartPicture 提供创意工作室、内容助理、多媒体枢纽、知识库、智能洞察和截图工具等模块，统一 AI 网关助力品牌团队高效增长。",
  path: "/",
});

// ✅ 安全解析标题
const metadataTitle =
  typeof pageMetadata.title === "string"
    ? pageMetadata.title
    : pageMetadata.title?.toString?.() ?? "SmartPicture";

// ✅ 解析 canonical 链接
const canonicalUrl =
  typeof pageMetadata.alternates?.canonical === "string"
    ? pageMetadata.alternates.canonical
    : undefined;

// ✅ OG 图片处理
const openGraphImage = Array.isArray(pageMetadata.openGraph?.images)
  ? pageMetadata.openGraph?.images?.[0]
  : pageMetadata.openGraph?.images;

const openGraphImageObject =
  openGraphImage && typeof openGraphImage === "object" && "url" in openGraphImage
    ? openGraphImage
    : undefined;

const openGraphImageUrl =
  typeof openGraphImage === "string"
    ? openGraphImage
    : openGraphImage instanceof URL
    ? openGraphImage.toString()
    : toUrlString(openGraphImageObject?.url);

const openGraphImageWidth =
  typeof openGraphImageObject?.width === "number"
    ? String(openGraphImageObject.width)
    : undefined;

const openGraphImageHeight =
  typeof openGraphImageObject?.height === "number"
    ? String(openGraphImageObject.height)
    : undefined;

const openGraphImageAlt =
  typeof openGraphImageObject?.alt === "string"
    ? openGraphImageObject.alt
    : undefined;

// ✅ Twitter Metadata 兼容处理
const twitterTitle =
  typeof pageMetadata.twitter?.title === "string"
    ? pageMetadata.twitter?.title
    : pageMetadata.twitter?.title?.toString?.();

const twitterDescription = pageMetadata.twitter?.description
  ? String(pageMetadata.twitter.description)
  : undefined;

const twitterImageValue = Array.isArray(pageMetadata.twitter?.images)
  ? pageMetadata.twitter?.images?.[0]
  : pageMetadata.twitter?.images;

const twitterImage = toUrlString(
  typeof twitterImageValue === "string" || twitterImageValue instanceof URL
    ? twitterImageValue
    : undefined
);

export default function Home() {
  return (
    <>
      <Head>
        <title>{metadataTitle}</title>
        {pageMetadata.description && (
          <meta name="description" content={pageMetadata.description} />
        )}
        {pageMetadata.keywords && pageMetadata.keywords.length > 0 && (
          <meta
            name="keywords"
            content={Array.isArray(pageMetadata.keywords)
              ? pageMetadata.keywords.join(", ")
              : String(pageMetadata.keywords)}
          />
        )}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {pageMetadata.openGraph?.title && (
          <meta property="og:title" content={String(pageMetadata.openGraph.title)} />
        )}
        {pageMetadata.openGraph?.description && (
          <meta
            property="og:description"
            content={String(pageMetadata.openGraph.description)}
          />
        )}
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:type" content="website" />
        {openGraphImageUrl && <meta property="og:image" content={openGraphImageUrl} />}
        {openGraphImageWidth && (
          <meta property="og:image:width" content={openGraphImageWidth} />
        )}
        {openGraphImageHeight && (
          <meta property="og:image:height" content={openGraphImageHeight} />
        )}
        {openGraphImageAlt && (
          <meta property="og:image:alt" content={openGraphImageAlt} />
        )}
        {/* ✅ Twitter Meta 修正 */}
        <meta name="twitter:card" content="summary_large_image" />
        {twitterTitle && <meta name="twitter:title" content={String(twitterTitle)} />}
        {twitterDescription && (
          <meta name="twitter:description" content={String(twitterDescription)} />
        )}
        {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      </Head>

      {/* ✅ 页面主体不变 */}
      <div className="space-y-20 bg-gradient-to-b from-yellow-50 via-white to-orange-50 pb-24">
        <JsonLd id="home-json-ld" data={homePageJsonLd} />

        <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 md:flex-row md:items-center">
            <div className="space-y-6 md:w-1/2">
              <Badge className="bg-orange-100 text-orange-700">vision-core 产品路线</Badge>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                SmartPicture：面向客户成果的轻量 AI 中枢。
              </h1>
              <p className="text-lg text-gray-700">
                构建贴合业务目标的增长漏斗——一站式完成品牌视觉生成、图像洞察与长内容激活，所有模块共用统一的 AI 网关与用户画像。
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                >
                  <Link href="/creative-suite" className="inline-flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4" />
                    立即体验创意工作室
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  asChild
                >
                  <Link href="#modules" className="inline-flex items-center gap-2">
                    查看产品矩阵
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-orange-200 bg-white/80 p-6 shadow-lg md:w-1/2">
              <div className="flex flex-wrap justify-between gap-3">
                {homeStats.map((stat) => (
                  <div key={stat.label} className="min-w-[150px] flex-1">
                    <h3 className="text-3xl font-semibold text-orange-500">{stat.value}</h3>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm text-gray-600">
                {heroTestimonial}
              </div>
            </Card>
          </div>
        </section>

        {/* ✅ 模块区保持原样 */}
        <section id="modules" className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="space-y-3 text-center">
            <Badge className="bg-orange-100 text-orange-700">功能模块</Badge>
            <h2 className="text-3xl font-semibold text-gray-900">轻量核心，可插拔创意扩展</h2>
            <p className="text-gray-600">
              选择最能帮助客户达成下一阶段目标的模块。所有体验共用认证、积分与增长系统，统一计费与留存体验。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {homeModules.map((module) => {
              const Icon = resolveIcon(module.icon);
              return (
                <Card
                  key={module.id}
                  className="flex h-full flex-col justify-between border-orange-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-700 shadow-inner">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-orange-500">{module.id}</p>
                        <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-orange-600">{module.promise}</p>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    asChild
                    className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                  >
                    <Link href={module.href} className="inline-flex items-center justify-center gap-2">
                      查看模块详情
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
