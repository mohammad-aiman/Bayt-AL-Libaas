import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <CategorySection />
      <FeaturedProducts />
    </div>
  );
} 