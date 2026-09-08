export type DraftType = "government_job" | "private_job" | "scholarship" | "admission" | "career_guide";

export type SourceConfig = {
  type: DraftType;
  sourceName: string;
  sourceUrl: string;
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
      const snippet = text.slice(0, 1200) || `${source.sourceName} listing`;
      const title = toSentenceCase(source.sourceName);
      const description = snippet.length > 3000 ? `${snippet.slice(0, 3000)}...` : snippet;
      const deadline = extractDeadlineFromText(text);
      const location = /pakistan|islamabad|lahore|karachi|rawalpindi|peshawar|multan|quetta|faisalabad|sindh|punjab|kpk|balochistan/i.test(text)
        ? "Pakistan"
        : null;
      const country = "Pakistan";
      const applyLink = source.sourceUrl;

      drafts.push({
        type: source.type,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        title,
        organization: source.sourceName,
        location,
        country,
        deadline: deadline ?? null,
        description,
        applyLink,
        content: description,
        metaTitle: `${title} - Pakistan`,
        metaDescription: description.slice(0, 180),
      });
    } catch {
      // Ignore unreachable sources and continue with the rest.
    }
  }

  return drafts;
}
