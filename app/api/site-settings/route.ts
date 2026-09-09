import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSetting.findFirst();
  return NextResponse.json({
    siteName: settings?.siteName || "CareerHub",
    contactEmail: settings?.contactEmail || "hello@careerhub.example",
  });
}
