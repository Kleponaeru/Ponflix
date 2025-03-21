"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MovieRow({
  title,
  movies: initialMovies,
  genreId,
  accentColor = "red",
}) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);
  const [movies, setMovies] = useState(initialMovies);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const navigate = useNavigate();

  // Check scroll state and update active dot
  useEffect(() => {
    const checkScroll = () => {
      if (rowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

        const isOngoingOrCompleted =
          title === "Ongoing Anime" || title === "Completed Anime";
        const dotCount = isOngoingOrCompleted ? 5 : 3;

        const maxScroll = scrollWidth - clientWidth;
        const segmentSize = maxScroll / (dotCount - 1);
        const currentSegment = Math.min(
          dotCount - 1,
          Math.round(scrollLeft / segmentSize)
        );
        setActiveDot(currentSegment);
      }
    };

    checkScroll();

    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll);
      return () => currentRef.removeEventListener("scroll", checkScroll);
    }
  }, [movies, title]);

  // Smooth scroll animation
  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
      const isOngoingOrCompleted =
        title === "Ongoing Anime" || title === "Completed Anime";
      const dotCount = isOngoingOrCompleted ? 5 : 3;
      const scrollAmount = clientWidth * (isOngoingOrCompleted ? 0.8 : 1);

      const targetScroll =
        direction === "left"
          ? Math.max(0, scrollLeft - scrollAmount)
          : Math.min(scrollWidth - clientWidth, scrollLeft + scrollAmount);

      const startScroll = scrollLeft;
      const distance = targetScroll - startScroll;
      const duration = 580;
      let startTime = null;

      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animateScroll = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        rowRef.current.scrollLeft = startScroll + distance * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
      setIsMoved(true);
    }
  };

  const getDetailLink = () => {
    if (title === "Ongoing Anime") return "/ongoing";
    if (title === "Completed Anime") return "/completed";
    if (genreId) return `/genres/${genreId}`;
    return "#";
  };

  // Navigate to Stream page
  const handleStreamClick = (movieId) => {
    navigate(`/stream/${movieId}`);
  };

  const getColorClasses = () => {
    const colorMap = {
      red: {
        title: "text-red-500",
        seeMore: "text-red-500 hover:text-red-600",
        badge: "bg-red-600",
        hover: "hover:text-red-500",
        button: "hover:text-red-500",
        activeButton: "bg-red-600 text-white hover:bg-red-700",
      },
      blue: {
        title: "text-blue-500",
        seeMore: "text-blue-400 hover:text-blue-300",
        badge: "bg-blue-600",
        hover: "hover:text-blue-500",
        button: "hover:text-blue-500",
        activeButton: "bg-blue-600 text-white hover:bg-blue-700",
      },
      green: {
        title: "text-green-500",
        seeMore: "text-green-400 hover:text-green-300",
        badge: "bg-green-600",
        hover: "hover:text-green-500",
        button: "hover:text-green-500",
        activeButton: "bg-green-600 text-white hover:bg-green-700",
      },
      purple: {
        title: "text-purple-500",
        seeMore: "text-purple-400 hover:text-purple-300",
        badge: "bg-purple-600",
        hover: "hover:text-purple-500",
        button: "hover:text-purple-500",
        activeButton: "bg-purple-600 text-white hover:bg-purple-700",
      },
    };
    return colorMap[accentColor] || colorMap.red;
  };

  const colors = getColorClasses();
  const isOngoingOrCompleted =
    title === "Ongoing Anime" || title === "Completed Anime";
  const dotCount = isOngoingOrCompleted ? 5 : 3;

  return (
    <div className="space-y-3 px-4 md:px-12 mt-6 md:mt-10 mb-8">
      <div className="flex justify-between items-center w-full">
        <h2
          className={`text-xl md:text-2xl font-bold flex items-center ${colors.title}`}
        >
          {title}
          {/* {movies.length > 0 && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({movies.length})
            </span>
          )} */}
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

      <div className="relative group">
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-9 w-9 
            border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-200
            ${
              canScrollLeft
                ? "opacity-80 hover:opacity-100"
                : "opacity-0 cursor-default pointer-events-none"
            }`}
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
        >
          <ChevronLeft className={`h-5 w-5 ${colors.button}`} />
        </Button>

        <div
          ref={rowRef}
          className="flex items-center space-x-4 overflow-x-scroll overflow-y-hidden scrollbar-hide py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.length > 0 ? (
            movies.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 relative"
                style={{
                  width: "clamp(130px, 18vw, 220px)",
                  height: "clamp(225px, 27vw, 360px)",
                }}
              >
                <div
                  className="w-full h-4/5 overflow-hidden rounded-lg bg-gray-800 relative cursor-pointer"
                  onClick={() => handleStreamClick(movie.id)}
                >
                  <img
                    src={movie.imageUrl || "/placeholder.svg"}
                    alt={movie.title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div
                          className={`${colors.badge} text-white text-xs font-medium px-2 py-1 rounded-sm`}
                        >
                          {title === "Ongoing Anime"
                            ? "ONGOING"
                            : title === "Completed Anime"
                            ? "COMPLETED"
                            : genreId
                            ? genreId.toUpperCase()
                            : "ANIME"}
                        </div>
                      </div>
                      <h3 className="text-white text-sm font-medium line-clamp-2">
                        {movie.title}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent div's onClick
                            handleStreamClick(movie.id);
                          }}
                          className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
                        >
                          <Play
                            className="h-3.5 w-3.5 text-white"
                            fill="white"
                          />
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors">
                          <Info className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="mt-2 px-1 cursor-pointer h-1/5 flex items-start"
                  onClick={() => handleStreamClick(movie.id)}
                >
                  <h3
                    className={`text-sm font-medium text-white ${colors.hover}`}
                    title={movie.title}
                  >
                    {movie.title.length > 25
                      ? `${movie.title.substring(0, 25)}...`
                      : movie.title}
                  </h3>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full py-10">
              <p className="text-gray-400 text-sm">No anime available</p>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className={`absolute top-0 bottom-0 right-0 z-40 m-auto h-9 w-9 
            border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-200
            ${
              canScrollRight
                ? "opacity-80 hover:opacity-100"
                : "opacity-0 cursor-default pointer-events-none"
            }`}
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
        >
          <ChevronRight className={`h-5 w-5 ${colors.button}`} />
        </Button>
      </div>

      {/* Scroll Indicator Dots */}
      {movies.length > 5 && (
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: dotCount }).map((_, index) => (
            <div
              key={index}
              className={`h-1 w-12 rounded-full ${
                index === activeDot ? colors.activeButton : "bg-gray-700"
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
