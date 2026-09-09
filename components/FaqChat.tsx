"use client";

import { FormEvent, useState } from "react";

const prompts = ["How do I apply?", "Show scholarship help", "Are listings verified?"];

type ChatMessage = { role: "assistant" | "user"; text: string };

export default function FaqChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi. Ask me about jobs, scholarships, or admissions." },
  ]);

  async function ask(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: value }]);
    setLoading(true);
    try {
      const response = await fetch("/api/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: value }) });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", text: data.answer || data.error || "I could not answer that yet." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "I could not connect right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-5 z-50 sm:bottom-6">
      {open ? (
        <section className="mb-3 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" aria-label="CareerHub FAQ assistant">
          <div className="bg-slate-950 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">CareerHub AI</p><h2 className="text-lg font-semibold">Quick answers</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="text-xl text-slate-300" aria-label="Close FAQ assistant">×</button>
            </div>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-8 rounded-xl bg-emerald-700 p-3 text-sm text-white" : "mr-8 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm"}>{message.text}</div>)}
            {loading ? <div className="mr-8 rounded-xl bg-white p-3 text-sm text-slate-500">Searching...</div> : null}
          </div>
          <div className="flex flex-wrap gap-2 border-t bg-white px-4 py-3">
            {prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setQuestion(prompt)} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-emerald-500 hover:text-emerald-700">{prompt}</button>)}
          </div>
          <form onSubmit={ask} className="flex gap-2 border-t bg-white p-3">
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600" aria-label="Ask CareerHub AI" />
            <button type="submit" disabled={loading} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Ask</button>
          </form>
        </section>
      ) : null}
      <button type="button" onClick={() => setOpen((current) => !current)} className="ml-auto flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-800" aria-expanded={open}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-slate-950">?</span> Ask CareerHub AI
      </button>
    </div>
  );
}
