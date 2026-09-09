import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { publishAiDraft } from "@/lib/publish-ai-draft";

function isAdmin(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  return Boolean((verifyToken(token) as { id?: string } | null)?.id);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as { action?: "approve" | "publish"; draftIds?: string[] };
    const draftIds = Array.isArray(body.draftIds) ? body.draftIds : [];
    if (!draftIds.length || !body.action) return NextResponse.json({ error: "Choose an action and at least one draft" }, { status: 400 });

    if (body.action === "approve") {
      const result = await prisma.aiDraft.updateMany({
        where: { id: { in: draftIds }, status: "pending_review" },
        data: { status: "approved" },
      });
      return NextResponse.json({ ok: true, count: result.count, message: `${result.count} drafts approved.` });
    }

    let published = 0;
    const errors: string[] = [];
    for (const draftId of draftIds) {
      try {
        await publishAiDraft(draftId);
        published += 1;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Publish failed");
      }
    }
    return NextResponse.json({ ok: errors.length === 0, count: published, errors, message: `${published} drafts published and removed from the queue.` }, { status: errors.length ? 207 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bulk action failed" }, { status: 500 });
  }
}
