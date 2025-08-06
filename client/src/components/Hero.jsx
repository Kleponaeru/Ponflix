"use client";
import { useState, useEffect } from "react";
import { Play, Info, Star, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecryptedText from "./ui/DecryptedText";
import Skeleton from "@mui/material/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add this import

export default function Hero() {
  const [featuredAnime, setFeaturedAnime] = useState(null);
  const [fade, setFade] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const apiBaseUrl = "https://wajik-anime-api.vercel.app";
  const navigate = useNavigate(); // Add this hook

  const ANIMATION_DURATION = 8;

  const daysName = {
    Senin: "Monday",
    Selasa: "Tuesday",
    Rabu: "Wednesday",
    Kamis: "Thursday",
    Jumat: "Friday",
    Sabtu: "Saturday",
    Minggu: "Sunday",
  };

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/samehadaku/ongoing?page=1`);
        const data = await response.json();
        const animeList = data.data.animeList;

        const pickRandomAnime = () => {
          const randomIndex = Math.floor(Math.random() * animeList.length);
          const anime = animeList[randomIndex];
          const englishReleaseDay =
            daysName[anime.releaseDay] || anime.releaseDay;
          return {
            id: anime.animeId,
            title: anime.title,
            poster: anime.poster,
            episodes: anime.episodes,
            releaseDay: englishReleaseDay,
            latestReleaseDate: anime.latestReleaseDate,
            description: `Latest episode released on ${anime.latestReleaseDate}. A ${anime.episodes}-episode series airing every ${englishReleaseDay}.`,
          };
        };

        setFeaturedAnime(pickRandomAnime());
        setProgressKey(1);

        const interval = setInterval(() => {
          setFade(false);
          setTimeout(() => {
            setFeaturedAnime(pickRandomAnime());
            setFade(true);
            setProgressKey((prev) => prev + 1);
          }, 500);
        }, ANIMATION_DURATION * 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error fetching anime data:", error);
        setFeaturedAnime({
          title: "Error",
          poster: "/placeholder.svg?height=450&width=300",
          description: "Failed to load anime data.",
          episodes: "?",
          releaseDay: "Unknown",
          latestReleaseDate: "Unknown",
        });
      }
    };

    fetchAnimeData();
  }, [apiBaseUrl]);

  // Navigate to Stream page with the featured anime's ID
  const handleStreamClick = () => {
    if (featuredAnime && featuredAnime.id) {
      navigate(`/stream/${featuredAnime.id}`);
    }
  };

  return (
    <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] mt-4 mb-8 overflow-hidden mx-2 sm:mx-4 rounded-xl sm:rounded-2xl">
      {/* Background Image */}
      <AnimatePresence>
        {featuredAnime && (
          <motion.div
            key={featuredAnime.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${featuredAnime.poster})`,
                filter: "blur(20px)",
                transform: "scale(1.1)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Layout */}
      <div className="md:hidden relative z-10 container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col items-center text-white">
          {featuredAnime && (
            <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full mb-3 z-10">
              FEATURED ANIME
            </div>
          )}

          <div className="w-full flex justify-center mb-4">
            {!featuredAnime ? (
              <Skeleton
                variant="rounded"
                width={200}
                height={300}
                sx={{ bgcolor: "grey.800" }}
                className="rounded-xl"
              />
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img
                  src={featuredAnime.poster || "/placeholder.svg"}
                  alt={featuredAnime.title}
                  className="w-auto h-[200px] sm:h-[250px] object-cover rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.7)]"
                />
              </motion.div>
            )}
          </div>

          <div className="w-full text-center px-2">
            {!featuredAnime ? (
              <>
                <Skeleton
                  variant="text"
                  width="100%"
                  height={40}
                  sx={{ bgcolor: "grey.800" }}
                />
                <div className="flex justify-center gap-2 mt-3 mb-4">
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    sx={{ bgcolor: "grey.800", borderRadius: "4px" }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    sx={{ bgcolor: "grey.800", borderRadius: "4px" }}
                  />
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <Skeleton
                    variant="rounded"
                    width={100}
                    height={40}
                    sx={{ bgcolor: "grey.800", borderRadius: "8px" }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={100}
                    height={40}
                    sx={{ bgcolor: "grey.800", borderRadius: "8px" }}
                  />
                </div>
              </>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={featuredAnime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                    <DecryptedText
                      text={featuredAnime.title}
                      animateOn="view"
                      revealDirection="center"
                    />
                  </h1>

                  <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      <span>Airs on {featuredAnime.releaseDay}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      <span>Latest: {featuredAnime.latestReleaseDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                      <span>{featuredAnime.episodes} Episodes</span>
                    </div>
                  </div>

                  <div className="mt-2 hidden sm:block">
                    <p className="text-sm text-gray-200">
                      <DecryptedText
                        text={featuredAnime.description}
                        animateOn="view"
                        revealDirection="center"
                      />
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 mt-4">
                    <Button
                      size="sm"
                      onClick={handleStreamClick} // Add onClick handler
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1 rounded-lg text-sm"
                    >
                      <Play className="h-3 w-3 sm:h-4 sm:w-4" fill="white" />
                      <span className="font-medium">Watch</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-500 text-black hover:bg-white/10 flex items-center gap-1 px-3 py-1 rounded-lg text-sm"
                    >
                      <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium">Info</span>
                    </Button>
                  </div>

                  <div className="mt-4 px-4">
                    <div className="w-full h-1 rounded-full bg-gray-700 overflow-hidden">
                      <motion.div
                        key={`progress-mobile-${progressKey}`}
                        className="h-full bg-red-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: ANIMATION_DURATION,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block relative z-10 container h-full mx-auto px-4 py-8">
        <div className="flex items-center h-full">
          <div className="w-1/3 flex justify-end pr-8">
            {!featuredAnime ? (
              <Skeleton
                variant="rounded"
                width={280}
                height={400}
                sx={{ bgcolor: "grey.800" }}
                className="rounded-2xl"
              />
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group"
              >
                <img
                  src={featuredAnime.poster || "/placeholder.svg"}
                  alt={featuredAnime.title}
                  className="w-auto h-[400px] object-cover rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(255,0,0,0.3)]"
                />
                <div className="absolute inset-0 rounded-2xl ring-2 ring-red-500/0 group-hover:ring-red-500/50 transition-all duration-300" />
              </motion.div>
            )}
          </div>

          <div className="w-2/3 flex flex-col justify-center text-white">
            {!featuredAnime ? (
              <>
                <Skeleton
                  variant="text"
                  width="70%"
                  height={60}
                  sx={{ bgcolor: "grey.800" }}
                />
                <div className="flex gap-2 mt-3 mb-4">
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    sx={{ bgcolor: "grey.800", borderRadius: "4px" }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={80}
                    height={24}
                    sx={{ bgcolor: "grey.800", borderRadius: "4px" }}
                  />
                </div>
                <Skeleton
                  variant="text"
                  width="90%"
                  height={24}
                  className="mt-2"
                  sx={{ bgcolor: "grey.800" }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={24}
                  className="mt-1"
                  sx={{ bgcolor: "grey.800" }}
                />
                <div className="flex gap-3 mt-6">
                  <Skeleton
                    variant="rounded"
                    width={120}
                    height={48}
                    sx={{ bgcolor: "grey.800", borderRadius: "8px" }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={140}
                    height={48}
                    sx={{ bgcolor: "grey.800", borderRadius: "8px" }}
                  />
                </div>
              </>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={featuredAnime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full mb-3">
                    FEATURED ANIME
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                    <DecryptedText
                      text={featuredAnime.title}
                      animateOn="view"
                      revealDirection="center"
                    />
                  </h1>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span>Airs on {featuredAnime.releaseDay}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>Latest: {featuredAnime.latestReleaseDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{featuredAnime.episodes} Episodes</span>
                    </div>
                  </div>

                  <div className="mt-4 max-w-[600px]">
                    <p className="text-base lg:text-lg text-gray-200">
                      <DecryptedText
                        text={featuredAnime.description}
                        animateOn="view"
                        revealDirection="center"
                      />
                    </p>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button
                      size="lg"
                      onClick={handleStreamClick} // Add onClick handler
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-6 py-6 rounded-xl transition-transform hover:scale-105"
                    >
                      <Play className="h-5 w-5" fill="white" />
                      <span className="font-semibold">Watch Now</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-500 text-black hover:bg-white/10 hover:text-white flex items-center gap-2 px-6 py-6 rounded-xl"
                    >
                      <Info className="h-5 w-5" />
                      <span className="font-semibold">More Info</span>
                    </Button>
                  </div>

                  <div className="mt-8 max-w-md">
                    <div className="w-full h-1 rounded-full bg-gray-700 overflow-hidden">
                      <motion.div
                        key={`progress-desktop-${progressKey}`}
                        className="h-full bg-red-600"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: ANIMATION_DURATION,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
