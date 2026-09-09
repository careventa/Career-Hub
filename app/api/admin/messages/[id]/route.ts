import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string } | null;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status: body.status || "read" },
  });
  return NextResponse.json({ message });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string } | null;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
