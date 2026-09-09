import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body ?? {};

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL;
    const resend = getResendClient();

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    if (!resend || !contactEmail) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured yet. Add RESEND_API_KEY and CONTACT_EMAIL in Vercel.",
        },
        { status: 500 }
      );
    }

    const result = await resend.emails.send({
      from: contactEmail,
      to: contactEmail,
      replyTo: email,
      subject: `[CareerHub Contact] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json({ success: true, id: result.data?.id ?? null });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send message.",
      },
      { status: 500 }
    );
  }
}
