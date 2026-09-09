"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
};

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type TabKey = "jobs" | "scholarships" | "admissions" | "career";

type JobRecord = {
  id: string;
  title: string;
  slug: string;
  organization: string;
  location: string;
  deadline?: string | null;
  description: string;
  applyLink: string;
};

type ScholarshipRecord = {
  id: string;
  title: string;
  slug: string;
  country: string;
  deadline?: string | null;
  description: string;
};

type ArticleRecord = {
  id?: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type ArticleForm = {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

const blankJob = {
  title: "",
  slug: "",
  organization: "",
  location: "",
  deadline: "",
  description: "",
  applyLink: "",
};

const blankScholarship = {
  title: "",
  slug: "",
  country: "",
  deadline: "",
  description: "",
};

const blankArticle = {
  title: "",
  slug: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
};

export default function AdminContentPage() {
  const { data: jobsData, mutate: mutateJobs } = useSWR<{ jobs: JobRecord[] }>("/api/jobs", fetcher);
  const { data: scholarshipsData, mutate: mutateScholarships } = useSWR<{ scholarships: ScholarshipRecord[] }>("/api/scholarships", fetcher);
  const { data: articlesData, mutate: mutateArticles } = useSWR<{ articles: ArticleRecord[] }>("/api/articles", fetcher);

  const [activeTab, setActiveTab] = useState<TabKey>("jobs");
  const [jobForm, setJobForm] = useState(blankJob);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [scholarshipForm, setScholarshipForm] = useState(blankScholarship);
  const [editingScholarshipId, setEditingScholarshipId] = useState<string | null>(null);
  const [admissionsForm, setAdmissionsForm] = useState<ArticleForm>({ ...blankArticle, slug: "admissions", title: "Admissions" });
  const [message, setMessage] = useState("");

  const admissionsArticle = articlesData?.articles?.find((article) => article.slug === "admissions");

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("adminToken")) {
      window.location.href = "/admin/login";
    }
  }, []);

  async function submitJob(e: React.FormEvent) {
    e.preventDefault();
    const method = editingJobId ? "PUT" : "POST";
    const url = editingJobId ? `/api/jobs/${editingJobId}` : "/api/jobs";
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...jobForm, deadline: jobForm.deadline ? new Date(jobForm.deadline).toISOString() : null }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage("Job saved.");
      setJobForm(blankJob);
      setEditingJobId(null);
      mutateJobs();
    } else {
      setMessage(data.error || "Unable to save job.");
    }
  }

  async function deleteJob(id: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setMessage("Job removed.");
      mutateJobs();
    }
  }

  async function submitScholarship(e: React.FormEvent) {
    e.preventDefault();
    const method = editingScholarshipId ? "PUT" : "POST";
    const url = editingScholarshipId ? `/api/scholarships/${editingScholarshipId}` : "/api/scholarships";
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...scholarshipForm, deadline: scholarshipForm.deadline ? new Date(scholarshipForm.deadline).toISOString() : null }),
    });
    if (res.ok) {
      setMessage("Scholarship saved.");
      setScholarshipForm(blankScholarship);
      setEditingScholarshipId(null);
      mutateScholarships();
    }
  }

  async function deleteScholarship(id: string) {
    const res = await fetch(`/api/scholarships/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      setMessage("Scholarship removed.");
      mutateScholarships();
    }
  }

  async function submitArticle(e: React.FormEvent, form: ArticleForm) {
    e.preventDefault();
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Page content saved.");
      mutateArticles();
    }
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "jobs", label: "Jobs" },
    { key: "scholarships", label: "Scholarships" },
    { key: "admissions", label: "Admissions" },
  ];

  return (
    <div className="container mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Content Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage jobs, scholarships, and admissions from one place.</p>
        </div>
        <Link href="/admin/ai" className="inline-flex w-fit items-center rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
          AI Automation
        </Link>
        <Link href="/admin/settings" className="inline-flex w-fit items-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-green-600 hover:text-green-700">
          Settings & Inbox
        </Link>
      </div>
      {message ? <p className="-mt-6 text-sm text-green-700">{message}</p> : null}

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab.key ? "bg-green-700 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "jobs" ? (
        <section className="border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Jobs</h2>
          <form onSubmit={submitJob} className="grid gap-3 grid-cols-1 md:grid-cols-2 mb-6">
            <input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Title" className="border p-2" />
            <input value={jobForm.slug} onChange={(e) => setJobForm({ ...jobForm, slug: e.target.value })} placeholder="Slug" className="border p-2" />
            <input value={jobForm.organization} onChange={(e) => setJobForm({ ...jobForm, organization: e.target.value })} placeholder="Organization" className="border p-2" />
            <input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="Location" className="border p-2" />
            <input type="date" value={jobForm.deadline} onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} className="border p-2" />
            <input value={jobForm.applyLink} onChange={(e) => setJobForm({ ...jobForm, applyLink: e.target.value })} placeholder="Apply link" className="border p-2" />
            <textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Description" className="border p-2 md:col-span-2" rows={5} />
            <button className="bg-green-600 text-white py-2 px-4 rounded md:col-span-2">{editingJobId ? "Update Job" : "Create Job"}</button>
          </form>

          <div className="space-y-3">
            {jobsData?.jobs?.map((job) => (
              <div key={job.id} className="border rounded p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.organization} • {job.location}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setJobForm({ title: job.title, slug: job.slug, organization: job.organization, location: job.location, deadline: job.deadline?.slice(0, 10) || "", description: job.description, applyLink: job.applyLink }); setEditingJobId(job.id); }} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => deleteJob(job.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "scholarships" ? (
        <section className="border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Scholarships</h2>
          <form onSubmit={submitScholarship} className="grid gap-3 grid-cols-1 md:grid-cols-2 mb-6">
            <input value={scholarshipForm.title} onChange={(e) => setScholarshipForm({ ...scholarshipForm, title: e.target.value })} placeholder="Title" className="border p-2" />
            <input value={scholarshipForm.slug} onChange={(e) => setScholarshipForm({ ...scholarshipForm, slug: e.target.value })} placeholder="Slug" className="border p-2" />
            <input value={scholarshipForm.country} onChange={(e) => setScholarshipForm({ ...scholarshipForm, country: e.target.value })} placeholder="Country" className="border p-2" />
            <input type="date" value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} className="border p-2" />
            <textarea value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} placeholder="Description" className="border p-2 md:col-span-2" rows={5} />
            <button className="bg-green-600 text-white py-2 px-4 rounded md:col-span-2">{editingScholarshipId ? "Update Scholarship" : "Create Scholarship"}</button>
          </form>

          <div className="space-y-3">
            {scholarshipsData?.scholarships?.map((scholarship) => (
              <div key={scholarship.id} className="border rounded p-4 flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                <div>
                  <h3 className="font-semibold">{scholarship.title}</h3>
                  <p className="text-sm text-gray-600">{scholarship.country}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setScholarshipForm({ title: scholarship.title, slug: scholarship.slug, country: scholarship.country, deadline: scholarship.deadline?.slice(0, 10) || "", description: scholarship.description }); setEditingScholarshipId(scholarship.id); }} className="text-sm text-blue-600">Edit</button>
                  <button onClick={() => deleteScholarship(scholarship.id)} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "admissions" ? (
        <section className="border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Admissions Page</h2>
          <form onSubmit={(e) => submitArticle(e, admissionsForm)} className="grid gap-3">
            <input value={admissionsForm.title || admissionsArticle?.title || "Admissions"} onChange={(e) => setAdmissionsForm({ ...admissionsForm, title: e.target.value })} placeholder="Page title" className="border p-2" />
            <input value={admissionsForm.slug || admissionsArticle?.slug || "admissions"} onChange={(e) => setAdmissionsForm({ ...admissionsForm, slug: e.target.value })} placeholder="Slug" className="border p-2" />
            <input value={admissionsForm.metaTitle || admissionsArticle?.metaTitle || "Admissions"} onChange={(e) => setAdmissionsForm({ ...admissionsForm, metaTitle: e.target.value })} placeholder="Meta title" className="border p-2" />
            <input value={admissionsForm.metaDescription || admissionsArticle?.metaDescription || ""} onChange={(e) => setAdmissionsForm({ ...admissionsForm, metaDescription: e.target.value })} placeholder="Meta description" className="border p-2" />
            <textarea value={admissionsForm.content || admissionsArticle?.content || ""} onChange={(e) => setAdmissionsForm({ ...admissionsForm, content: e.target.value })} placeholder="Page content. Tip: use blank lines for paragraphs, - for bullet lists, and ### for headings." className="border p-2" rows={10} />
            <button className="bg-blue-600 text-white py-2 px-4 rounded">Save Admissions Content</button>
          </form>
        </section>
      ) : null}

    </div>
  );
}
