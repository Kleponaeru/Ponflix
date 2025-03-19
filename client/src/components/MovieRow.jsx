import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";

export default function MovieRow({ title, movies: initialMovies, genreId }) {
  const rowRef = useRef(null);
  const [isMoved, setIsMoved] = useState(false);
  const [movies, setMovies] = useState(initialMovies);

  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
      setIsMoved(scrollLeft > 0 || direction === "right");
    }
  };

  const getDetailLink = () => {
    if (title === "Ongoing Anime") return "/ongoing";
    if (title === "Completed Anime") return "/completed";
    if (genreId) return `/genres/${genreId}`;
    return "#";
  };

  return (
    <div className="space-y-2 px-4 md:px-12 mt-4 md:mt-8">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
          {title}
        </h2>
        <Link to={getDetailLink()}>
          <Button
            variant="link"
            className="text-sm md:text-base text-blue-400 hover:text-blue-600"
          >
            See More
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 opacity-0 transition hover:scale-125 hover:opacity-100 ${
            !isMoved && "hidden"
          }`}
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div
          ref={rowRef}
          className="flex items-center space-x-2 overflow-x-scroll overflow-y-hidden scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies && movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="group min-w-[120px] md:min-w-[160px] lg:min-w-[220px] h-[180px] md:h-[240px] lg:h-[320px] cursor-pointer relative transition duration-200 ease-out hover:scale-105"
              >
                <img
                  src={movie.imageUrl || "/placeholder.svg"}
                  alt={movie.title}
                  className="rounded-md object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                  <p className="text-xs sm:text-sm md:text-base text-white font-medium truncate drop-shadow-md">
                    {movie.title}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={120}
                  height={180}
                  sx={{ bgcolor: "grey.800", borderRadius: "8px" }}
                />
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 opacity-0 transition hover:scale-125 hover:opacity-100"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
