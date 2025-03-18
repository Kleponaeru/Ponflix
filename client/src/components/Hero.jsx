"use client";
import React, { useState, useEffect } from "react";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecryptedText from "./DecryptedText";
export default function Hero() {
  const [featuredAnime, setFeaturedAnime] = useState({
    title: "Loading...",
    poster: "/placeholder.svg?height=450&width=300",
    description: "Fetching anime data...",
  });
  const [fade, setFade] = useState(true); // For fade transition effect
  const apiBaseUrl = "http://localhost:3001"; // Your API URL

  // Map Indonesian days to English
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
        const response = await fetch(`${apiBaseUrl}/otakudesu/ongoing?page=1`);
        const data = await response.json();
        const animeList = data.data.animeList;

        // Function to pick a random anime
        const pickRandomAnime = () => {
          const randomIndex = Math.floor(Math.random() * animeList.length);
          const anime = animeList[randomIndex];
          const englishReleaseDay =
            daysName[anime.releaseDay] || anime.releaseDay; // Default to original if not found
          return {
            title: anime.title,
            poster: anime.poster,
            description: `Latest episode released on ${anime.latestReleaseDate}. A ${anime.episodes}-episode series airing every ${englishReleaseDay}.`,
          };
        };

        // Set initial random anime
        setFeaturedAnime(pickRandomAnime());

        // Change anime every 5 seconds with fade effect
        const interval = setInterval(() => {
          setFade(false); // Fade out
          setTimeout(() => {
            setFeaturedAnime(pickRandomAnime());
            setFade(true); // Fade in
          }, 500); // Match this with the transition duration
        }, 5000); // 5000ms = 5 seconds

        // Cleanup interval on unmount
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error fetching anime data:", error);
        setFeaturedAnime({
          title: "Error",
          poster: "/placeholder.svg?height=450&width=300",
          description: "Failed to load anime data.",
        });
      }
    };

    fetchAnimeData();
  }, [apiBaseUrl]);

  return (
    <div className="relative h-[40vw] md:h-[25vw] min-h-[400px] mt-10 md:mt-20 mb-10 md:mb-20 pt-20 pb-12 bg-black rounded-2xl overflow-hidden mx-4 md:mx-8">
      {/* Transparent Overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="absolute inset-0 flex items-center justify-between px-4 md:px-16 z-10">
        {/* Poster Image on the Left with Effects */}
        <div className="w-[40%] md:w-1/4 h-auto flex justify-center">
          <img
            src={featuredAnime.poster}
            alt={featuredAnime.title}
            className={`w-auto h-[50vw] max-h-[400px] object-cover rounded-2xl shadow-lg transition-all duration-500 transform ${
              fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </div>
        {/* Content on the Right */}
        <div className="w-2/3 md:w-3/4 pl-4 md:pl-8 flex flex-col justify-center h-full text-white text-shadow">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
            <DecryptedText
              text={featuredAnime.title}
              animateOn="view"
              revealDirection="center"
            />
          </h1>
          <div className="max-w-[80%] md:max-w-[60%] lg:max-w-[50%] mt-2">
            <p className="text-sm md:text-base lg:text-lg">
              <DecryptedText
                text={featuredAnime.description}
                animateOn="view"
                revealDirection="center"
              />
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="flex items-center gap-2 bg-white text-black hover:bg-white/90">
              <Play className="h-5 w-5" />
              <span>Play</span>
            </Button>
            <Button
              variant="secondary"
              className="flex items-center gap-2 bg-gray-500/70 text-white hover:bg-gray-500/50"
            >
              <Info className="h-5 w-5" />
              <span>More Info</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
