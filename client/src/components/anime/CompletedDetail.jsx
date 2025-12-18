"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../ui/Navbar";
import Skeleton from "@mui/material/Skeleton";
import { motion } from "framer-motion";

export default function CompletedDetail() {
  const [animeList, setAnimeList] = useState([]);
  const [allAnimeData, setAllAnimeData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const navigate = useNavigate();

  const apiBaseUrl = "https://wajik-anime-api.vercel.app";
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchAllData = async () => {
      setInitialLoading(true);
      let currentPage = 1;
      let allAnime = [];
      let hasMore = true;

      try {
        while (hasMore) {
          const res = await fetch(
            `${apiBaseUrl}/samehadaku/completed?page=${currentPage}`
          );
          const data = await res.json();

          const animeWithDetails = await Promise.all(
            data.data.animeList.map(async (anime) => {
              try {
                const detailRes = await fetch(
                  `${apiBaseUrl}/samehadaku/anime/${anime.animeId}`
                );
                const detailData = await detailRes.json();
                const rating = detailData.data.score || "N/A";

                const yearMatch = detailData.data.aired
                  ? detailData.data.aired.match(/\d{4}/)
                  : null;
                const year = yearMatch ? parseInt(yearMatch[0]) : null;

                const genre =
                  detailData.data.genreList &&
                  detailData.data.genreList.length > 0
                    ? detailData.data.genreList[0].title
                    : "Unknown";

                return {
                  id: anime.animeId,
                  title: anime.title,
                  imageUrl: anime.poster,
                  rating: rating,
                  episodes: anime.episodes,
                  year: year,
                  genre: genre,
                  genres: detailData.data.genreList || [],
                };
              } catch (error) {
                console.error(
                  `Error fetching details for ${anime.animeId}:`,
                  error
                );
                return {
                  id: anime.animeId,
                  title: anime.title,
                  imageUrl: anime.poster,
                  episodes: anime.episodes,
                  rating: "N/A",
                  year: null,
                  genre: "Unknown",
                };
              }
            })
          );

          allAnime = [...allAnime, ...animeWithDetails];
          hasMore = data.data.animeList.length === itemsPerPage;
          currentPage++;
          if (currentPage > 100) {
            console.warn(
              "Reached page limit of 100 for completed. Assuming this is the end."
            );
            break;
          }
        }

        console.log(`Total items for completed: ${allAnime.length}`);
        setAllAnimeData(allAnime);
        setFilteredData(allAnime);
        setTotalPages(Math.ceil(allAnime.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching all completed anime:", error);
        setAllAnimeData([]);
        setFilteredData([]);
        setTotalPages(0);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(allAnimeData);
    } else {
      const filtered = allAnimeData.filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setPage(1);
  }, [searchQuery, allAnimeData]);

  useEffect(() => {
    const sorted = [...filteredData];

    switch (sortOption) {
      case "title-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "rating-desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "year-desc":
        sorted.sort((a, b) => b.year - a.year);
        break;
      default:
        break;
    }

    setFilteredData(sorted);
    setPage(1);
  }, [sortOption]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (filteredData.length > 0) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setAnimeList(filteredData.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      } else {
        setAnimeList([]);
        setTotalPages(0);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, filteredData]);

  const handlePrevPage = () => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setPage(page + 1);
    }
  };

  // Navigate to Stream page
  const handleStreamClick = (animeId) => {
    navigate(`/stream/${animeId}`);
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-red-900 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-400" />
              Completed Anime
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Browse our collection of completed anime series. All episodes
              available to watch.
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
            <span className="text-white">Completed Anime</span>
          </nav>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="default">Sort By: Default</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="year-desc">Newest First</option>
            </select>

            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <input
                type="text"
                placeholder="Search anime..."
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
        </div>

        {!initialLoading && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">
              Showing{" "}
              {filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(page * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} anime
            </p>
          </div>
        )}

        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={0}
                  className="w-full aspect-[2/3] rounded-lg"
                  sx={{ bgcolor: "grey.800" }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  sx={{ bgcolor: "grey.800" }}
                />
                <Skeleton
                  variant="text"
                  width="50%"
                  height={16}
                  sx={{ bgcolor: "grey.800" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-red-500" />
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {animeList.length > 0 ? (
                  animeList.map((anime) => (
                    <motion.div
                      key={anime.id}
                      variants={itemVariants}
                      onClick={() => handleStreamClick(anime.id)}
                      className="group flex flex-col cursor-pointer"
                    >
                      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg mb-2 bg-gray-800">
                        <img
                          src={anime.imageUrl || "/placeholder.svg"}
                          alt={anime.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-sm inline-block mb-2">
                              COMPLETED
                            </div>
                            <p className="text-white text-sm font-medium line-clamp-2">
                              {anime.title}
                            </p>
                          </div>
                        </div>

                        <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          {anime.rating.value}
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-red-500 transition-colors">
                        {anime.title}
                      </h3>
                      <div className="flex flex-wrap justify-between items-center mt-1 w-full">
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{anime.year}</span>
                          <span className="mx-1">•</span>
                          <span>{anime.episodes} Ep</span>
                        </div>

                        {anime.genre && (
                          <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300 mt-1 sm:mt-0">
                            {anime.genre}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 text-lg mb-2">No anime found</p>
                    <p className="text-gray-500 text-sm">
                      Try a different search term
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="border-gray-700 hover:bg-gray-800 hover:text-red-400 text-red-500"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          setPage(pageNum);
                        }}
                        className={
                          page === pageNum
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-gray-700 hover:bg-gray-800 hover:text-red-400 text-red-500"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="border-gray-700 hover:bg-gray-800 hover:text-red-400 text-red-500"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
