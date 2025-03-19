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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle search input
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setTimeout(() => {
      if (!isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  };

  // Close search input when clicking outside
  const handleBlur = () => {
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Perform search logic here
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

              {/* Search Input Field (inside navbar) */}
              <form
                onSubmit={handleSearch}
                className={`overflow-hidden transition-all duration-300 ${
                  isSearchOpen ? "w-48 md:w-64" : "w-0"
                } bg-black rounded-md flex items-center border border-gray-700`}
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
