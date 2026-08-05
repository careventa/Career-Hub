export default function JobsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      <p className="mb-4">Browse latest job listings across sectors.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="border rounded p-4">Sample Job Card</div>
        <div className="border rounded p-4">Sample Job Card</div>
        <div className="border rounded p-4">Sample Job Card</div>
      </div>
    </div>
  );
}
