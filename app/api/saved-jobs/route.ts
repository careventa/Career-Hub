import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const saved = await prisma.savedJob.findMany({ where: { userId } });
  return NextResponse.json({ saved });
}

export async function POST(req: Request) {
  const body = await req.json();
  const rec = await prisma.savedJob.create({ data: body });
  return NextResponse.json({ saved: rec });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.savedJob.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
