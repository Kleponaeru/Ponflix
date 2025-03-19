import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, Search, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the Anime type based on API data
interface Anime {
  title: string;
  animeId: string;
  href: string;
  otakudesuUrl: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = "http://localhost:3001";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch all anime data on mount
  useEffect(() => {
    const fetchAllAnime = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/otakudesu/anime`);
        const data = await res.json();
        console.log("API Response:", data); // Debug the response structure

        // Ensure data is an array and flatten it
        let flattenedAnime: Anime[] = [];
        if (Array.isArray(data)) {
          flattenedAnime = data.flatMap(
            (group: { startWith: string; animeList: Anime[] }) =>
              group.animeList || []
          );
        } else {
          console.warn("API data is not an array:", data);
        }

        setAllAnime(flattenedAnime);
      } catch (error) {
        console.error("Error fetching all anime:", error);
        setAllAnime([]);
      }
    };

    fetchAllAnime();
  }, [apiBaseUrl]);

  // Filter anime based on searchQuery
  useEffect(() => {
    if (!searchQuery.trim() || !isSearchOpen) {
      setSearchResults([]);
      return;
    }

    const filteredResults = allAnime
      .filter((anime) =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);

    setSearchResults(filteredResults);
  }, [searchQuery, isSearchOpen, allAnime]);

  // Toggle search input
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setTimeout(() => {
      if (!isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
    if (isSearchOpen) setSearchResults([]);
  };

  // Close search input when clicking outside
  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchOpen(false);
      setSearchResults([]);
    }, 200);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
          isScrolled
            ? "bg-black"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="px-4 md:px-16 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-red-600 font-bold text-2xl md:text-3xl"
            >
              NETFLIX
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-8 gap-6">
              <Link to="/" className="text-white hover:text-gray-300">
                Home
              </Link>
              <Link to="/series" className="text-white hover:text-gray-300">
                TV Shows
              </Link>
              <Link to="/movies" className="text-white hover:text-gray-300">
                Movies
              </Link>
              <Link to="/new" className="text-white hover:text-gray-300">
                New & Popular
              </Link>
              <Link to="/mylist" className="text-white hover:text-gray-300">
                My List
              </Link>
            </div>
          </div>

          {/* Right Side Section */}
          <div className="flex items-center gap-4">
            {/* Search Section */}
            <div className="relative flex items-center">
              {/* Search Button */}
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

              {/* Search Input Field */}
              <form
                onSubmit={handleSearch}
                className={`overflow-hidden transition-all duration-300 ${
                  isSearchOpen ? "w-48 md:w-64" : "w-0"
                } bg-black rounded-md flex items-center border border-gray-800`}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  className="bg-transparent border-none outline-none text-white px-3 py-1 w-full"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={handleBlur}
                />
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-12 right-0 w-64 md:w-80 bg-black/95 border border-gray-800 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((anime) => (
                    <Link
                      key={anime.animeId}
                      to={anime.href}
                      className="flex items-center gap-3 p-2 hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchResults([]);
                      }}
                    >
                      <div className="w-12 h-18 bg-gray-700 rounded-md" />
                      <span className="text-white text-sm truncate">
                        {anime.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Button */}
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-sm h-8 w-8 bg-slate-700"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-black/90 border-gray-800 text-white"
              >
                <DropdownMenuItem className="hover:bg-gray-800">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800">
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-white hover:text-gray-300">
                Home
              </Link>
              <Link to="/series" className="text-white hover:text-gray-300">
                TV Shows
              </Link>
              <Link to="/movies" className="text-white hover:text-gray-300">
                Movies
              </Link>
              <Link to="/new" className="text-white hover:text-gray-300">
                New & Popular
              </Link>
              <Link to="/mylist" className="text-white hover:text-gray-300">
                My List
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
