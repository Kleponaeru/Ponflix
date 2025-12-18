import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  title: string;
  image: string;
  type: "Anime" | "Manga";
  rating: string;
  link: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const animeApiBaseUrl = "https://wajik-anime-api.vercel.app";
  const mangaApiBaseUrl = "https://ponmics-api.infy.uk";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounce search to prevent rapid API calls
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const debounceTimeout = setTimeout(async () => {
      try {
        // Fetch anime and manga concurrently
        const [animeResponse, mangaResponse] = await Promise.all([
          fetch(
            `${animeApiBaseUrl}/samehadaku/search?q=${encodeURIComponent(
              searchQuery
            )}`,
            {
              headers: { Accept: "application/json" },
            }
          ).catch(() => null),
          fetch(
            `${mangaApiBaseUrl}/api.php?s=${encodeURIComponent(
              searchQuery
            )}&page=1`,
            {
              headers: { Accept: "application/json" },
            }
          ).catch(() => null),
        ]);

        let animeResults: SearchResult[] = [];
        let mangaResults: SearchResult[] = [];

        // Process anime results
        if (animeResponse && animeResponse.ok) {
          const animeData = await animeResponse.json();
          if (animeData.ok && animeData.data?.animeList) {
            animeResults = animeData.data.animeList
              .slice(0, 3)
              .map((anime: any) => ({
                id: anime.animeId,
                title: anime.title,
                image: anime.poster || "/fallback-image.jpg",
                type: "Anime" as const,
                rating: anime.score || "N/A",
                link: `/stream/${anime.animeId}`,
              }));
          }
        }

        // Process manga results
        if (mangaResponse && mangaResponse.ok) {
          if (mangaResponse.status === 429) {
            setError(
              "Rate limit exceeded for manga search. Please wait a moment."
            );
          } else {
            const mangaData = await mangaResponse.json();
            if (mangaData.status && mangaData.data?.komik) {
              mangaResults = mangaData.data.komik
                .slice(0, 2)
                .map((manga: any) => ({
                  id: manga.link.split("/").filter(Boolean).pop(),
                  title: manga.judul,
                  image: manga.gambar || "/fallback-image.jpg",
                  type: "Manga" as const,
                  rating: manga.rating || "N/A",
                  link: `/manga/${manga.link.split("/").filter(Boolean).pop()}`,
                }));
            }
          }
        }

        // Combine and limit to 5 results
        const combinedResults = [...animeResults, ...mangaResults].slice(0, 5);
        setSearchResults(combinedResults);
        if (combinedResults.length === 0) {
          setError(`No results found for "${searchQuery}"`);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(`Search failed: ${error.message}`);
        } else {
          setError("Search failed: Unknown error");
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Debounce delay of 500ms

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-black"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="px-4 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-red-600 font-bold text-2xl md:text-3xl">
            <img src="/ponflix-logo.png" alt="" height={80} width={80} />
          </Link>
          <div className="hidden md:flex ml-8 gap-6">
            <NavLink
              to="/comics"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-white hover:text-gray-300"
              }
            >
              Comics
            </NavLink>

            <NavLink
              to="/anime"
              className={({ isActive }) =>
                isActive
                  ? "text-red-500 font-semibold"
                  : "text-white hover:text-gray-300"
              }
            >
              Anime
            </NavLink>

            {/* <Link to="/genres" className="text-white hover:text-gray-300">
              Genres
            </Link> */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            ref={searchContainerRef}
            className="relative flex items-center md:mr-0 mr-10"
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={toggleSearch}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
            <form
              onSubmit={handleSearch}
              className={`overflow-hidden transition-all duration-300 ${
                isSearchOpen ? "w-32 sm:w-48 md:w-64" : "w-0"
              } bg-black rounded-md flex items-center border border-gray-800`}
            >
              <input
                ref={searchInputRef}
                type="text"
                className="bg-transparent border-none outline-none text-white px-3 py-1 w-full"
                placeholder="Search anime or manga..."
                value={searchQuery}
                onChange={handleInputChange}
              />
            </form>

            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute top-12 w-full bg-black/95 border border-gray-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <p className="text-white text-sm">Loading...</p>
                  </div>
                ) : error ? (
                  <div className="p-3">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.link}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-12 h-16 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-700 rounded-md flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="text-white text-sm truncate">
                          {result.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{result.type}</span>
                          <span>•</span>
                          <span>Rating: {result.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-3">
                    <p className="text-white text-sm">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden absolute right-4 top-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 py-4 px-4">
          <div className="flex flex-col space-y-4">
            <NavLink to="/comics" className="text-white hover:text-gray-300">
              Comics
            </NavLink>
            <NavLink to="/anime" className="text-white hover:text-gray-300">
              Anime
            </NavLink>
            {/* <Link to="/genres" className="text-white hover:text-gray-300">
              Genres
            </Link> */}
          </div>
        </div>
      )}
    </nav>
  );
}
