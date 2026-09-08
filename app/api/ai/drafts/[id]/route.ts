import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const draft = await prisma.aiDraft.update({
      where: { id },
      data: { status: body.status || "pending_review" },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Update draft failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.aiDraft.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete draft failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete draft" },
      { status: 500 }
    );
  }
}
