import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Anime {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
  poster: string;
  status?: string;
  score?: string;
  genreList?: {
    title: string;
    genreId: string;
    href: string;
    otakudesuUrl: string;
  }[];
}

interface SearchApiResponse {
  ok: boolean;
  statusCode: number;
  statusMessage: string;
  message: string;
  data: {
    animeList: Anime[];
  };
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const apiBaseUrl = "http://localhost:3001";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    const fetchSearchResults = async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/otakudesu/search?q=${encodeURIComponent(searchQuery)}`
        );

        if (!res.ok) {
          // Handle 404 or other errors gracefully
          setSearchResults([]);
          return;
        }

        const data: SearchApiResponse = await res.json();

        if (data.ok && data.data?.animeList) {
          const limitedResults = data.data.animeList.slice(0, 5);
          setSearchResults(limitedResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, apiBaseUrl]);

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
            NETFLIX
          </Link>
          <div className="hidden md:flex ml-8 gap-6">
            <Link to="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/genre" className="text-white hover:text-gray-300">
              Genre
            </Link>
            {/* <Link to="/movies" className="text-white hover:text-gray-300">
              Movies
            </Link>
            <Link to="/new" className="text-white hover:text-gray-300">
              New & Popular
            </Link>
            <Link to="/mylist" className="text-white hover:text-gray-300">
              My List
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
                placeholder="Search..."
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
                ) : searchResults.length > 0 ? (
                  searchResults.map((anime) => (
                    <Link
                      key={anime.animeId}
                      to={`/stream/${anime.animeId}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      {anime.poster ? (
                        <img
                          src={anime.poster}
                          alt={anime.title}
                          className="w-12 h-16 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/fallback-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-700 rounded-md flex-shrink-0" />
                      )}
                      <span className="text-white text-sm truncate">
                        {anime.title}
                      </span>
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
            <Link to="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/genre" className="text-white hover:text-gray-300">
              Genre
            </Link>
            {/* <Link to="/movies" className="text-white hover:text-gray-300">
              Movies
            </Link>
            <Link to="/new" className="text-white hover:text-gray-300">
              New & Popular
            </Link>
            <Link to="/mylist" className="text-white hover:text-gray-300">
              My List
            </Link> */}
          </div>
        </div>
      )}
    </nav>
  );
}
