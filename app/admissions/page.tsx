export default function AdmissionsPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Admissions</h1>
      <p className="mb-4">
        Find updates on admissions notices, open programs, and application guidance.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <article className="border rounded-lg p-5 shadow-sm">
          <h2 className="text-xl font-semibold">University Admissions</h2>
          <p className="mt-3 text-sm text-gray-700">
            Stay informed about program openings, eligibility requirements, and application timelines.
          </p>
        </article>
        <article className="border rounded-lg p-5 shadow-sm">
          <h2 className="text-xl font-semibold">How to Apply</h2>
          <p className="mt-3 text-sm text-gray-700">
            Prepare the required documents, monitor deadlines, and submit your application on time.
          </p>
        </article>
      </div>
    </div>
  );
}
