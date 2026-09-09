export default function Hero() {
  return (
    <section className="page-grid relative overflow-hidden border-b border-emerald-100 bg-[#ecfdf5]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Pakistan opportunities, organised</p>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">Your next move starts here.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Discover jobs, scholarships, university admissions, and practical career guidance in one focused place.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/jobs" className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800">Explore opportunities</a>
          </div>
        </div>
      </div>
    </section>
  );
}
