import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const draftId = body.draftId as string | undefined;

    if (!draftId) {
      return NextResponse.json({ error: "Missing draftId" }, { status: 400 });
    }

    const draft = await prisma.aiDraft.findUnique({ where: { id: draftId } });
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    if (draft.status !== "approved") {
      return NextResponse.json({ error: "Approve this draft before publishing it" }, { status: 409 });
    }

    if (draft.type === "government_job" || draft.type === "private_job") {
      await prisma.job.create({
        data: {
          title: draft.title,
          slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
          organization: draft.organization || draft.sourceName || "Unknown",
          location: draft.location || "Pakistan",
          deadline: draft.deadline || new Date(),
          description: draft.description,
          applyLink: draft.applyLink || draft.sourceUrl || "#",
        },
      });
    }

    if (draft.type === "scholarship") {
      await prisma.scholarship.create({
        data: {
          title: draft.title,
          slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
          country: draft.country || "Pakistan",
          deadline: draft.deadline || new Date(),
          description: draft.description,
          applyLink: draft.applyLink || draft.sourceUrl || null,
        },
      });
    }

    if (draft.type === "admission") {
      await prisma.article.upsert({
        where: { slug: "admissions" },
        update: {
          title: draft.title || "Admissions",
          content: draft.content || draft.description,
          metaTitle: draft.metaTitle || "Admissions",
          metaDescription: draft.metaDescription || draft.description.slice(0, 180),
          sourceUrl: draft.applyLink || draft.sourceUrl || null,
        },
        create: {
          slug: "admissions",
          title: draft.title || "Admissions",
          content: draft.content || draft.description,
          metaTitle: draft.metaTitle || "Admissions",
          metaDescription: draft.metaDescription || draft.description.slice(0, 180),
          sourceUrl: draft.applyLink || draft.sourceUrl || null,
        },
      });
    }

    if (draft.type === "career_guide") {
      await prisma.article.upsert({
        where: { slug: "career-guides" },
        update: {
          title: draft.title || "Career Guides",
          content: draft.content || draft.description,
          metaTitle: draft.metaTitle || "Career Guides",
          metaDescription: draft.metaDescription || draft.description.slice(0, 180),
          sourceUrl: draft.applyLink || draft.sourceUrl || null,
        },
        create: {
          slug: "career-guides",
          title: draft.title || "Career Guides",
          content: draft.content || draft.description,
          metaTitle: draft.metaTitle || "Career Guides",
          metaDescription: draft.metaDescription || draft.description.slice(0, 180),
          sourceUrl: draft.applyLink || draft.sourceUrl || null,
        },
      });
    }

    await prisma.aiDraft.update({
      where: { id: draftId },
      data: { status: "published" },
    });

    return NextResponse.json({ ok: true, message: "Draft published successfully" });
  } catch (error) {
    console.error("AI publish failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish draft" },
      { status: 500 }
    );
  }
}
