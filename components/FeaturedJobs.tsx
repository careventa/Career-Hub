"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeaturedJobs() {
  const { data } = useSWR("/api/jobs", fetcher, { revalidateOnFocus: false });

  const jobs = data?.jobs || [];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.length === 0 && (
        <div className="col-span-full text-center text-gray-500">No jobs yet — add some from Admin.</div>
      )}
      {jobs.map((j: any) => (
        <article key={j.id} className="border rounded-lg p-4 hover:shadow-lg">
          <h3 className="font-semibold text-lg">{j.title}</h3>
          <div className="text-sm text-gray-600">{j.organization} • {j.location}</div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">{j.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <a href={j.applyLink} className="text-green-600 text-sm font-medium">Apply</a>
            <div className="text-xs text-gray-500">{new Date(j.deadline).toLocaleDateString?.() || ''}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
