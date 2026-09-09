import { prisma } from "@/lib/prisma";

export async function publishAiDraft(draftId: string) {
  const draft = await prisma.aiDraft.findUnique({ where: { id: draftId } });
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "approved") throw new Error("Approve this draft before publishing it");

  if (draft.type === "government_job" || draft.type === "private_job") {
    await prisma.job.create({
      data: {
        title: draft.title,
        slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
        organization: draft.organization || draft.sourceName || "Unknown",
        location: draft.location || "Pakistan",
        deadline: draft.deadline || new Date(),
        description: draft.description,
        applyLink: draft.applyLink || draft.sourceUrl || "#",
      },
    });
  } else if (draft.type === "scholarship") {
    await prisma.scholarship.create({
      data: {
        title: draft.title,
        slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
        country: draft.country || "Pakistan",
        deadline: draft.deadline || new Date(),
        description: draft.description,
        applyLink: draft.applyLink || draft.sourceUrl || null,
      },
    });
  } else if (draft.type === "admission") {
    const slug = "admissions";
    const fallbackTitle = "Admissions";
    await prisma.article.upsert({
      where: { slug },
      update: {
        title: draft.title || fallbackTitle,
        content: draft.content || draft.description,
        metaTitle: draft.metaTitle || fallbackTitle,
        metaDescription: draft.metaDescription || draft.description.slice(0, 180),
        sourceUrl: draft.applyLink || draft.sourceUrl || null,
      },
      create: {
        slug,
        title: draft.title || fallbackTitle,
        content: draft.content || draft.description,
        metaTitle: draft.metaTitle || fallbackTitle,
        metaDescription: draft.metaDescription || draft.description.slice(0, 180),
        sourceUrl: draft.applyLink || draft.sourceUrl || null,
      },
    });
  }

  await prisma.aiDraft.delete({ where: { id: draftId } });
  return draftId;
}
