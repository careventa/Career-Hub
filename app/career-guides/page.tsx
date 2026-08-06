import { prisma } from "@/lib/prisma";
import { ContentRenderer } from "@/components/ContentRenderer";

export const dynamic = "force-dynamic";

export default async function CareerGuidesPage() {
  const article = await prisma.article.findUnique({ where: { slug: "career-guides" } });

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">{article?.title || "Career Guides"}</h1>
      <p className="mb-4 text-gray-600">
        {article?.metaDescription || "Guides, tips, and resources to plan your career."}
      </p>
      <div className="mt-6">
        <ContentRenderer content={article?.content || "Guides, tips, and resources to plan your career."} />
      </div>
    </div>
  );
}
