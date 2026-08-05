"use client";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminJobs() {
  const { data, mutate } = useSWR('/api/jobs', fetcher);
  const [form, setForm] = useState({ title: '', slug: '', organization: '', location: '', deadline: '', description: '', applyLink: '' });

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, deadline: new Date(form.deadline) }) });
    setForm({ title: '', slug: '', organization: '', location: '', deadline: '', description: '', applyLink: '' });
    mutate();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Admin — Jobs</h1>
      <form onSubmit={createJob} className="grid gap-2 grid-cols-1 md:grid-cols-2 mb-6">
        <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Title" className="border p-2" />
        <input value={form.slug} onChange={(e)=>setForm({...form, slug:e.target.value})} placeholder="Slug" className="border p-2" />
        <input value={form.organization} onChange={(e)=>setForm({...form, organization:e.target.value})} placeholder="Organization" className="border p-2" />
        <input value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} placeholder="Location" className="border p-2" />
        <input value={form.deadline} onChange={(e)=>setForm({...form, deadline:e.target.value})} placeholder="Deadline (YYYY-MM-DD)" className="border p-2" />
        <input value={form.applyLink} onChange={(e)=>setForm({...form, applyLink:e.target.value})} placeholder="Apply link" className="border p-2" />
        <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Description" className="border p-2 md:col-span-2" />
        <button className="bg-green-600 text-white py-2 px-4 rounded md:col-span-2">Create Job</button>
      </form>

      <div className="grid gap-4">
        {data?.jobs?.map((j: any) => (
          <div key={j.id} className="border p-4 rounded flex justify-between items-start">
            <div>
              <h3 className="font-bold">{j.title}</h3>
              <div className="text-sm text-gray-600">{j.organization} • {j.location}</div>
            </div>
            <div className="text-sm text-gray-500">{new Date(j.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
