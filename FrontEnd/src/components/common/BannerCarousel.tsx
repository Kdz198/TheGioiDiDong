import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Banner {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerCarousel({ banners, autoPlayInterval = 5000 }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval, goToNext]);

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((b) => (
          <div key={b.id} className="relative min-w-full">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600">
              <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center text-white md:py-24">
                {b.badgeText && <Badge className="bg-red-400 text-white">{b.badgeText}</Badge>}
                <h2 className="text-3xl font-bold md:text-5xl">{b.title}</h2>
                {b.subtitle && <p className="max-w-lg text-teal-100">{b.subtitle}</p>}
                {b.ctaText && b.ctaLink && (
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100" asChild>
                    <Link to={b.ctaLink}>{b.ctaText}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
            aria-label="Banner trước">
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
            aria-label="Banner tiếp theo">
            <ChevronRight className="h-5 w-5 text-zinc-700" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
                aria-label={`Chuyển đến banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
