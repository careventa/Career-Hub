import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fallbackFaqs = [
  { question: "How do I apply for a job?", answer: "Open a listing, review its deadline and source link, then use the official application link provided." },
  { question: "How do I find scholarships?", answer: "Use the Scholarships page to review available opportunities, deadlines, and official source links." },
  { question: "Are listings verified?", answer: "Listings are collected for review. Always confirm the details on the official source before applying." },
  { question: "How often is the site updated?", answer: "The automation checks configured sources daily and sends new or renewed opportunities to the review queue." },
];

export async function POST(req: Request) {
  try {
    const { question } = await req.json() as { question?: string };
    const query = question?.trim();
    if (!query) return NextResponse.json({ error: "Ask a question" }, { status: 400 });

    const [jobs, scholarships, admissions] = await Promise.all([
      prisma.job.findMany({ where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] }, take: 4 }),
      prisma.scholarship.findMany({ where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] }, take: 4 }),
      prisma.article.findMany({ where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] }, take: 2 }),
    ]);

    const context = JSON.stringify({ jobs, scholarships, admissions, faqs: fallbackFaqs });
    const apiKey = process.env.AI_API_KEY;
    if (apiKey) {
      const model = process.env.AI_MODEL || "gemini-2.0-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are CareerHub's concise Pakistan careers FAQ assistant. Answer only from the supplied context. Never invent a deadline, employer, university, scholarship, or link. If no result exists, say so and direct the user to browse the relevant page. Keep answers under 80 words." }] },
          contents: [{ role: "user", parts: [{ text: JSON.stringify({ question: query, context }) }] }],
          generationConfig: { temperature: 0.2 },
        }),
        cache: "no-store",
      });
      if (response.ok) {
        const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const answer = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) return NextResponse.json({ answer });
      }
    }

    const matches = [...jobs.map((job) => `Job: ${job.title} at ${job.organization}.`), ...scholarships.map((item) => `Scholarship: ${item.title} in ${item.country}.`)];
    return NextResponse.json({ answer: matches.length ? matches.join(" ") : fallbackFaqs.find((item) => query.toLowerCase().includes(item.question.toLowerCase().split(" ")[0]))?.answer || "I could not find a matching item yet. Try asking about jobs, scholarships, or admissions." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to answer right now" }, { status: 500 });
  }
}
