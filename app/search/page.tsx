import { cookies } from "next/headers";

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-4">Search results for "{q}"</h1>
      <p className="text-sm text-gray-600 mb-6">This is a placeholder — implement search backend to return real results.</p>
    </div>
  );
}
