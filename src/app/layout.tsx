import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { baseMetadata, siteConfig } from "@/config/site";

export const metadata = baseMetadata;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}#organization`,
  name: siteConfig.organization.legalName,
  url: siteConfig.organization.url,
  logo: `${siteConfig.url}${siteConfig.organization.logo}`,
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "customer support",
      availableLanguage: ["zh-CN", "en-US"],
    },
  ],
  sameAs: siteConfig.organization.sameAs,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
        <JsonLd id="organization-json-ld" data={organizationJsonLd} />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans">
        <ClientBody>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </ClientBody>
      </body>
    </html>
  );
}
