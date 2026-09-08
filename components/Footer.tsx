import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div>© {new Date().getFullYear()} CareerHub — All rights reserved.</div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="hover:text-green-600">About</Link>
            <Link href="/contact" className="hover:text-green-600">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-green-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-green-600">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
