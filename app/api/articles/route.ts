import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const user = verifyToken(token) as { id?: string; email?: string } | null;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const existing = await prisma.article.findUnique({ where: { slug: body.slug } });

  const article = existing
    ? await prisma.article.update({ where: { id: existing.id }, data: body })
    : await prisma.article.create({ data: body });

  return NextResponse.json({ article });
}
