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
      {article?.sourceUrl ? (
        <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block text-green-700 underline">
          Open official source
        </a>
      ) : null}
    </div>
  );
}
