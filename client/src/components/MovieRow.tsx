"use client";
import React from 'react';  // Add this line
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Movie {
  id: number;
  title: string;
  imageUrl: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    setIsMoved(true);

    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });

      // Show left arrow only if we've scrolled right
      setShowLeftArrow(direction === "right" || scrollLeft > 0);
    }
  };

  return (
    <div className="space-y-1 md:space-y-2 px-4 md:px-16 mt-4 md:mt-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">{title}</h2>

      <div className="group relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 opacity-0 transition hover:scale-125 group-hover:opacity-100 ${
            !showLeftArrow && "hidden"
          }`}
          onClick={() => handleScroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Movie Slider */}
        <div
          ref={rowRef}
          className="flex items-center space-x-1 md:space-x-2 overflow-x-scroll scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="min-w-[150px] md:min-w-[200px] lg:min-w-[250px] h-[84px] md:h-[113px] lg:h-[141px] cursor-pointer relative transition duration-200 ease-out md:hover:scale-105"
            >
              <img
                src={movie.imageUrl || "/placeholder.svg"}
                alt={movie.title}
                className="rounded-sm object-cover w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
                <p className="text-xs md:text-sm text-white">{movie.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleScroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
