export default function AboutPage() {
  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            About us
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Helping students and professionals move forward</h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p>
            CareerHub was created to make career decisions easier for students,
            graduates, and job seekers across Pakistan. We believe that finding the
            right opportunity should be simple, transparent, and accessible.
          </p>
          <p>
            Our platform brings together job listings, scholarships, admissions
            information, and practical career guidance in one place. We aim to help
            users discover opportunities that match their skills, interests, and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Our mission</h2>
            <p className="text-gray-700">
              Empower people with clear information and practical tools to build better futures.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Our focus</h2>
            <p className="text-gray-700">
              Career discovery, scholarships, learning resources, and admissions support.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Our promise</h2>
            <p className="text-gray-700">
              Honest guidance, useful resources, and a clean experience for every user.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
