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

async function extractListingsWithAi(text: string, source: SourceConfig) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Extract real Pakistan jobs, scholarships, admissions, or career guides from the supplied webpage. Return JSON with an items array. Do not invent data. Use null when unknown. Each item must have title, description, deadline, applyLink, organization, location, country, content, metaTitle, and metaDescription.",
        },
        {
          role: "user",
          content: JSON.stringify({ source, webpage: text.slice(0, 12000) }),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
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
      const aiItems = await extractListingsWithAi(text, source);
      const items = aiItems?.length ? aiItems : [{
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
      }];

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
          applyLink: item.applyLink || source.sourceUrl,
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
