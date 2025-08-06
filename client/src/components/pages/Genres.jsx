"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../ui/Navbar";
import Skeleton from "@mui/material/Skeleton";
import { motion } from "framer-motion";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGenres, setFilteredGenres] = useState([]);
  const navigate = useNavigate();
  const apiBaseUrl = "https://wajik-anime-api.vercel.app";

  // Predefined color mappings for genres
  const genreColors = {
    action: "from-red-900 to-orange-900",
    adventure: "from-green-900 to-emerald-800",
    comedy: "from-yellow-800 to-amber-900",
    demons: "from-gray-900 to-slate-800",
    drama: "from-blue-900 to-indigo-900",
    fantasy: "from-purple-900 to-violet-900",
    horror: "from-gray-900 to-slate-800",
    mystery: "from-indigo-900 to-purple-900",
    romance: "from-pink-900 to-rose-900",
    "sci-fi": "from-cyan-900 to-blue-900",
    "slice-of-life": "from-emerald-900 to-green-900",
    sports: "from-orange-900 to-amber-900",
    supernatural: "from-violet-900 to-purple-900",
    thriller: "from-red-900 to-rose-900",
    mecha: "from-gray-800 to-gray-900",
    music: "from-blue-800 to-indigo-800",
    psychological: "from-purple-800 to-indigo-900",
    historical: "from-amber-900 to-yellow-800",
    school: "from-blue-900 to-sky-800",
  };

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/samehadaku/genres/`);
        const data = await response.json();

        // Map API data to component format
        const genreData = data.data.genreList.map((genre) => ({
          id: genre.genreId,
          name: genre.title,
          color:
            genreColors[genre.genreId.toLowerCase()] ||
            "from-gray-900 to-slate-800", // Default color if not mapped
        }));

        // Sort alphabetically by name since count isn’t available
        genreData.sort((a, b) => a.name.localeCompare(b.name));

        setGenres(genreData);
        setFilteredGenres(genreData);
      } catch (error) {
        console.error("Error fetching genres from API:", error);
        setGenres([]);
        setFilteredGenres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGenres(genres);
    } else {
      const filtered = genres.filter((genre) =>
        genre.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGenres(filtered);
    }
  }, [searchQuery, genres]);

  const handleGenreClick = (genreId) => {
    navigate(`/genres/${genreId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-16 px-4 md:px-12 pb-12">
        <div className="relative w-full h-[150px] md:h-[200px] mb-8 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-purple-900 to-blue-900 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
              <Tag className="h-6 w-6 mr-2 text-red-400" />
              Anime Genres
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Explore anime by genre. Find series that match your interests from
              action-packed adventures to heartwarming romances.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <nav className="text-sm md:text-base font-medium flex items-center gap-2">
            <Link
              to="/"
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-white">Genres</span>
          </nav>

          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {!loading && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">
              {filteredGenres.length}{" "}
              {filteredGenres.length === 1 ? "genre" : "genres"} available
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width="100%"
                height={120}
                sx={{ bgcolor: "grey.800" }}
                className="rounded-xl"
              />
            ))}
          </div>
        ) : (
          <>
            {filteredGenres.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredGenres.map((genre) => (
                  <motion.div
                    key={genre.id}
                    variants={itemVariants}
                    onClick={() => handleGenreClick(genre.id)}
                    className="cursor-pointer group"
                  >
                    <div
                      className={`relative h-[120px] rounded-xl overflow-hidden bg-gradient-to-r ${genre.color} transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg`}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors">
                            {genre.name}
                          </h3>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-black/30 hover:bg-black/50 text-white text-xs px-3 py-1 h-auto"
                          >
                            Explore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-gray-400 text-lg mb-2">
                  No genres found
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Try a different search term
                </p>
                <Button
                  variant="outline"
                  className="border-gray-700 text-red-400 hover:text-red-300"
                  onClick={() => setSearchQuery("")}
                >
                  Show All Genres
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
