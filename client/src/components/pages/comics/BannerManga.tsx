import { useState, useEffect } from "react";
import { Play, Info, Star, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { normalizeTitle } from "@/utils/title";

// Extended interface for banner display
interface BannerManga {
  id: string;
  title: string;
  imageUrl: string;
  rating?: number | null;
  type: string;
  status: string;
  description: string;
  genres: string[];
  isColored: boolean;
  latestChapter?: {
    title: string;
    slug: string;
    releasedAt: string;
  };
}

interface MangaHeroBannerProps {
  apiUrl: string;
  autoPlayInterval?: number;
  maxItems?: number;
}

export default function MangaHeroBanner({
  apiUrl,
  autoPlayInterval = 5000,
  maxItems = 5,
}: MangaHeroBannerProps) {
  const [mangas, setMangas] = useState<BannerManga[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMangas = async () => {
      try {
        setIsLoading(true);
        // Check if apiUrl already has query parameters
        const separator = apiUrl.includes("?") ? "&" : "?";
        const url = apiUrl.includes("latest=")
          ? apiUrl
          : `${apiUrl}${separator}latest=1&page=1`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch manga data");
        }

        const data = await response.json();

        // Get the komik array from the API response
        const komikList = data?.data?.komik || [];

        if (!Array.isArray(komikList)) {
          throw new Error("Invalid API response format");
        }

        // Transform API data to match our interface
        const transformedMangas: BannerManga[] = komikList
          .slice(0, maxItems)
          .map((manga: any) => {
            // Extract slug from link for ID
            const slug =
              manga.link?.split("/komik/")[1]?.replace(/\//g, "") ||
              manga.link?.split("/").filter(Boolean).pop() ||
              "unknown";

            const isColored = manga.warna === "Warna";
            const title = normalizeTitle(manga.judul, manga.link, 8);

            const latestChapter = manga.chapter?.[0]
              ? {
                  title: manga.chapter[0].judul || "Unknown Chapter",
                  slug:
                    manga.chapter[0].link?.split("/").filter(Boolean).pop() ||
                    "",
                  releasedAt: manga.chapter[0].tanggal_rilis || "Unknown",
                }
              : undefined;

            return {
              id: slug,
              title,
              description: latestChapter
                ? `Latest chapter: ${latestChapter.title}. Updated ${latestChapter.releasedAt}.`
                : "No description available.",
              imageUrl: manga.gambar || "",
              rating: null,
              type: manga.tipe || "Manga",
              status: "Ongoing",
              isColored,
              genres: isColored ? ["Colored"] : ["Black & White"],
              latestChapter,
            };
          });

        setMangas(transformedMangas);
        setError(null);
      } catch (err) {
        console.error("Error fetching manga:", err);
        setError("Failed to load featured manga");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangas();
  }, [apiUrl, maxItems]);

  useEffect(() => {
    if (!isAutoPlaying || mangas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mangas.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, mangas.length, autoPlayInterval]);

  const handleReadNow = () => {
    if (mangas[currentIndex]) {
      window.location.href = `/comics/${mangas[currentIndex].id}/chapter/1`;
    }
  };

  const handleMoreInfo = () => {
    if (mangas[currentIndex]) {
      window.location.href = `/comics/${mangas[currentIndex].id}`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-400 text-lg">Loading featured manga...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || mangas.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[600px] bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-lg">
            {error || "No featured manga available"}
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-white border-white/30"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const currentManga = mangas[currentIndex];

  return (
    <div
      className="relative w-full h-[400px] md:h-[600px] overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image with Parallax Effect */}
          <motion.div
            className="absolute inset-0 scale-110"
            animate={{ scale: 1.1 }}
            transition={{ duration: 10, ease: "linear" }}
          >
            <img
              src={currentManga.imageUrl || "/placeholder.svg"}
              alt={currentManga.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </motion.div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

          {/* Animated gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-red-600/20 to-blue-600/20 opacity-30 animate-pulse"></div>

          {/* Content Container */}
          <div className="absolute inset-0 flex items-center px-4 md:px-16 lg:px-24">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl space-y-4 md:space-y-6"
            >
              {/* Status Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-2 flex-wrap"
              >
                {currentManga.status === "Ongoing" && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 rounded-full shadow-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">ONGOING</span>
                  </div>
                )}
                {currentManga.status === "Completed" && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 rounded-full shadow-lg">
                    <span className="text-sm font-bold">COMPLETED</span>
                  </div>
                )}
                {currentIndex === 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">LATEST UPDATE</span>
                  </div>
                )}
                {currentManga.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 px-3 py-2 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-500">
                      {currentManga.rating}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl"
              >
                {currentManga.title}
              </motion.h1>

              {/* Type & Color Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="flex items-center gap-2"
              >
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-bold text-white">
                  {currentManga.type.toUpperCase()}
                </span>
                {currentManga.isColored && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/30 rounded-full text-sm font-bold text-purple-200">
                    FULL COLOR
                  </span>
                )}
              </motion.div>

              {/* Latest Chapter Info */}
              {currentManga.latestChapter && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col gap-1"
                >
                  <span className="text-gray-400 text-sm">Latest Chapter</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      {currentManga.latestChapter.title}
                    </span>
                    <span className="text-gray-400 text-sm">
                      • {currentManga.latestChapter.releasedAt}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-sm md:text-lg text-gray-200 leading-relaxed line-clamp-2 md:line-clamp-3 drop-shadow-lg max-w-xl"
              >
                {currentManga.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-3 md:gap-4 pt-2"
              >
                <Button
                  onClick={handleReadNow}
                  className="bg-white hover:bg-gray-100 text-black font-bold px-6 md:px-8 py-5 md:py-6 rounded-lg text-base md:text-lg shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Read Now
                </Button>
                <Button
                  onClick={handleMoreInfo}
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white font-bold px-6 md:px-8 py-5 md:py-6 rounded-lg text-base md:text-lg shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {mangas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white w-12 shadow-lg shadow-white/50"
                    : "bg-white/30 w-8 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Fade to Black Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
