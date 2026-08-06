import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type JobRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: JobRouteContext) {
  const id = (await params).id;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(request: Request, { params }: JobRouteContext) {
  const id = (await params).id;
  const body = await request.json();
  const job = await prisma.job.update({ where: { id }, data: body });
  return NextResponse.json({ job });
}

export async function DELETE(request: Request, { params }: JobRouteContext) {
  const id = (await params).id;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
