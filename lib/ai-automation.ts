export type DraftType = "government_job" | "private_job" | "scholarship" | "admission" | "career_guide";

export type SourceConfig = {
  type: DraftType;
  sourceName: string;
  sourceUrl: string;
};

type ExtractedListing = {
  title: string;
  organization?: string | null;
  location?: string | null;
  country?: string | null;
  deadline?: string | null;
  description: string;
  applyLink?: string | null;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export const DEFAULT_SOURCE_CONFIGS: SourceConfig[] = [
  { type: "government_job", sourceName: "FPSC Jobs", sourceUrl: "https://www.fpsc.gov.pk/jobs/" },
  { type: "government_job", sourceName: "Punjab Public Service Commission", sourceUrl: "https://ppsc.gop.pk/" },
  { type: "private_job", sourceName: "NTS Jobs", sourceUrl: "https://www.nts.org.pk/" },
  { type: "private_job", sourceName: "Rozee.pk", sourceUrl: "https://www.rozee.pk/" },
  { type: "scholarship", sourceName: "HEC Scholarships", sourceUrl: "https://hec.gov.pk/english/services/students/Pages/Scholarships.aspx" },
  { type: "scholarship", sourceName: "Punjab Educational Endowment Fund", sourceUrl: "https://peef.org.pk/" },
  { type: "admission", sourceName: "University Admissions", sourceUrl: "https://www.hec.gov.pk/english/universities/Pages/default.aspx" },
  { type: "career_guide", sourceName: "Career Guidance Pakistan", sourceUrl: "https://www.careerpakistan.pk/" },
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `draft-${Date.now()}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPageLinks(html: string, sourceUrl: string) {
  const links: Array<{ title: string; url: string }> = [];
  const baseUrl = new URL(sourceUrl);
  const linkPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null && links.length < 100) {
    const title = stripHtml(match[2]);
    if (title.length < 8 || /^(home|login|logout|menu|read more|click here|contact us)$/i.test(title)) continue;

    try {
      const url = new URL(match[1], baseUrl).toString();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        links.push({ title, url });
      }
    } catch {
      // Ignore malformed links from source pages.
    }
  }

  return links;
}

function toSentenceCase(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function extractDeadlineFromText(value: string) {
  const match = value.match(/(\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-zA-Z]*[-/ ]\d{2,4}|\d{1,2}[-/ ]\d{1,2}[-/ ]\d{2,4})/i);
  if (!match) return null;
  const raw = match[1].replace(/\s+/g, " ");
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function extractListingsWithAi(text: string, pageLinks: Array<{ title: string; url: string }>, source: SourceConfig) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.AI_MODEL || "gemini-2.0-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: "Extract each distinct real Pakistan job, scholarship, admission opportunity, or career guide from the supplied webpage. Return one item per distinct opportunity, never one item for the whole website. Use the exact matching URL from pageLinks as applyLink. Never use the source homepage as applyLink when a specific listing URL exists. Do not invent data. Use null when unknown. Return JSON with an items array; each item must have title, description, deadline, applyLink, organization, location, country, content, metaTitle, and metaDescription.",
        }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify({ source, pageLinks, webpage: text.slice(0, 12000) }) }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as { items?: ExtractedListing[] };
    return Array.isArray(parsed.items) ? parsed.items : null;
  } catch {
    return null;
  }
}

export async function scanSourcesForDrafts(sourceConfigs: SourceConfig[] = DEFAULT_SOURCE_CONFIGS) {
  const drafts: Array<{
    type: DraftType;
    sourceName: string;
    sourceUrl: string;
    title: string;
    organization?: string | null;
    location?: string | null;
    country?: string | null;
    deadline?: Date | null;
    description: string;
    applyLink?: string | null;
    content?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }> = [];

  for (const source of sourceConfigs) {
    try {
      const res = await fetch(source.sourceUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const html = await res.text();
      const text = stripHtml(html);
      const pageLinks = extractPageLinks(html, source.sourceUrl);
      const aiItems = await extractListingsWithAi(text, pageLinks, source);
      const items = aiItems?.length ? aiItems : pageLinks.map((link) => ({
        title: link.title,
        organization: source.sourceName,
        location: "Pakistan",
        country: "Pakistan",
        deadline: null,
        description: `Review this ${source.type.replace("_", " ")} from ${source.sourceName}.`,
        applyLink: link.url,
        content: link.title,
        metaTitle: `${link.title} - Pakistan`,
        metaDescription: `Potential ${source.type.replace("_", " ")} from ${source.sourceName}.`,
      }));

      if (items.length === 0) {
        items.push({
          title: toSentenceCase(source.sourceName),
          organization: source.sourceName,
          location: /pakistan|islamabad|lahore|karachi|rawalpindi|peshawar|multan|quetta|faisalabad|sindh|punjab|kpk|balochistan/i.test(text) ? "Pakistan" : null,
          country: "Pakistan",
          deadline: extractDeadlineFromText(text)?.toISOString() || null,
          description: (text.slice(0, 3000) || `${source.sourceName} listing`),
          applyLink: source.sourceUrl,
          content: text.slice(0, 3000),
          metaTitle: `${toSentenceCase(source.sourceName)} - Pakistan`,
          metaDescription: text.slice(0, 180),
        });
      }

      for (const item of items) {
        const title = item.title?.trim();
        if (!title || !item.description?.trim()) continue;
        const deadline = item.deadline ? new Date(item.deadline) : null;
        drafts.push({
          type: source.type,
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          title,
          organization: item.organization || source.sourceName,
          location: item.location || "Pakistan",
          country: item.country || "Pakistan",
          deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : null,
          description: item.description,
          applyLink: item.applyLink || pageLinks[0]?.url || source.sourceUrl,
          content: item.content || item.description,
          metaTitle: item.metaTitle || `${title} - Pakistan`,
          metaDescription: item.metaDescription || item.description.slice(0, 180),
        });
      }
    } catch {
      // Ignore unreachable sources and continue with the rest.
    }
  }

  return drafts;
}
