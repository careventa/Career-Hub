import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-lg font-black text-white">C</span>
          <span className="text-xl font-bold tracking-tight">Career<span className="text-emerald-700">Hub</span></span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          <Link href="/jobs" className="transition hover:text-emerald-700">Jobs</Link>
          <Link href="/scholarships" className="transition hover:text-emerald-700">Scholarships</Link>
          <Link href="/admissions" className="transition hover:text-emerald-700">Admissions</Link>
          <Link href="/career-guides" className="transition hover:text-emerald-700">Career Guides</Link>
          <Link href="/about" className="transition hover:text-emerald-700">About</Link>
          <Link href="/contact" className="transition hover:text-emerald-700">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden w-56 md:block">
            <SearchBar />
          </div>
          <Link href="/admin/login" className="hidden rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:inline-flex">Admin</Link>
        </div>
      </div>
    </header>
  );
}
