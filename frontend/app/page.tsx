import Hero from "@/src/components/home/Hero";
import CategoryGrid from "@/src/components/home/CategoryGrid";
import LatestProducts from "@/src/components/home/LatestProducts";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50/50 md:px-8">
      <Hero  />
      <CategoryGrid />
      <LatestProducts />
    </main>
  );
}
