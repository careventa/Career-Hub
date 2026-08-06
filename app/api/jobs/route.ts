import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const job = await prisma.job.create({ data: body });
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Failed to create job", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create job" },
      { status: 500 }
    );
  }
}
