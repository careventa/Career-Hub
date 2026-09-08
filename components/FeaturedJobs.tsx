"use client";

import useSWR from "swr";

type JobSummary = {
  id: string;
  title: string;
  organization: string;
  location: string;
  description: string;
  applyLink: string;
  deadline?: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeaturedJobs() {
  const { data } = useSWR<{ jobs: JobSummary[] }>("/api/jobs", fetcher, { revalidateOnFocus: false });

  const jobs = data?.jobs ?? [];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.length === 0 && (
        <div className="col-span-full text-center text-gray-500">No jobs yet — add some from Admin.</div>
      )}
      {jobs.map((job) => (
        <article key={job.id} className="border rounded-lg p-4 hover:shadow-lg">
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <div className="text-sm text-gray-600">{job.organization} • {job.location}</div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">{job.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <a href={job.applyLink} className="text-green-600 text-sm font-medium">Apply</a>
            <div className="text-xs text-gray-500">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
