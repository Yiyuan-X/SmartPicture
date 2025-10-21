import type { Metadata } from "next";
import { baseMetadata, siteConfig } from "@/config/site";

export type CreateMetadataOptions = {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  robots?: Metadata["robots"];
  openGraph?: Partial<NonNullable<Metadata["openGraph"]>>;
  alternates?: Metadata["alternates"];
};

export function buildCanonicalUrl(path?: string): string {
  if (!path) {
    return siteConfig.url;
  }

  try {
    return new URL(path, siteConfig.url).toString();
  } catch {
    return siteConfig.url;
  }
}

export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const { title, description, keywords, path, robots, openGraph, alternates } = options;
  const resolvedTitle = title ? `${title} | ${siteConfig.shortName}` : undefined;
  const canonicalUrl = buildCanonicalUrl(path);

  const mergedOpenGraph = {
    ...baseMetadata.openGraph,
    ...openGraph,
    title: openGraph?.title ?? resolvedTitle ?? baseMetadata.openGraph?.title,
    description: openGraph?.description ?? description ?? baseMetadata.openGraph?.description,
    url: openGraph?.url ?? canonicalUrl,
    images: openGraph?.images ?? baseMetadata.openGraph?.images,
  };

  const mergedTwitter = {
    ...baseMetadata.twitter,
    title: openGraph?.title ?? resolvedTitle ?? baseMetadata.twitter?.title,
    description: openGraph?.description ?? description ?? baseMetadata.twitter?.description,
    images: openGraph?.images ?? baseMetadata.twitter?.images,
  };

  return {
    ...baseMetadata,
    title: resolvedTitle ?? baseMetadata.title,
    description: description ?? baseMetadata.description,
    keywords: keywords ?? baseMetadata.keywords,
    alternates: {
      ...baseMetadata.alternates,
      canonical: canonicalUrl,
      ...alternates,
    },
    robots: robots ?? baseMetadata.robots,
    openGraph: mergedOpenGraph,
    twitter: mergedTwitter,
  };
}

export function toJsonLd(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
