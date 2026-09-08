import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanSourcesForDrafts } from "@/lib/ai-automation";

function isAuthorized(req: Request) {
  const expected = process.env.CRON_SECRET;
  const received = req.headers.get("authorization")?.replace("Bearer ", "");
  return Boolean(expected && received === expected);
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const [expiredJobs, expiredScholarships] = await Promise.all([
    prisma.job.deleteMany({ where: { deadline: { lt: now } } }),
    prisma.scholarship.deleteMany({ where: { deadline: { lt: now } } }),
  ]);

  const discovered = await scanSourcesForDrafts();
  let created = 0;
  let renewed = 0;

  for (const item of discovered) {
    const existing = await prisma.aiDraft.findFirst({
      where: {
        type: item.type,
        sourceUrl: item.sourceUrl,
        title: item.title,
        status: { not: "rejected" },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = {
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      title: item.title,
      organization: item.organization || null,
      location: item.location || null,
      country: item.country || null,
      deadline: item.deadline || null,
      description: item.description,
      applyLink: item.applyLink || null,
      content: item.content || null,
      metaTitle: item.metaTitle || null,
      metaDescription: item.metaDescription || null,
    };

    if (!existing) {
      await prisma.aiDraft.create({ data: { ...data, type: item.type, status: "pending_review" } });
      created += 1;
    } else if (existing.status !== "published" && item.deadline && existing.deadline?.getTime() !== item.deadline.getTime()) {
      await prisma.aiDraft.update({ where: { id: existing.id }, data: { ...data, status: "pending_review" } });
      renewed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    renewed,
    expiredJobs: expiredJobs.count,
    expiredScholarships: expiredScholarships.count,
  });
}