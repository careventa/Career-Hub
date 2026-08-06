import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { seedAdmin } from "@/lib/seed-admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    try {
      user = await seedAdmin();
    } catch (error) {
      console.error("Failed to seed admin user", error);
    }
  }

  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await comparePassword(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken({ id: user.id, email: user.email });
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
