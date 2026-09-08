import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  let scholarships: Array<{
    id: string;
    title: string;
    country: string;
    description: string;
    deadline: Date;
    applyLink: string | null;
  }> = [];

  try {
    scholarships = await prisma.scholarship.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  } catch (error) {
    console.warn("Unable to load scholarships from database:", error);
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Scholarships</h1>
      <p className="mb-4">Explore scholarship opportunities and important deadlines.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((scholarship) => (
          <article key={scholarship.id} className="border rounded-lg p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{scholarship.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{scholarship.country}</p>
            <p className="mt-3 text-sm text-gray-700 line-clamp-3">{scholarship.description}</p>
            <p className="mt-4 text-xs text-gray-500">
              Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
            </p>
            {scholarship.applyLink ? (
              <a href={scholarship.applyLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-green-700 underline">
                Apply / view source
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
