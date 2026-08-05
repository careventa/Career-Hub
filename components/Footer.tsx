export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-6 py-8 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} CareerHub — All rights reserved.
      </div>
    </footer>
  );
}
