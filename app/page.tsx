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

      <section className="container mx-auto px-6 py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Career Guides</h2>
          <p className="text-gray-700">Practical advice, templates, and guides to level up your career search and applications.</p>
        </div>
      </section>
    </main>
  );
}
