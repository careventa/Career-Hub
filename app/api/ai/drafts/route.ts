import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { scanSourcesForDrafts } from "@/lib/ai-automation";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drafts = await prisma.aiDraft.findMany({ where: { status: { not: "published" } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const discovered = body.forceRefresh ? await scanSourcesForDrafts() : [];

    const discoveredDrafts = discovered.map((item) => ({
      ...item,
      status: "pending_review",
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
      deadline: item.deadline ? new Date(item.deadline) : null,
    }));

    const createdDrafts = await Promise.all(
      discoveredDrafts.map((item) =>
        prisma.aiDraft.create({
          data: {
            type: item.type,
            status: item.status,
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
          },
        })
      )
    );

    if (body.forceRefresh) {
      return NextResponse.json({ createdDrafts, count: createdDrafts.length });
    }

    const draft = await prisma.aiDraft.create({
      data: {
        type: body.type,
        status: body.status || "pending_review",
        sourceUrl: body.sourceUrl || "",
        sourceName: body.sourceName || "AI detected source",
        title: body.title,
        organization: body.organization || null,
        location: body.location || null,
        country: body.country || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        description: body.description || "",
        applyLink: body.applyLink || null,
        content: body.content || null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
      },
    });

    return NextResponse.json({ draft, count: 1 });
  } catch (error) {
    console.error("AI draft creation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create AI draft" },
      { status: 500 }
    );
  }
}
