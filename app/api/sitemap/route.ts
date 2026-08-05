import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.job.findMany();
  const scholarships = await prisma.scholarship.findMany();
  const articles = await prisma.article.findMany();

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const pages = ["/", "/jobs", "/scholarships", "/admissions", "/career-guides"];
  pages.forEach((p) => {
    xml += `<url><loc>${base}${p}</loc></url>`;
  });

  jobs.forEach((j) => {
    xml += `<url><loc>${base}/jobs/${j.slug}</loc></url>`;
  });
  scholarships.forEach((s) => {
    xml += `<url><loc>${base}/scholarships/${s.slug}</loc></url>`;
  });
  articles.forEach((a) => {
    xml += `<url><loc>${base}/articles/${a.slug}</loc></url>`;
  });

  xml += "</urlset>";
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
