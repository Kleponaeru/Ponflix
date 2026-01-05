import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Tag,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../../../ui/Navbar";
import Skeleton from "@mui/material/Skeleton";
import { motion } from "framer-motion";
import { normalizeTitle } from "@/utils/title";

interface Manga {
  id: string;
  title: string;
  imageUrl: string;
  type: string;
  isColored: boolean;
  latestChapter?: string;
  rating?: string;
  genre?: string;
}

export default function CategoriesManga() {
  const { type } = useParams<{ type: string }>(); // "ongoing", "completed", or genre slug
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [allMangaData, setAllMangaData] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Manga[]>([]);
  const navigate = useNavigate();

  const apiBaseUrl = `https://ponmics-api.necode.id/Comics-API/api.php?type=${type}&page=1`;
  const itemsPerPage = 15;

  const getPageTitle = (): string => {
    if (type === "ongoing") return "Ongoing Manga";
    if (type === "completed") return "Completed Manga";
    return normalizeTitle(undefined, type, 3);
  };

  const getPageDescription = (): string => {
    if (type === "ongoing")
      return "Discover the latest ongoing manga series with regular updates.";

    if (type === "completed")
      return "Browse our collection of completed manga series.";

    const readableType = normalizeTitle(undefined, type, 4);

    return `Explore our collection of ${readableType} manga. Find your next favorite series.`;
  };

  const fetchMangaDetails = async (mangaList: any[]): Promise<Manga[]> => {
    const mangaWithDetails = await Promise.all(
      mangaList.map(async (manga) => {
        try {
          // Extract slug from link
          const slug =
            manga.link?.split("/komik/")[1]?.replace(/\//g, "") ||
            manga.link?.split("/").filter(Boolean).pop() ||
            "unknown";
          const isColored = manga.warna === "Warna";
          const latestChapter = manga.chapter?.[0]?.judul_chapter || "N/A";

          return {
            id: slug,
            title: normalizeTitle(manga.judul, manga.link, 7),
            imageUrl: manga.gambar || "/placeholder.svg",
            type: manga.tipe || "Manga",
            isColored,
            latestChapter,
            rating: "N/A",
            genre: isColored ? "Colored" : "Black & White",
          };
        } catch (error) {
          console.warn(`Failed to process manga:`, error);
          return {
            id: "unknown",
            title: manga.judul || "Unknown",
            imageUrl: manga.gambar || "/placeholder.svg",
            type: "Manga",
            isColored: false,
            latestChapter: "N/A",
            rating: "N/A",
            genre: "Unknown",
          };
        }
      })
    );
    return mangaWithDetails;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setInitialLoading(true);
      setAllMangaData([]);
      setFilteredData([]);
      let allManga: Manga[] = [];
      let currentPage = 1;

      try {
        // Determine API endpoint based on type
        let apiEndpoint = "";
        if (type === "ongoing") {
          apiEndpoint = `${apiBaseUrl}/?status=ongoing&page=`;
        } else if (type === "completed") {
          apiEndpoint = `${apiBaseUrl}/?status=completed&page=`;
        } else {
          // For genres, you'll need to adjust based on your API
          apiEndpoint = `${apiBaseUrl}/?genre=${type}&page=`;
        }

        // Fetch first page
        const firstPageRes = await fetch(`${apiEndpoint}${currentPage}`);
        const firstPageData = await firstPageRes.json();

        if (!firstPageData.data || !Array.isArray(firstPageData.data.komik)) {
          throw new Error("Invalid manga API response");
        }

        const firstPageManga = await fetchMangaDetails(
          firstPageData.data.komik
        );
        allManga = [...firstPageManga];
        setAllMangaData(allManga);
        setFilteredData(allManga);
        setTotalPages(Math.ceil(allManga.length / itemsPerPage));
        setInitialLoading(false);

        // Fetch remaining pages in the background
        setBackgroundLoading(true);
        currentPage = 2;

        while (currentPage <= 10) {
          // Limit to 10 pages for performance
          const res = await fetch(`${apiEndpoint}${currentPage}`);
          const data = await res.json();

          if (!data.data || !Array.isArray(data.data.komik)) {
            console.warn(
              `Invalid or empty response for page ${currentPage}, stopping fetch.`
            );
            break;
          }

          const komikList = data.data.komik;

          if (komikList.length === 0) {
            console.log(
              `No more manga on page ${currentPage}, stopping fetch.`
            );
            break;
          }

          const mangaWithDetails = await fetchMangaDetails(komikList);
          allManga = [...allManga, ...mangaWithDetails];

          currentPage++;
          setAllMangaData([...allManga]);
          setFilteredData([...allManga]);
          setTotalPages(Math.ceil(allManga.length / itemsPerPage));
        }
      } catch (error) {
        console.error(`Error fetching manga:`, error);
        if (!allManga.length) {
          setAllMangaData([]);
          setFilteredData([]);
          setTotalPages(0);
        }
      } finally {
        setBackgroundLoading(false);
      }
    };

    if (type) fetchAllData();
  }, [type]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(allMangaData);
    } else {
      const filtered = allMangaData.filter((manga) =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setPage(1);
  }, [searchQuery, allMangaData]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      if (Array.isArray(filteredData)) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newMangaList = filteredData.slice(startIndex, endIndex);
        setMangaList(newMangaList);
        setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
      } else {
        setMangaList([]);
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

  const handleMangaClick = (mangaId: string) => {
    navigate(`/comics/${mangaId}`);
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

  const getHeaderColor = (): string => {
    if (type === "ongoing") return "from-red-900 to-orange-900";
    if (type === "completed") return "from-green-900 to-emerald-900";
    return "from-purple-900 to-pink-900";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-16 px-4 md:px-12 pb-12">
        <div className="relative w-full h-[150px] md:h-[200px] mb-8 overflow-hidden rounded-xl">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${getHeaderColor()} opacity-80`}
          ></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-red-400" />
              {getPageTitle()}
            </h1>
            <p className="text-gray-300 max-w-2xl">{getPageDescription()}</p>
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
            <span className="text-white">{getPageTitle()}</span>
          </nav>

          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <input
              type="text"
              placeholder="Search manga..."
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

        {!initialLoading && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">
              Showing{" "}
              {filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(page * itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} manga
              {backgroundLoading && " (Loading more in background...)"}
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
                {mangaList.map((manga) => (
                  <motion.div
                    key={manga.id}
                    variants={itemVariants}
                    onClick={() => handleMangaClick(manga.id)}
                    className="group flex flex-col cursor-pointer"
                  >
                    <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg mb-2 bg-gray-800">
                      <img
                        src={manga.imageUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          {/* <div
                            className={`${
                              manga.status === "Ongoing"
                                ? "bg-red-600"
                                : manga.status === "Completed"
                                ? "bg-green-600"
                                : "bg-blue-600"
                            } text-white text-xs font-medium px-2 py-1 rounded-sm inline-block mb-2`}
                          >
                            {manga.status.toUpperCase()}
                          </div> */}
                          {manga.isColored && (
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-2 py-1 rounded-sm inline-block mb-2 ml-1">
                              COLORED
                            </div>
                          )}
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {manga.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-red-500 transition-colors">
                      {manga.title}
                    </h3>
                    <div className="flex flex-wrap justify-between items-center mt-1 w-full">
                      <div className="flex items-center text-xs text-gray-400">
                        <span>{manga.type}</span>
                        {manga.latestChapter && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="line-clamp-1">
                              {manga.latestChapter}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 my-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="border-gray-700 hover:bg-gray-800 hover:text-red-500 text-red-500"
                >
                  <ChevronLeft className="h-5 w-5 text-red-500" />
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
                            : "border-gray-700 hover:bg-gray-800 hover:text-red-500 text-red-500"
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
                  className="border-gray-700 hover:bg-gray-800 hover:text-red-500 text-red-500"
                >
                  <ChevronRight className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
