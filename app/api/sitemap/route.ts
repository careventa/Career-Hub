import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let jobs: Array<{ slug: string }> = [];
  let scholarships: Array<{ slug: string }> = [];
  let articles: Array<{ slug: string }> = [];

  try {
    [jobs, scholarships, articles] = await Promise.all([
      prisma.job.findMany({ select: { slug: true } }),
      prisma.scholarship.findMany({ select: { slug: true } }),
      prisma.article.findMany({ select: { slug: true } }),
    ]);
  } catch (error) {
    console.warn("Sitemap data unavailable, serving fallback URLs:", error);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const pages = ["/", "/jobs", "/scholarships", "/admissions", "/career-guides"];
  pages.forEach((p: string) => {
    xml += `<url><loc>${base}${p}</loc></url>`;
  });

  jobs.forEach((j: { slug: string }) => {
    xml += `<url><loc>${base}/jobs/${j.slug}</loc></url>`;
  });
  scholarships.forEach((s: { slug: string }) => {
    xml += `<url><loc>${base}/scholarships/${s.slug}</loc></url>`;
  });
  articles.forEach((a: { slug: string }) => {
    xml += `<url><loc>${base}/articles/${a.slug}</loc></url>`;
  });

  xml += "</urlset>";
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
