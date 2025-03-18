
import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, Search, User } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            Browse{" "}
            <ChevronDown
              className={`ml-1 transition-transform ${
                isMobileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Bell className="h-5 w-5" />
            </Button>
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
