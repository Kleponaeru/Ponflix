import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { titleFromLink } from "@/lib/manga-utils";

interface SearchResult {
  id: string;
  title: string;
  image: string;
  type: string;
  link: string;
}

const API_BASE_URL = "https://ponmics-api.necode.id/Comics-API/api.php";

const navItems = [
  { label: "Home", to: "/comics" },
  { label: "Manga", to: "/comics/category/Manga" },
  { label: "Manhwa", to: "/comics/category/Manhwa" },
  { label: "Manhua", to: "/comics/category/Manhua" },
  { label: "Anime", to: "/anime" },
];

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}?s=${encodeURIComponent(query)}&page=1`,
          { headers: { Accept: "application/json" }, signal: controller.signal }
        );
        if (!response.ok) throw new Error("Search is unavailable right now.");

        const data = await response.json();
        const results = Array.isArray(data?.data?.komik)
          ? data.data.komik.slice(0, 6).map((manga: any) => {
              const id = manga.link?.split("/").filter(Boolean).pop() || "";
              return {
                id,
                title:
                  manga.judul && manga.judul !== "Tidak ada judul"
                    ? manga.judul
                    : titleFromLink(manga.link),
                image: manga.gambar || "",
                type: manga.tipe || "Manga",
                link: `/comics/${id}`,
              };
            })
          : [];

        if (active) {
          setSearchResults(results);
          setSearchError(results.length ? null : `No titles found for “${query}”.`);
        }
      } catch (error) {
        if (active && (error as Error).name !== "AbortError") {
          setSearchResults([]);
          setSearchError("Search is unavailable. Please try again.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchInputRef.current?.blur();
  };

  const closeSearch = () => {
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  };

  const searchPanel = (mobile = false) => (
    <div className={mobile ? "relative w-full" : "relative w-64 lg:w-72"}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 transition focus-within:border-white/25 focus-within:bg-white/[0.09]"
      >
        <Search className="h-4 w-4 shrink-0 text-white/55" aria-hidden="true" />
        <input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search titles"
          aria-label="Search comics"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={closeSearch}
            className="rounded-full p-1 text-white/55 transition hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {(isLoading || searchError || searchResults.length > 0) && searchQuery && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-full min-w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#111216]/[0.98] p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {isLoading ? (
            <p className="px-3 py-4 text-sm text-white/55">Searching titles…</p>
          ) : searchError ? (
            <p className="px-3 py-4 text-sm text-white/55">{searchError}</p>
          ) : (
            <div className="space-y-1">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  to={result.link}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.08]"
                  onClick={closeSearch}
                >
                  <img
                    src={result.image || "/placeholder.svg"}
                    alt=""
                    className="h-14 w-10 shrink-0 rounded-md bg-white/5 object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {result.title}
                    </span>
                    <span className="mt-1 block text-xs text-white/45">
                      {result.type}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "border-b border-white/[0.06] bg-[#08090b]/95 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-gradient-to-b from-black/75 via-black/35 to-transparent"
      }`}
    >
      <div className="content-shell flex h-[4.25rem] items-center gap-6">
        <Link to="/comics" aria-label="Ponflix home" className="shrink-0">
          <img
            src="/ponflix-logo.png"
            alt="Ponflix"
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => {
            const isActive =
              item.to === "/comics"
                ? location.pathname === "/comics"
                : item.to === "/anime"
                ? location.pathname.startsWith("/anime")
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`text-[13px] transition-colors hover:text-white ${
                  isActive ? "font-semibold text-white" : "text-white/60"
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto hidden md:block">{searchPanel()}</div>

        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen((open) => !open);
            setIsMobileMenuOpen(false);
          }}
          className="ml-auto rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:hidden"
          aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
          aria-expanded={isMobileSearchOpen}
        >
          {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen((open) => !open);
            setIsMobileSearchOpen(false);
          }}
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileSearchOpen && (
        <div className="content-shell border-t border-white/[0.07] pb-4 pt-3 md:hidden">
          {searchPanel(true)}
        </div>
      )}

      {isMobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/[0.07] bg-[#0b0c0f]/[0.98] px-4 py-3 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-1">
            {navItems.map((item) => {
              const isActive =
                item.to === "/comics"
                  ? location.pathname === "/comics"
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
