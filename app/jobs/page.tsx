import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs: Array<{
    id: string;
    title: string;
    organization: string;
    location: string;
    description: string;
    deadline: Date;
    applyLink: string;
  }> = [];

  try {
    jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    });
  } catch (error) {
    console.warn("Unable to load jobs from database:", error);
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      <p className="mb-4">Browse the latest job listings across sectors.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <article key={job.id} className="border rounded-lg p-5 shadow-sm">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{job.organization}</p>
            <p className="text-sm text-gray-600">{job.location}</p>
            <p className="mt-3 text-sm text-gray-700 line-clamp-3">{job.description}</p>
            <p className="mt-4 text-xs text-gray-500">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </p>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              Apply now
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
