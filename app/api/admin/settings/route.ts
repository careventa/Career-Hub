import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword, verifyToken } from "@/lib/auth";

function getUser(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  return verifyToken(token) as { id?: string } | null;
}

export async function GET(req: Request) {
  if (!getUser(req)?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.siteSetting.findFirst();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({
    settings: settings || { siteName: "CareerHub", contactEmail: "hello@careerhub.example" },
    messages,
  });
}

export async function PATCH(req: Request) {
  const user = getUser(req);
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const settings = await prisma.siteSetting.upsert({
      where: { id: body.id || "site-settings" },
      update: {
        siteName: body.siteName,
        contactEmail: body.contactEmail,
      },
      create: {
        id: "site-settings",
        siteName: body.siteName || "CareerHub",
        contactEmail: body.contactEmail || "hello@careerhub.example",
      },
    });

    if (body.currentPassword && body.newPassword) {
      const admin = await prisma.user.findUnique({ where: { id: user.id } });
      if (!admin || !(await comparePassword(body.currentPassword, admin.password))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(body.newPassword) },
      });
    }

    return NextResponse.json({ settings, message: "Settings saved" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save settings" }, { status: 500 });
  }
}

