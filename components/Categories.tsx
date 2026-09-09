import Link from "next/link";

export default function Categories() {
  const items = [
    { href: "/jobs", label: "Jobs" },
    { href: "/scholarships", label: "Scholarships" },
    { href: "/admissions", label: "Admissions" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="block border rounded px-3 py-2 text-center hover:bg-green-50">{it.label}</Link>
      ))}
    </div>
  );
}
