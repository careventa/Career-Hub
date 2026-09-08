export default function TermsPage() {
  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Terms & conditions
          </p>
          <h1 className="text-4xl font-bold text-gray-900">Terms of use</h1>
        </div>

        <div className="space-y-6 text-gray-700">
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">1. Acceptance of terms</h2>
            <p>
              By using CareerHub, you agree to comply with these Terms and Conditions and any applicable laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">2. Website use</h2>
            <p>
              This website is provided for informational purposes and to help users discover jobs, scholarships,
              admissions information, and career resources. You agree not to misuse the platform or interfere with
              its operation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">3. Content accuracy</h2>
            <p>
              We strive to keep the information accurate and up to date, but we do not guarantee that all listings,
              guides, or admissions content are always complete or current.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">4. User responsibility</h2>
            <p>
              You are responsible for verifying details such as job requirements, scholarship eligibility, and admissions
              deadlines before making decisions based on the information provided.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">5. Limitation of liability</h2>
            <p>
              CareerHub is not liable for loss or damage arising from the use of this website or reliance on the
              information shared here.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">6. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the website after changes are made indicates
              acceptance of the revised terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
