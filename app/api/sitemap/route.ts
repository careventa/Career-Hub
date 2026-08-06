import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs: Array<{ slug: string }> = await prisma.job.findMany({ select: { slug: true } });
  const scholarships: Array<{ slug: string }> = await prisma.scholarship.findMany({ select: { slug: true } });
  const articles: Array<{ slug: string }> = await prisma.article.findMany({ select: { slug: true } });

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
