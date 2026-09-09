export type DraftType = "government_job" | "private_job" | "scholarship" | "admission";

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
  isOpen?: boolean | null;
  status?: string | null;
};

export const DEFAULT_SOURCE_CONFIGS: SourceConfig[] = [
  { type: "government_job", sourceName: "FPSC Jobs", sourceUrl: "https://www.fpsc.gov.pk/jobs/" },
  { type: "government_job", sourceName: "Punjab Public Service Commission", sourceUrl: "https://ppsc.gop.pk/" },
  { type: "government_job", sourceName: "Sindh Public Service Commission", sourceUrl: "https://spsc.gov.pk/" },
  { type: "government_job", sourceName: "Khyber Pakhtunkhwa Public Service Commission", sourceUrl: "https://kppsc.gov.pk/" },
  { type: "government_job", sourceName: "Balochistan Public Service Commission", sourceUrl: "https://bpsc.gob.pk/" },
  { type: "government_job", sourceName: "Azad Jammu and Kashmir Public Service Commission", sourceUrl: "https://ajkpsc.gov.pk/" },
  { type: "government_job", sourceName: "National Jobs Portal Pakistan", sourceUrl: "https://njp.gov.pk/" },
  { type: "government_job", sourceName: "Pakistan Army Jobs", sourceUrl: "https://www.joinpakarmy.gov.pk/" },
  { type: "government_job", sourceName: "Pakistan Navy Jobs", sourceUrl: "https://www.joinpaknavy.gov.pk/" },
  { type: "government_job", sourceName: "Pakistan Air Force Jobs", sourceUrl: "https://joinpaf.gov.pk/" },
  { type: "private_job", sourceName: "NTS Jobs", sourceUrl: "https://www.nts.org.pk/" },
  { type: "private_job", sourceName: "Rozee.pk", sourceUrl: "https://www.rozee.pk/" },
  { type: "private_job", sourceName: "Mustakbil Jobs", sourceUrl: "https://www.mustakbil.com/" },
  { type: "private_job", sourceName: "BrightSpyre Jobs", sourceUrl: "https://www.brightspyre.com/" },
  { type: "private_job", sourceName: "Indeed Pakistan", sourceUrl: "https://pk.indeed.com/" },
  { type: "private_job", sourceName: "LinkedIn Jobs Pakistan", sourceUrl: "https://www.linkedin.com/jobs/" },
  { type: "scholarship", sourceName: "HEC Scholarships", sourceUrl: "https://hec.gov.pk/english/services/students/Pages/Scholarships.aspx" },
  { type: "scholarship", sourceName: "National ICT R&D Fund", sourceUrl: "https://ignite.org.pk/" },
  { type: "scholarship", sourceName: "Pakistan Education Endowment Fund", sourceUrl: "https://www.peef.org.pk/" },
  { type: "scholarship", sourceName: "Fulbright Pakistan", sourceUrl: "https://usefp.org/scholarships/fulbright-degree.cfm" },
  { type: "scholarship", sourceName: "Aga Khan Foundation Pakistan", sourceUrl: "https://www.akdn.org/where-we-work/south-asia/pakistan" },
  { type: "scholarship", sourceName: "Commonwealth Scholarships Pakistan", sourceUrl: "https://www.hec.gov.pk/english/scholarshipsgrants/lao/Pages/Commonwealth.aspx" },
  { type: "scholarship", sourceName: "Islamic Development Bank Scholarships", sourceUrl: "https://www.isdb.org/scholarships" },
  { type: "admission", sourceName: "HEC Recognized Universities", sourceUrl: "https://www.hec.gov.pk/english/universities/Pages/default.aspx" },
  { type: "admission", sourceName: "National University of Sciences and Technology", sourceUrl: "https://nust.edu.pk/admissions/" },
  { type: "admission", sourceName: "COMSATS University Admissions", sourceUrl: "https://islamabad.comsats.edu.pk/admissions.aspx" },
  { type: "admission", sourceName: "University of the Punjab Admissions", sourceUrl: "https://pu.edu.pk/page/show/admissions" },
  { type: "admission", sourceName: "University of Karachi Admissions", sourceUrl: "https://uok.edu.pk/admissions/" },
  { type: "admission", sourceName: "LUMS Admissions", sourceUrl: "https://admissions.lums.edu.pk/" },
  { type: "admission", sourceName: "Virtual University Admissions", sourceUrl: "https://www.vu.edu.pk/Admissions/Admissions" },
  { type: "admission", sourceName: "Allama Iqbal Open University Admissions", sourceUrl: "https://www.aiou.edu.pk/admissions" },
  { type: "admission", sourceName: "University of Engineering and Technology Lahore Admissions", sourceUrl: "https://uet.edu.pk/admission/" },
  { type: "admission", sourceName: "University of Peshawar Admissions", sourceUrl: "https://www.uop.edu.pk/admissions/" },
  { type: "admission", sourceName: "Aga Khan University Admissions", sourceUrl: "https://www.aku.edu/admissions/Pages/home.aspx" },
  { type: "admission", sourceName: "Institute of Business Administration Karachi Admissions", sourceUrl: "https://www.iba.edu.pk/admissions.php" },
  { type: "admission", sourceName: "University of Agriculture Faisalabad Admissions", sourceUrl: "https://uaf.edu.pk/admissions/" },
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

function chooseSpecificLink(candidate: string | null | undefined, pageLinks: Array<{ title: string; url: string }>, sourceUrl: string) {
  if (!candidate) return pageLinks[0]?.url || sourceUrl;
  try {
    const candidateUrl = new URL(candidate, sourceUrl).toString();
    if (candidateUrl === sourceUrl) return pageLinks[0]?.url || sourceUrl;
    return pageLinks.some((link) => link.url === candidateUrl) ? candidateUrl : pageLinks[0]?.url || sourceUrl;
  } catch {
    return pageLinks[0]?.url || sourceUrl;
  }
}

function toSentenceCase(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function cleanListingTitle(value: string) {
  const cities = "Islamabad|Lahore|Karachi|Rawalpindi|Peshawar|Quetta|Multan|Faisalabad|Gujranwala|Sialkot|Hyderabad|Bahawalpur|Sukkur|Abbottabad|Mardan|Mingora";
  return value
    .replace(new RegExp(`\\s*[-|,:()]?\\s*\\b(${cities})\\b\\s*[-|,:()]?\\s*`, "gi"), " ")
    .replace(/\s+/g, " ")
    .replace(/^[-|,:]+|[-|,:]+$/g, "")
    .trim();
}

function isOpenListing(item: ExtractedListing, deadline: Date | null) {
  if (item.isOpen === false) return false;
  if (item.status && /closed|expired|filled|not accepting|ended/i.test(item.status)) return false;
  if (/closed|expired|position filled|applications? (are )?closed|admissions? ended/i.test(`${item.title} ${item.description}`)) return false;
  return !(deadline && deadline.getTime() < Date.now());
}

function nearbyDetail(text: string, title: string) {
  const index = text.toLowerCase().indexOf(title.toLowerCase());
  if (index < 0) return text.slice(0, 1200);
  return text.slice(Math.max(0, index - 200), Math.min(text.length, index + 1400)).trim();
}

function conciseDescription(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 3500);
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
          text: "Extract only currently open Pakistan opportunities from the supplied webpage: government or private vacancies, university admissions, scholarships, or career programs. Return one item per distinct opportunity, never one item for the whole website. Exclude closed, expired, filled, archived, duplicate, or announcement-only items. The title must contain only the job/program/scholarship name, never a city name. Keep each description concise and factual, maximum 3500 characters, containing only the organization, role or program, eligibility, education/experience, documents, fee if stated, deadline, and how to apply. Do not copy the whole webpage or navigation. Use the exact matching URL from pageLinks as applyLink. Never use the source homepage as applyLink when a specific listing URL exists. Do not invent data. Use null when unknown. Return JSON with an items array and isOpen/status fields.",
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
      const items: ExtractedListing[] = aiItems?.length ? aiItems : pageLinks.filter((link) => !/closed|expired|archive|past papers|results/i.test(link.title)).map((link) => ({
        title: link.title,
        organization: source.sourceName,
        location: "Pakistan",
        country: "Pakistan",
        deadline: null,
        description: nearbyDetail(text, link.title),
        applyLink: link.url,
        content: link.title,
        metaTitle: `${link.title} - Pakistan`,
        metaDescription: nearbyDetail(text, link.title).slice(0, 180),
        isOpen: true,
      }));

      if (items.length === 0) {
        items.push({
          title: toSentenceCase(source.sourceName),
          organization: source.sourceName,
          location: "Pakistan",
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
        const title = cleanListingTitle(item.title || "");
        if (!title || !item.description?.trim()) continue;
        const deadline = item.deadline ? new Date(item.deadline) : null;
        if (!isOpenListing(item, deadline)) continue;
        drafts.push({
          type: source.type,
          sourceName: source.sourceName,
          sourceUrl: source.sourceUrl,
          title,
          organization: item.organization || source.sourceName,
          location: item.location || "Pakistan",
          country: item.country || "Pakistan",
          deadline: deadline && !Number.isNaN(deadline.getTime()) ? deadline : null,
          description: conciseDescription(item.description),
          applyLink: chooseSpecificLink(item.applyLink, pageLinks, source.sourceUrl),
          content: conciseDescription(item.content || item.description),
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
