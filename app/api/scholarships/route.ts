import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const scholarships = await prisma.scholarship.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ scholarships });
}

export async function POST(req: Request) {
  const body = await req.json();
  const s = await prisma.scholarship.create({ data: body });
  return NextResponse.json({ scholarship: s });
}
