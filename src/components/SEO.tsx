import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "MatchNexx | AI Job Matching, Talent Pipeline & CV Intelligence";
const DEFAULT_DESCRIPTION =
  "MatchNexx bridges elite tech talent and recruiters with AI-driven CV structuring, live application pipeline tracking, and instant candidate matching.";
const DEFAULT_KEYWORDS =
  "MatchNexx, tech jobs, tech recruitment Nigeria, AI resume builder, CV structurer, recruiter talent pool, developer jobs, job matching, remote jobs Africa";
const BASE_URL = "https://match-nexx.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

function setMetaTag(selector: string, attribute: string, value: string, createAttr: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    Object.entries(createAttr).forEach(([k, v]) => element?.setAttribute(k, v));
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setLinkTag(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = "",
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title
      ? `${title} | MatchNexx`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', "content", description, { name: "description" });
    setMetaTag('meta[name="keywords"]', "content", keywords, { name: "keywords" });
    setMetaTag(
      'meta[name="robots"]',
      "content",
      noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      { name: "robots" }
    );

    // 3. Canonical URL
    const canonicalUrl = `${BASE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
    setLinkTag("canonical", canonicalUrl);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', "content", formattedTitle, { property: "og:title" });
    setMetaTag('meta[property="og:description"]', "content", description, { property: "og:description" });
    setMetaTag('meta[property="og:url"]', "content", canonicalUrl, { property: "og:url" });
    setMetaTag('meta[property="og:type"]', "content", ogType, { property: "og:type" });
    setMetaTag('meta[property="og:image"]', "content", ogImage, { property: "og:image" });

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', "content", formattedTitle, { name: "twitter:title" });
    setMetaTag('meta[name="twitter:description"]', "content", description, { name: "twitter:description" });
    setMetaTag('meta[name="twitter:image"]', "content", ogImage, { name: "twitter:image" });

    // 6. JSON-LD Structured Data
    let scriptTag: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      scriptTag.id = "page-jsonld";
      scriptTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [title, description, keywords, canonicalPath, ogType, ogImage, noindex, jsonLd]);

  return null;
}
