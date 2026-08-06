import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function seedAdmin() {
  const email = "admin@pakcareerhub.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hashed = await hashPassword(password);
  return prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashed,
      role: "admin",
    },
  });
}
