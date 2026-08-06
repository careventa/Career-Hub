import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const resolveParams = async (context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  return params.id;
};

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await resolveParams(context);
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await resolveParams(context);
  const body = await req.json();
  const job = await prisma.job.update({ where: { id }, data: body });
  return NextResponse.json({ job });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await resolveParams(context);
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
