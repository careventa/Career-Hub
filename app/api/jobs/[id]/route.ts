import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type JobRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const resolveJobId = async (params: JobRouteContext["params"]) => {
  const resolvedParams = await params;
  return resolvedParams.id;
};

export async function GET(request: NextRequest, { params }: JobRouteContext) {
  const id = await resolveJobId(params);
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PUT(request: NextRequest, { params }: JobRouteContext) {
  const id = await resolveJobId(params);
  const body = await request.json();
  const job = await prisma.job.update({ where: { id }, data: body });
  return NextResponse.json({ job });
}

export async function DELETE(request: NextRequest, { params }: JobRouteContext) {
  const id = await resolveJobId(params);
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
