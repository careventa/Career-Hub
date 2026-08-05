"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSearch} className="flex">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search jobs, scholarships..."
        className="w-full border rounded-l px-3 py-2 text-sm"
      />
      <button type="submit" className="bg-green-600 text-white px-3 rounded-r">
        Search
      </button>
    </form>
  );
}
