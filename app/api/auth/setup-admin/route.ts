import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  const email = "admin@pakcareerhub.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Admin already exists", email });
  }

  const hashed = await hashPassword(password);
  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashed,
      role: "admin",
    },
  });

  return NextResponse.json({ message: "Admin created", email, password });
}
