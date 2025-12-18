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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "@mui/material/Skeleton";
import type { Manga } from "@/types/manga";

interface MangaRowProps {
  title: string;
  mangas: Manga[];
  accentColor?: "red" | "blue" | "green";
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
    if (genreId) return `/genres/${genreId}`;
    return "#";
  };

  const handleStreamClick = useCallback(
    (mangaId: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      navigate(`/chapter/${mangaId}-chapter-1`);
    },
    [navigate]
  );

  const handleInfoClick = useCallback(
    (mangaId: string, event?: React.MouseEvent) => {
      event?.stopPropagation();
      navigate(`/manga/${mangaId}`);
    },
    [navigate]
  );

  const getColorClasses = () => {
    const colorMap = {
      red: {
        title: "text-red-500",
        seeMore: "text-red-500 hover:text-red-600",
        badge: "bg-red-600",
        hover: "text-red-500",
        button: "hover:text-red-red-500",
        activeButton: "bg-red-600 text-white hover:bg-red-700",
        scrollButton: "hover:bg-red-600/20",
      },
      blue: {
        title: "text-blue-500",
        seeMore: "text-blue-500 hover:text-blue-600",
        badge: "bg-blue-600",
        hover: "text-blue-500",
        button: "hover:text-blue-500",
        activeButton: "bg-blue-600 text-white hover:bg-blue-700",
        scrollButton: "hover:bg-blue-600/20",
      },
      green: {
        title: "text-green-500",
        seeMore: "text-green-500 hover:text-green-600",
        badge: "bg-green-600",
        hover: "text-green-500",
        button: "hover:text-green-500",
        activeButton: "bg-green-600 text-white hover:bg-green-700",
        scrollButton: "hover:bg-green-600/20",
      },
    };
    return colorMap[accentColor] || colorMap.red;
  };

  const getBadgeClass = (manga: Manga): string => {
    if (title === "Completed Manga" || manga.status === "Completed")
      return "bg-green-600";
    if (title === "Ongoing Manga" || manga.status === "Ongoing")
      return "bg-red-600";
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
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  // Only hide if not loading and no mangas
  if (mangas.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-3 px-4 md:px-12 mt-6 md:mt-10 mb-8">
      <div className="flex justify-between items-center w-full">
        <h2
          className={`text-xl md:text-2xl font-bold flex items-center ${colors.title}`}
        >
          {title}
        </h2>
        <Link to={getDetailLink()}>
          <Button
            variant="link"
            className={`text-sm md:text-base font-medium ${colors.seeMore}`}
          >
            See All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-9 w-9 
            border border-gray-700 bg-black/70 backdrop-blur-sm transition-opacity duration-200
            ${colors.scrollButton}
            ${
              canScrollLeft
                ? "opacity-80 hover:opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
        >
          <ChevronLeft className={`h-5 w-5 ${colors.button}`} />
        </Button>

        <div
          ref={rowRef}
          className="flex items-center space-x-4 overflow-x-scroll overflow-y-hidden scrollbar-hide pb-12 will-change-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            // Show loading skeletons
            <div className="flex space-x-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    width: "clamp(130px, 18vw, 220px)",
                    height: "clamp(225px, 27vw, 360px)",
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="80%"
                    sx={{ bgcolor: "grey.900", borderRadius: "8px" }}
                  />
                  <Skeleton
                    variant="text"
                    width="80%"
                    sx={{ bgcolor: "grey.900", mt: 1 }}
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
              className="flex space-x-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {mangas.map((manga) => (
                <motion.div
                  key={manga.id}
                  variants={itemVariants}
                  className="flex-shrink-0 relative group"
                  style={{
                    width: "clamp(130px, 18vw, 220px)",
                    height: "clamp(225px, 27vw, 360px)",
                  }}
                >
                  <div
                    className="w-full h-4/5 overflow-hidden rounded-lg bg-gray-800 relative cursor-pointer"
                    onClick={() => handleStreamClick(manga.id)}
                  >
                    <img
                      src={manga.imageUrl || "/placeholder.svg"}
                      alt={manga.title}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 will-change-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {manga.rating}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div
                            className={`${getBadgeClass(
                              manga
                            )} text-white text-xs font-medium px-2 py-1 rounded-sm`}
                          >
                            {manga.status === "Colored"
                              ? "COLOR"
                              : manga.status}
                          </div>
                        </div>
                        <h3 className="text-white text-sm font-medium line-clamp-2">
                          {manga.title}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={(e) => handleStreamClick(manga.id, e)}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
                            title="Read now"
                          >
                            <Play
                              className="h-3.5 w-3.5 text-white"
                              fill="white"
                            />
                          </button>
                          <button
                            onClick={(e) => handleInfoClick(manga.id, e)}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
                            title="More info"
                          >
                            <Info className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-2 px-1 cursor-pointer h-1/5 flex flex-col"
                    onClick={() => handleStreamClick(manga.id)}
                  >
                    <h3
                      className={`text-sm font-medium text-white transition-colors duration-300 group-hover:${colors.hover}`}
                      title={manga.title}
                    >
                      {manga.title.length > 25
                        ? `${manga.title.substring(0, 25)}...`
                        : manga.title}
                    </h3>
                    <div className="flex flex-wrap justify-between items-center mt-1 w-full">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                        <span>{manga.year}</span>
                        <span className="mx-1">•</span>
                        <span>{manga.episodes} Ch</span>
                      </div>
                      {manga.genre && (
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300 mt-1 sm:mt-0">
                          {manga.genre}
                        </span>
                      )}
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
          className={`absolute top-0 bottom-0 right-0 z-40 m-auto h-9 w-9 
            border border-gray-700 bg-black/70 backdrop-blur-sm transition-opacity duration-200
            ${colors.scrollButton}
            ${
              canScrollRight
                ? "opacity-80 hover:opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
        >
          <ChevronRight className={`h-5 w-5 ${colors.button}`} />
        </Button>
      </div>

      {!isLoading && mangas.length > 5 && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: dotCount }).map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeDot
                  ? `${colors.activeButton} w-16`
                  : "bg-gray-700 w-8"
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
