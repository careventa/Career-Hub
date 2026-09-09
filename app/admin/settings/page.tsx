"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ContactMessage = { id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: string };
type Settings = { id?: string; siteName: string; contactEmail: string };

function headers() {
  const token = localStorage.getItem("adminToken");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ siteName: "CareerHub", contactEmail: "hello@careerhub.example" });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/settings", { headers: headers() });
    if (response.status === 401) { window.location.href = "/admin/login"; return; }
    const data = await response.json();
    setSettings(data.settings);
    setMessages(data.messages || []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", { method: "PATCH", headers: headers(), body: JSON.stringify(settings) });
    const data = await response.json();
    setNotice(data.message || data.error || "Settings saved");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", { method: "PATCH", headers: headers(), body: JSON.stringify(passwords) });
    const data = await response.json();
    setNotice(data.message || data.error || "Password updated");
    if (response.ok) setPasswords({ currentPassword: "", newPassword: "" });
  }

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status: "read" }) });
    await load();
  }

  async function removeMessage(id: string) {
    if (!window.confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE", headers: headers() });
    await load();
  }

  return (
    <main className="page-grid min-h-screen bg-[#f7faf9] px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Admin control</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Settings & inbox</h1><p className="mt-2 text-slate-600">Control public contact details and respond to visitors.</p></div>
          <Link href="/admin/jobs" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Back to dashboard</Link>
        </div>
        {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-950">Public contact</h2><form onSubmit={saveSettings} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Site name<input value={settings.siteName} onChange={(event) => setSettings({ ...settings, siteName: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><label className="block text-sm font-semibold text-slate-700">Contact email<input type="email" required value={settings.contactEmail} onChange={(event) => setSettings({ ...settings, contactEmail: event.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">Save contact settings</button></form></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-slate-950">Admin password</h2><form onSubmit={changePassword} className="mt-5 space-y-4"><input type="password" required placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input type="password" required minLength={8} placeholder="New password (8+ characters)" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><button className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Update password</button></form></section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-950">Contact responses</h2><p className="mt-1 text-sm text-slate-500">Messages submitted through the public contact form.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{messages.filter((item) => item.status === "unread").length} unread</span></div><div className="mt-5 space-y-3">{messages.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No messages yet.</p> : messages.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${item.status === "unread" ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{item.subject}</h3><p className="text-sm text-slate-600">{item.name} · {item.email}</p></div><time className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{item.message}</p><div className="mt-3 flex gap-3 text-sm font-semibold"><a href={`mailto:${item.email}`} className="text-emerald-700">Reply by email</a>{item.status === "unread" ? <button onClick={() => markRead(item.id)} className="text-slate-600">Mark read</button> : null}<button onClick={() => removeMessage(item.id)} className="text-red-600">Delete</button></div></article>)}</div></section>
      </div>
    </main>
  );
}
