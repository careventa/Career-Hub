"use client";

import { useCallback, useEffect, useState } from "react";

const tabs = [
  { key: "government_job", label: "Government Jobs" },
  { key: "private_job", label: "Private Jobs" },
  { key: "scholarship", label: "Scholarships" },
  { key: "admission", label: "Admissions" },
  { key: "career_guide", label: "Career Guide" },
] as const;

type DraftStatus = "pending_review" | "approved" | "published" | "rejected";
type DraftType = (typeof tabs)[number]["key"];

type AiDraft = {
  id: string;
  type: DraftType;
  status: DraftStatus;
  sourceUrl: string;
  sourceName: string;
  title: string;
  organization?: string | null;
  location?: string | null;
  country?: string | null;
  deadline?: string | null;
  description: string;
  applyLink?: string | null;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

async function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminAIAutomationPage() {
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | DraftType>("all");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    const res = await fetch("/api/ai/drafts", { headers: await getAuthHeaders() });
    if (!res.ok) {
      setMessage("Unable to load AI draft queue.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setDrafts(data.drafts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDrafts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchDrafts]);

  const filteredDrafts = activeFilter === "all" ? drafts : drafts.filter((draft) => draft.type === activeFilter);

  const refreshFromSources = async () => {
    setMessage("Scanning selected sources and collecting Pakistan listings...");
    const res = await fetch("/api/ai/drafts", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ forceRefresh: true, type: "government_job", title: "Auto detected listing" }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Scan failed.");
      return;
    }

    setMessage(`Detected ${data.count || 0} AI-suggested listings.`);
    await fetchDrafts();
  };

  const updateStatus = async (draftId: string, status: DraftStatus) => {
    setBusyAction(`${status}:${draftId}`);
    try {
      const res = await fetch(`/api/ai/drafts/${draftId}`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update draft status.");
      setMessage(`Draft marked as ${status}.`);
      await fetchDrafts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update draft status.");
    } finally {
      setBusyAction(null);
    }
  };

  const publish = async (draftId: string) => {
    setBusyAction(`publish:${draftId}`);
    try {
      const res = await fetch("/api/ai/publish", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({ draftId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Publish failed.");
      setMessage(data.message || "Published successfully.");
      await fetchDrafts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publish failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (!window.confirm("Delete this draft permanently?")) return;
    setBusyAction(`delete:${draftId}`);
    try {
      const res = await fetch(`/api/ai/drafts/${draftId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      setMessage("Draft deleted.");
      await fetchDrafts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Automation Dashboard</h1>
          <p className="text-gray-600 mt-2">Automatically detect openings across Pakistan and review them before final publishing.</p>
        </div>
        <button onClick={refreshFromSources} className="bg-green-700 text-white px-4 py-2 rounded">Scan Sources</button>
      </div>

      {message ? <p className="text-sm text-green-700">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveFilter("all")} className={`px-3 py-2 rounded ${activeFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>All</button>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveFilter(tab.key)} className={`px-3 py-2 rounded ${activeFilter === tab.key ? "bg-green-700 text-white" : "bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading AI queue...</p>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.length === 0 ? (
            <div className="border rounded-lg p-6 text-gray-600">No AI-detected listings in the queue yet.</div>
          ) : (
            filteredDrafts.map((draft) => (
              <article key={draft.id} className="border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-green-700">{draft.type}</div>
                    <h2 className="text-xl font-semibold">{draft.title}</h2>
                    <p className="text-sm text-gray-600">{draft.organization || draft.sourceName}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button disabled={busyAction !== null} onClick={() => updateStatus(draft.id, "approved")} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
                      {busyAction === `approved:${draft.id}` ? "Approving..." : "Approve"}
                    </button>
                    <button disabled={busyAction !== null} onClick={() => updateStatus(draft.id, "rejected")} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
                      {busyAction === `rejected:${draft.id}` ? "Rejecting..." : "Reject"}
                    </button>
                    <button disabled={busyAction !== null || draft.status !== "approved"} onClick={() => publish(draft.id)} className="bg-green-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
                      {busyAction === `publish:${draft.id}` ? "Publishing..." : "Final Publish"}
                    </button>
                    <button disabled={busyAction !== null} onClick={() => deleteDraft(draft.id)} className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
                      {busyAction === `delete:${draft.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div><span className="font-medium">Source:</span> {draft.sourceName}</div>
                  <div><span className="font-medium">Location:</span> {draft.location || draft.country || "Pakistan"}</div>
                  <div><span className="font-medium">Deadline:</span> {draft.deadline ? new Date(draft.deadline).toLocaleDateString() : "N/A"}</div>
                  <div><span className="font-medium">Status:</span> {draft.status}</div>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-line">{draft.description}</p>

                {draft.applyLink ? (
                  <a href={draft.applyLink} target="_blank" rel="noreferrer" className="text-green-700 underline text-sm">Open source</a>
                ) : null}
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
