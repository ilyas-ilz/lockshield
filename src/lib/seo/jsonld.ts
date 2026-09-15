// WHY plain-object builders, not something bound to Mongoose docs: every
// function here takes/returns plain JSON and is pure, so it's unit
// testable without a DB and directly serializable into a <script
// type="application/ld+json"> tag by whatever frontend eventually renders
// it. This is the auto-JSON-LD layer from the design doc — one source of
// truth (Settings + the content doc) instead of hand-written schema blobs
// per page.

export interface OrgInput {
  legalName: string;
  siteUrl: string;
  logoUrl?: string;
  phones: string[];
  emails: string[];
  address: { poBox?: string; street: string; locality: string; country: string };
  geo?: { lat: number; lng: number };
  socials: { url: string }[];
  partnerLinks: { url: string }[];
}

/** LocalBusiness + Organization, site-wide. `sameAs` includes social profiles AND the cart partner domain — this is the real, crawlable backlink signal (see Settings.partnerLinks doc comment). */
export function buildLocalBusinessSchema(org: OrgInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: org.legalName,
    url: org.siteUrl,
    ...(org.logoUrl ? { logo: org.logoUrl, image: org.logoUrl } : {}),
    telephone: org.phones[0],
    email: org.emails[0],
    address: {
      "@type": "PostalAddress",
      postOfficeBoxNumber: org.address.poBox,
      streetAddress: org.address.street,
      addressLocality: org.address.locality,
      addressCountry: org.address.country,
    },
    ...(org.geo ? { geo: { "@type": "GeoCoordinates", latitude: org.geo.lat, longitude: org.geo.lng } } : {}),
    areaServed: "AE",
    sameAs: [...org.socials.map((s) => s.url), ...org.partnerLinks.map((p) => p.url)],
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleSchema(post: {
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date | string;
  updatedAt: Date | string;
  authorName: string;
  publisherName?: string;
  publisherLogoUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: post.url,
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: { "@type": "Person", name: post.authorName },
    ...(post.publisherName
      ? {
          publisher: {
            "@type": "Organization",
            name: post.publisherName,
            ...(post.publisherLogoUrl ? { logo: { "@type": "ImageObject", url: post.publisherLogoUrl } } : {}),
          },
        }
      : {}),
  };
}

export function buildFaqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildServiceSchema(svc: { name: string; description: string; url: string; providerName: string; areaServed?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    description: svc.description,
    url: svc.url,
    provider: { "@type": "LocalBusiness", name: svc.providerName },
    areaServed: svc.areaServed ?? "AE",
  };
}

export function buildJobPostingSchema(job: {
  title: string;
  description: string;
  datePosted: Date | string;
  validThrough?: Date | string | null;
  employmentType: string;
  hiringOrgName: string;
  hiringOrgUrl: string;
  locality: string;
  country: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: new Date(job.datePosted).toISOString(),
    ...(job.validThrough ? { validThrough: new Date(job.validThrough).toISOString() } : {}),
    employmentType: job.employmentType.toUpperCase().replace("-", "_"),
    hiringOrganization: { "@type": "Organization", name: job.hiringOrgName, sameAs: job.hiringOrgUrl },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.locality, addressCountry: job.country },
    },
  };
}

export function buildItemListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, url: item.url })),
  };
}
