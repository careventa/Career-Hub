import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Nav() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-700">
          CareerHub
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/jobs" className="text-gray-700 hover:text-green-600">Jobs</Link>
          <Link href="/scholarships" className="text-gray-700 hover:text-green-600">Scholarships</Link>
          <Link href="/admissions" className="text-gray-700 hover:text-green-600">Admissions</Link>
          <Link href="/career-guides" className="text-gray-700 hover:text-green-600">Career Guides</Link>
          <Link href="/admin/login" className="text-gray-700 hover:text-green-600">Admin</Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-64">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}
