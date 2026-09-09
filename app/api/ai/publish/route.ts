import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { publishAiDraft } from "@/lib/publish-ai-draft";

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

    await publishAiDraft(draftId);

    return NextResponse.json({ ok: true, message: "Draft published successfully" });
  } catch (error) {
    console.error("AI publish failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish draft" },
      { status: 500 }
    );
  }
}
