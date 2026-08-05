import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const jobs = await prisma.job.findMany({
    where: q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const job = await prisma.job.create({ data: body });
  return NextResponse.json({ job });
}
