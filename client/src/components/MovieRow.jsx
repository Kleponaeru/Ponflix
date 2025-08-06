"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export default function MovieRow({
  title,
  movies: initialMovies,
  genreId,
  accentColor = "red",
}) {
  const rowRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiBaseUrl = "https://wajik-anime-api.vercel.app";

  // Fetch detailed information for each movie
  const fetchMovieDetails = async (movieList) => {
    const detailedMovies = await Promise.all(
      movieList.map(async (movie) => {
        try {
          const response = await fetch(
            `${apiBaseUrl}/otakudesu/anime/${movie.id}`
          );
          const data = await response.json();

          // Check if data has the expected structure
          if (!data.data) {
            throw new Error("Invalid data format");
          }

          // Debug the structure
          console.log("API response structure:", data);

          // Handle possible nested objects that might be causing the error
          const rating =
            data.data.score && typeof data.data.score === "object"
              ? data.data.score.value || "N/A"
              : data.data.score || "N/A";

          const yearMatch = data.data.aired
            ? data.data.aired.match(/\d{4}/)
            : null;
          const year = yearMatch ? Number.parseInt(yearMatch[0]) : "N/A";

          // Handle potentially nested genre data
          let genre = "Unknown";
          if (data.data.genreList && data.data.genreList.length > 0) {
            genre =
              typeof data.data.genreList[0] === "object" &&
              data.data.genreList[0].title
                ? data.data.genreList[0].title
                : typeof data.data.genreList[0] === "string"
                ? data.data.genreList[0]
                : "Unknown";
          }

          // Process episodes safely
          const episodes =
            typeof data.data.episodes === "object"
              ? data.data.episodes.value || "N/A"
              : data.data.episodes || "N/A";

          return {
            ...movie,
            rating: rating,
            episodes: episodes,
            genre: genre,
            year: year,
            status: data.data.status || "Unknown",
          };
        } catch (error) {
          console.warn(`Failed to fetch details for ${movie.id}:`, error);
          return {
            ...movie,
            rating: "N/A",
            episodes: "N/A",
            year: "N/A",
            genre: "N/A",
            status: "Unknown",
          };
        }
      })
    );
    return detailedMovies;
  };

  // Load movies with details on component mount
  useEffect(() => {
    const loadMoviesWithDetails = async () => {
      setLoading(true);
      if (initialMovies && initialMovies.length > 0) {
        try {
          const moviesWithDetails = await fetchMovieDetails(initialMovies);
          setMovies(moviesWithDetails);
        } catch (error) {
          console.error("Error loading movie details:", error);
          setMovies(initialMovies);
        }
      } else {
        setMovies([]);
      }
      setLoading(false);
    };

    loadMoviesWithDetails();
  }, [initialMovies]);

  // Debounced scroll check to reduce event frequency
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
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
        title === "Ongoing Anime" || title === "Completed Anime";
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
    const debouncedCheckScroll = debounce(checkScroll, 100); // Debounce by 100ms
    checkScroll(); // Initial check

    const currentRef = rowRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", debouncedCheckScroll);
      return () =>
        currentRef.removeEventListener("scroll", debouncedCheckScroll);
    }
  }, [movies, checkScroll]);

  // Smooth scroll with native behavior
  const handleScroll = useCallback(
    (direction) => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
        const isOngoingOrCompleted =
          title === "Ongoing Anime" || title === "Completed Anime";
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
    if (title === "Ongoing Anime") return "/ongoing";
    if (title === "Completed Anime") return "/completed";
    if (genreId) return `/genres/${genreId}`;
    return "#";
  };

  const handleStreamClick = useCallback(
    (movieId, event) => {
      if (event) {
        event.stopPropagation();
      }
      navigate(`/stream/${movieId}`);
    },
    [navigate]
  );

  const handleInfoClick = useCallback(
    (movieId, event) => {
      if (event) {
        event.stopPropagation();
      }
      navigate(`/anime/${movieId}`);
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
        button: "hover:text-red-500",
        activeButton: "bg-red-600 text-white hover:bg-red-700",
        scrollButton: "hover:bg-red-600/20",
      },
      blue: {
        title: "text-blue-500",
        seeMore: "text-blue-400 hover:text-blue-300",
        badge: "bg-blue-600",
        hover: "text-blue-500",
        button: "hover:text-blue-500",
        activeButton: "bg-blue-600 text-white hover:bg-blue-700",
        scrollButton: "hover:bg-blue-600/20",
      },
      green: {
        title: "text-green-500",
        seeMore: "text-green-400 hover:text-green-300",
        badge: "bg-green-600",
        hover: "text-green-500",
        button: "hover:text-green-500",
        activeButton: "bg-green-600 text-white hover:bg-green-700",
        scrollButton: "hover:bg-green-600/20",
      },
      purple: {
        title: "text-purple-500",
        seeMore: "text-purple-400 hover:text-purple-300",
        badge: "bg-purple-600",
        hover: "text-purple-500",
        button: "hover:text-purple-500",
        activeButton: "bg-purple-600 text-white hover:bg-purple-700",
        scrollButton: "hover:bg-purple-600/20",
      },
    };
    return colorMap[accentColor] || colorMap.red;
  };

  const getBadgeClass = (movie) => {
    if (title === "Completed Anime" || movie.status === "Completed")
      return "bg-green-600";
    if (title === "Ongoing Anime" || movie.status === "Ongoing")
      return "bg-red-600";
    return colors.badge;
  };

  const colors = getColorClasses();
  const isOngoingOrCompleted =
    title === "Ongoing Anime" || title === "Completed Anime";
  const dotCount = isOngoingOrCompleted ? 5 : 3;

  // Simplified animation variants
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
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-shrink-0 relative"
                style={{
                  width: "clamp(130px, 18vw, 220px)",
                  height: "clamp(225px, 27vw, 360px)",
                }}
              >
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height="80%"
                  sx={{ bgcolor: "grey.800" }}
                  className="rounded-lg"
                />
                <div className="mt-2 space-y-1">
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={20}
                    sx={{ bgcolor: "grey.800" }}
                  />
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={16}
                    sx={{ bgcolor: "grey.800" }}
                  />
                </div>
              </div>
            ))
          ) : movies.length > 0 ? (
            <motion.div
              className="flex space-x-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  className="flex-shrink-0 relative group"
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
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 will-change-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {movie.rating}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div
                            className={`${getBadgeClass(
                              movie
                            )} text-white text-xs font-medium px-2 py-1 rounded-sm`}
                          >
                            {movie.status === "Completed"
                              ? "COMPLETED"
                              : movie.status === "Ongoing"
                              ? "ONGOING"
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
                            onClick={(e) => handleStreamClick(movie.id, e)}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
                            title="Watch now"
                          >
                            <Play
                              className="h-3.5 w-3.5 text-white"
                              fill="white"
                            />
                          </button>
                          <button
                            onClick={(e) => handleInfoClick(movie.id, e)}
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
                    onClick={() => handleStreamClick(movie.id)}
                  >
                    <h3
                      className={`text-sm font-medium text-white transition-colors duration-300 group-hover:${colors.hover}`}
                      title={movie.title}
                    >
                      {movie.title.length > 25
                        ? `${movie.title.substring(0, 25)}...`
                        : movie.title}
                    </h3>
                    <div className="flex flex-wrap justify-between items-center mt-1 w-full">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                        <span>{movie.year}</span>
                        <span className="mx-1">•</span>
                        <span>{movie.episodes} Ep</span>
                      </div>
                      {movie.genre && (
                        <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300 mt-1 sm:mt-0">
                          {movie.genre}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center w-full py-10">
              <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            </div>
          )}
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

      {!loading && movies.length > 5 && (
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
