import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DetailGenre() {
  const { genreId } = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = "http://localhost:3001";
  const itemsPerPage = 15; // Adjust based on your API

  // Fetch all data to determine total pages on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      let currentPage = 1;
      let allAnime = [];
      let hasMore = true;

      try {
        while (hasMore) {
          const res = await fetch(
            `${apiBaseUrl}/otakudesu/genres/${genreId}?page=${currentPage}`
          );
          const data = await res.json();
          const newAnimeList = data.data.animeList.map((anime) => ({
            id: anime.animeId,
            title: anime.title,
            imageUrl: anime.poster,
          }));

          allAnime = [...allAnime, ...newAnimeList];
          hasMore = newAnimeList.length === itemsPerPage; // Stop when fewer items
          currentPage++;

          // Safety limit to prevent infinite loops
          if (currentPage > 100) {
            console.warn(
              "Reached page limit of 100. Assuming this is the end."
            );
            break;
          }
        }

        console.log(`Total items for ${genreId}: ${allAnime.length}`);
        setAnimeList(allAnime.slice(0, itemsPerPage)); // Show first page
        setTotalPages(Math.ceil(allAnime.length / itemsPerPage));
      } catch (error) {
        console.error(`Error fetching all data for genre ${genreId}:`, error);
        setAnimeList([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    if (genreId) fetchAllData();
  }, [genreId]);

  // Fetch specific page data when page changes
  useEffect(() => {
    if (page === 1) return; // Skip if on first page (already fetched)

    const fetchPageData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiBaseUrl}/otakudesu/genres/${genreId}?page=${page}`
        );
        const data = await res.json();

        const newAnimeList = data.data.animeList.map((anime) => ({
          id: anime.animeId,
          title: anime.title,
          imageUrl: anime.poster,
        }));

        setAnimeList(newAnimeList);
      } catch (error) {
        console.error(
          `Error fetching page ${page} for genre ${genreId}:`,
          error
        );
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };

    if (genreId) fetchPageData();
  }, [genreId, page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-16 px-4 md:px-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 capitalize">
        {genreId.replace(/-/g, " ")} Anime
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animeList.length > 0 ? (
              animeList.map((anime) => (
                <div
                  key={anime.id}
                  className="min-w-[120px] h-[180px] md:h-[240px] cursor-pointer relative transition duration-200 ease-out hover:scale-105"
                >
                  <img
                    src={anime.imageUrl || "/placeholder.svg"}
                    alt={anime.title}
                    className="rounded-md object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity hover:opacity-100">
                    <p className="text-xs md:text-sm text-white truncate">
                      {anime.title}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">
                No anime available for this genre.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="text-blue-400 hover:text-blue-600"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <p className="text-sm md:text-base">
                {page} of {totalPages}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="text-blue-400 hover:text-blue-600"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
