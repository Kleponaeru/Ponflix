"use client";

import { useState, useRef, useEffect, useCallback, JSX } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Star,
  Calendar,
  Loader2,
  Sparkles,
  TrendingUp,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "@mui/material/Skeleton";
import type { Manga } from "@/types/manga";
import { MangaListItem } from "@/types/manga-list";

interface MangaRowProps {
  title: string;
  mangas: MangaListItem[];
  accentColor?: "red" | "blue" | "green" | "purple" | "orange";
  genreId?: string;
  isLoading?: boolean;
}

export default function MangaRow({
  title,
  mangas = [],
  accentColor = "red",
  genreId,
  isLoading = false,
}: MangaRowProps): JSX.Element | null {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const navigate = useNavigate();

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const checkScroll = useCallback(() => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      const isOngoingOrCompleted =
        title === "Ongoing Manga" || title === "Completed Manga";
      const dotCount = isOngoingOrCompleted ? 5 : 3;

      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) {
        setActiveDot(0);
        return;
      }

      const scrollRatio = scrollLeft / maxScroll;
      const dotIndex = Math.min(
        dotCount - 1,
        Math.floor(scrollRatio * dotCount)
      );
      setActiveDot(dotIndex);
    }
  }, [title]);

  useEffect(() => {
    const debouncedCheckScroll = debounce(checkScroll, 100);
    checkScroll();
    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", debouncedCheckScroll);
      return () =>
        currentRef.removeEventListener("scroll", debouncedCheckScroll);
    }
  }, [mangas, checkScroll]);

  const handleScroll = useCallback(
    (direction: "left" | "right") => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
        const isOngoingOrCompleted =
          title === "Ongoing Manga" || title === "Completed Manga";
        const scrollAmount = clientWidth * (isOngoingOrCompleted ? 0.75 : 0.85);

        const targetScroll =
          direction === "left"
            ? Math.max(0, scrollLeft - scrollAmount)
            : Math.min(scrollWidth - clientWidth, scrollLeft + scrollAmount);

        rowRef.current.scrollTo({
          left: targetScroll,
          behavior: "smooth",
        });
      }
    },
    [title]
  );

  const getDetailLink = () => {
    if (title === "Ongoing Manga") return "/ongoing";
    if (title === "Completed Manga") return "/completed";
    if (genreId) return `/comics/category/${genreId}`;
    return "#";
  };

  const handleStreamClick = useCallback(
    (mangaId: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      navigate(`/comics/${mangaId}/chapter/1`);
    },
    [navigate]
  );

  const handleInfoClick = useCallback(
    (mangaId: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      navigate(`/comics/${mangaId}`);
    },
    [navigate]
  );

  const getColorClasses = () => {
    const colorMap = {
      red: {
        title: "text-red-500",
        gradient: "from-red-500/20 via-transparent to-transparent",
        seeMore: "text-red-400 hover:text-red-300",
        badge: "bg-gradient-to-r from-red-600 to-red-500",
        hover: "text-red-400",
        button: "text-red-400",
        activeButton: "bg-gradient-to-r from-red-600 to-red-500",
        scrollButton: "hover:bg-red-600/30 border-red-500/30",
        glow: "shadow-red-500/50",
      },
      blue: {
        title: "text-blue-500",
        gradient: "from-blue-500/20 via-transparent to-transparent",
        seeMore: "text-blue-400 hover:text-blue-300",
        badge: "bg-gradient-to-r from-blue-600 to-blue-500",
        hover: "text-blue-400",
        button: "text-blue-400",
        activeButton: "bg-gradient-to-r from-blue-600 to-blue-500",
        scrollButton: "hover:bg-blue-600/30 border-blue-500/30",
        glow: "shadow-blue-500/50",
      },
      green: {
        title: "text-green-500",
        gradient: "from-green-500/20 via-transparent to-transparent",
        seeMore: "text-green-400 hover:text-green-300",
        badge: "bg-gradient-to-r from-green-600 to-green-500",
        hover: "text-green-400",
        button: "text-green-400",
        activeButton: "bg-gradient-to-r from-green-600 to-green-500",
        scrollButton: "hover:bg-green-600/30 border-green-500/30",
        glow: "shadow-green-500/50",
      },
      purple: {
        title: "text-purple-500",
        gradient: "from-purple-500/20 via-transparent to-transparent",
        seeMore: "text-purple-400 hover:text-purple-300",
        badge: "bg-gradient-to-r from-purple-600 to-purple-500",
        hover: "text-purple-400",
        button: "text-purple-400",
        activeButton: "bg-gradient-to-r from-purple-600 to-purple-500",
        scrollButton: "hover:bg-purple-600/30 border-purple-500/30",
        glow: "shadow-purple-500/50",
      },
      orange: {
        title: "text-orange-500",
        gradient: "from-orange-500/20 via-transparent to-transparent",
        seeMore: "text-orange-400 hover:text-orange-300",
        badge: "bg-gradient-to-r from-orange-600 to-orange-500",
        hover: "text-orange-400",
        button: "text-orange-400",
        activeButton: "bg-gradient-to-r from-orange-600 to-orange-500",
        scrollButton: "hover:bg-orange-600/30 border-orange-500/30",
        glow: "shadow-orange-500/50",
      },
    };
    return colorMap[accentColor] || colorMap.red;
  };

  const getBadgeClass = (manga: Manga): string => {
    if (title === "Completed Manga" || manga.status === "Completed")
      return "bg-gradient-to-r from-green-600 to-green-500";
    if (title === "Ongoing Manga" || manga.status === "Ongoing")
      return "bg-gradient-to-r from-red-600 to-red-500";
    return getColorClasses().badge;
  };

  const colors = getColorClasses();
  const isOngoingOrCompleted =
    title === "Ongoing Manga" || title === "Completed Manga";
  const dotCount = isOngoingOrCompleted ? 5 : 3;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (mangas.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 px-4 md:px-12 mt-8 md:mt-12 mb-10">
        {/* Enhanced Header with gradient background */}
        <div className="relative">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} blur-3xl -z-10`}
          ></div>
          <div className="flex justify-between items-center w-full pb-2 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-1 h-8 ${colors.activeButton} rounded-full`}
              ></div>
              <h2
                className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${colors.title}`}
              >
                {title}
                {title.includes("Trending") && (
                  <TrendingUp className="h-5 w-5 animate-pulse" />
                )}
                {title.includes("New") && (
                  <Sparkles className="h-5 w-5 animate-pulse" />
                )}
              </h2>
            </div>
            <Link to={getDetailLink()}>
              <Button
                variant="link"
                className={`text-sm md:text-base font-semibold ${colors.seeMore} flex items-center gap-1 group`}
              >
                Explore All
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative group/row">
          {/* Enhanced scroll buttons */}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-10 w-10 
            rounded-full backdrop-blur-md transition-all duration-300
            ${colors.scrollButton}
            ${
              canScrollLeft
                ? "opacity-0 group-hover/row:opacity-100 shadow-lg"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className={`h-5 w-5 ${colors.button}`} />
          </Button>

          <div
            ref={rowRef}
            className="flex items-center space-x-5 overflow-x-scroll overflow-y-hidden scrollbar-hide pb-12 will-change-scroll"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading ? (
              <div className="flex space-x-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0"
                    style={{
                      width: "clamp(140px, 19vw, 230px)",
                      height: "clamp(240px, 28vw, 380px)",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="82%"
                      sx={{ bgcolor: "grey.900", borderRadius: "12px" }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      sx={{ bgcolor: "grey.900", mt: 1.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      sx={{ bgcolor: "grey.900" }}
                    />
                  </div>
                ))}
              </div>
            ) : mangas.length > 0 ? (
              <motion.div
                className="flex space-x-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {mangas.map((manga, index) => (
                  <motion.div
                    key={manga.id}
                    variants={itemVariants}
                    className="flex-shrink-0 relative group/card"
                    style={{
                      width: "clamp(140px, 19vw, 230px)",
                      height: "clamp(240px, 28vw, 380px)",
                    }}
                  >
                    {/* Card with enhanced styling */}
                    <div
                      className="w-full h-4/5 overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-gray-800 relative cursor-pointer
                    border border-gray-800 group-hover/card:border-gray-700 transition-all duration-300
                    shadow-lg group-hover/card:shadow-2xl"
                      onClick={() => handleInfoClick(manga.id)}
                    >
                      {/* Ranking badge for first 3 items */}
                      {index < 3 && (
                        <div
                          className={`absolute top-3 left-3 ${colors.activeButton} text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg flex items-center gap-1`}
                        >
                          <Flame className="w-3 h-3 fill-current" />
                        </div>
                      )}

                      <img
                        src={manga.imageUrl || "/placeholder.svg"}
                        alt={manga.title}
                        className="object-cover w-full h-full transition-all duration-500 group-hover/card:scale-110 will-change-transform"
                        loading="lazy"
                      />

                      {/* Enhanced gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                        <div className="flex flex-col gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                          <div className="flex justify-between items-start">
                            <div
                              className={`${
                                manga.isColored
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                  : "bg-gray-700"
                              } text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg`}
                            >
                              {manga.isColored ? "COLORED" : "B&W"}
                            </div>
                          </div>
                          <h3 className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
                            {manga.title}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={(e) => handleStreamClick(manga.id, e)}
                              className="bg-white hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                              title="Read now"
                            >
                              <Play
                                className="h-3.5 w-3.5 text-black"
                                fill="black"
                              />
                            </button>
                            <button
                              onClick={(e) => handleInfoClick(manga.id, e)}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                              title="More info"
                            >
                              <Info className="h-3.5 w-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced bottom info */}
                    <div
                      className="mt-3 px-1 cursor-pointer h-1/5 flex flex-col"
                      onClick={() => handleStreamClick(manga.id)}
                    >
                      <h3
                        className={`text-sm font-semibold text-white transition-colors duration-300 group-hover/card:${colors.hover} line-clamp-1`}
                        title={manga.title}
                      >
                        {manga.title}
                      </h3>

                      <div className="flex flex-wrap items-center mt-1.5 w-full gap-1">
                        <div className="flex items-center text-xs text-gray-400">
                          <span className="px-2 py-0.5 bg-gray-800 rounded-md font-medium">
                            {manga.type}
                          </span>

                          {manga.latestChapter && (
                            <>
                              <span className="mx-1.5 text-gray-600">•</span>
                              <span className="text-gray-500">
                                {manga.latestChapter.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={`absolute top-0 bottom-0 right-0 z-40 m-auto h-10 w-10 
            rounded-full backdrop-blur-md transition-all duration-300
            ${colors.scrollButton}
            ${
              canScrollRight
                ? "opacity-0 group-hover/row:opacity-100 shadow-lg"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className={`h-5 w-5 ${colors.button}`} />
          </Button>
        </div>

        {/* Enhanced progress dots */}
        {!isLoading && mangas.length > 5 && (
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: dotCount }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeDot
                    ? `${colors.activeButton} w-20 shadow-lg ${colors.glow}`
                    : "bg-gray-800 w-10 hover:bg-gray-700"
                }`}
              ></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
