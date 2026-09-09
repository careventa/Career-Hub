import Hero from "@/components/Hero";
import FeaturedJobs from "@/components/FeaturedJobs";
import Categories from "@/components/Categories";
import AdSensePlaceholder from "@/components/AdSensePlaceholder";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Featured Jobs</h2>
            <FeaturedJobs />
          </div>
          <aside className="w-full lg:w-96">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Explore Categories</h3>
              <Categories />
            </div>
            <AdSensePlaceholder />
          </aside>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-emerald-50/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-3 lg:px-8">
          <div className="md:col-span-3"><p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">A clearer way forward</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Less searching. More applying.</h2></div>
          <div><div className="text-2xl font-bold text-emerald-700">01</div><h3 className="mt-3 font-bold text-slate-950">Fresh opportunities</h3><p className="mt-2 text-sm leading-6 text-slate-600">Open roles, admissions, and scholarships are organized by what matters: deadline, source, and next action.</p></div>
          <div><div className="text-2xl font-bold text-emerald-700">02</div><h3 className="mt-3 font-bold text-slate-950">Official sources</h3><p className="mt-2 text-sm leading-6 text-slate-600">Every listing points back to its original institution, employer, or application page for verification.</p></div>
          <div><div className="text-2xl font-bold text-emerald-700">03</div><h3 className="mt-3 font-bold text-slate-950">One focused hub</h3><p className="mt-2 text-sm leading-6 text-slate-600">Use the categories and quick assistant to move from discovery to a confident application.</p></div>
        </div>
      </section>
    </main>
  );
}
