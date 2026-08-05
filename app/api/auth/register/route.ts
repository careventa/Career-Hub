import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "User exists" }, { status: 400 });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { name: name || "", email, password: hashed } });
  const token = signToken({ id: user.id, email: user.email });

  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
