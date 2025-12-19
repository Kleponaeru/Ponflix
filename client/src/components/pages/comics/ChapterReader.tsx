import { useParams, useNavigate } from "react-router-dom";
import { JSX, useEffect, useState, useRef } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Home,
  Book,
  Menu,
} from "lucide-react";

interface ChapterData {
  slug: string;
  title: string;
  images: string[];
  nextChapter?: { slug: string; title: string };
  prevChapter?: { slug: string; title: string };
  mangaSlug: string;
  mangaTitle: string;
}

export default function ChapterReader(): JSX.Element {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [showChapterList, setShowChapterList] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chapterId || !id) return;

    async function fetchChapter() {
      try {
        const chapterRes = await fetch(
          `http://localhost/Comics-API/api.php?chapter=${chapterId}`
        );
        const chapterJson = await chapterRes.json();

        console.log("Full API Response:", chapterJson);

        if (!chapterJson.status || !chapterJson.data) {
          console.error("Invalid API response");
          setLoading(false);
          return;
        }

        const data = chapterJson.data;
        const images: string[] =
          Array.isArray(chapterJson.data.gambar) &&
          chapterJson.data.gambar.length > 0
            ? chapterJson.data.gambar.map((img: any) => img.url)
            : [];
        console.log("Extracted images count:", images.length);
        console.log("First image URL:", images[0]);

        const chapterData: ChapterData = {
          slug: `/${id}-chapter-${chapterId}/`,
          title: data.judul || "Unknown Chapter",
          images: images,
          nextChapter: data.navigasi?.selanjutnya
            ? {
                slug: data.navigasi.selanjutnya,
                title: "Next Chapter",
              }
            : undefined,
          prevChapter: data.navigasi?.sebelumnya
            ? {
                slug: data.navigasi.sebelumnya,
                title: "Previous Chapter",
              }
            : undefined,
          mangaSlug: id || "",
          mangaTitle: data.info_komik?.judul || "Unknown Manga",
        };

        console.log("Setting chapter data:", chapterData);
        setChapter(chapterData);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChapter();
  }, [chapterId, id]);

  const resetControlsTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowControls(true);
    timeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" && chapter?.prevChapter) {
      const prevPath = chapter.prevChapter.slug;
      const match = prevPath.match(/\/(.+)-chapter-(.+)\//);
      if (match) {
        navigate(`/comics/${match[1]}/chapter/${match[2]}`);
      }
    } else if (e.key === "ArrowRight" && chapter?.nextChapter) {
      const nextPath = chapter.nextChapter.slug;
      const match = nextPath.match(/\/(.+)-chapter-(.+)\//);
      if (match) {
        navigate(`/comics/${match[1]}/chapter/${match[2]}`);
      }
    } else if (e.key === "Escape") {
      navigate(`/comics/${chapter?.mangaSlug}`);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chapter?.images.length) return;

      const images = document.querySelectorAll(".manga-page");
      const viewportMiddle = window.innerHeight / 2;

      for (let i = 0; i < images.length; i++) {
        const rect = images[i].getBoundingClientRect();
        if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
          setCurrentImageIndex(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl text-gray-400 mb-4">Failed to load chapter</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!chapter.images || chapter.images.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl text-gray-400 mb-4">
          No images available for this chapter
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const progress = ((currentImageIndex + 1) / chapter.images.length) * 100;

  return (
    <div
      className="min-h-screen bg-black text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Top Controls Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-gradient-to-b from-black via-black/80 to-transparent px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => navigate(`/comics/${chapter.mangaSlug}`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Back"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-semibold truncate">
                  {chapter.title}
                </h1>
                <p className="text-xs md:text-sm text-gray-400 truncate">
                  {chapter.mangaTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Chapter list"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:flex"
                aria-label="Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(`/comics/${chapter.mangaSlug}`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:flex"
                aria-label="Manga details"
              >
                <Book className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-20">
        {chapter.images.map((img, index) => (
          <div key={index} className="mb-1">
            <img
              src={img}
              alt={`Page ${index + 1}`}
              className="manga-page w-full h-auto"
              loading={index < 3 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {/* End of Chapter Message */}
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">End of Chapter</h2>
          {chapter.nextChapter ? (
            <button
              onClick={() => {
                const nextPath = chapter.nextChapter?.slug;
                const match = nextPath?.match(/\/(.+)-chapter-(.+)\//);
                if (match) {
                  navigate(`/comics/${match[1]}/chapter/${match[2]}`);
                }
              }}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-all hover:scale-105"
            >
              Continue to Next Chapter
            </button>
          ) : (
            <p className="text-gray-400">You've reached the latest chapter</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-4 md:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Page {currentImageIndex + 1}</span>
                <span>{chapter.images.length} pages</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 md:gap-4">
              <button
                onClick={() => {
                  if (chapter.prevChapter) {
                    const prevPath = chapter.prevChapter.slug;
                    const match = prevPath.match(/\/(.+)-chapter-(.+)\//);
                    if (match) {
                      navigate(`/comics/${match[1]}/chapter/${match[2]}`);
                    }
                  }
                }}
                disabled={!chapter.prevChapter}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-md font-medium transition-all ${
                  chapter.prevChapter
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex-1 text-center min-w-0">
                {chapter.nextChapter ? (
                  <div className="text-sm text-gray-400">
                    <span className="text-white">Next Chapter Available</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">Latest chapter</div>
                )}
              </div>

              <button
                onClick={() => {
                  if (chapter.nextChapter) {
                    const nextPath = chapter.nextChapter.slug;
                    const match = nextPath.match(/\/(.+)-chapter-(.+)\//);
                    if (match) {
                      navigate(`/comics/${match[1]}/chapter/${match[2]}`);
                    }
                  }
                }}
                disabled={!chapter.nextChapter}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-md font-medium transition-all ${
                  chapter.nextChapter
                    ? "bg-red-600 hover:bg-red-700 hover:scale-105"
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div
        className={`fixed bottom-24 right-4 text-xs text-gray-500 transition-opacity duration-300 hidden md:block ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg space-y-1">
          <p>← → Navigate chapters</p>
          <p>ESC Exit reader</p>
        </div>
      </div>

      {/* Chapter List Overlay */}
      {showChapterList && (
        <div
          className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center p-4"
          onClick={() => setShowChapterList(false)}
        >
          <div
            className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Chapters</h2>
            <div className="space-y-2">
              <div className="text-center text-gray-400 py-8">
                Chapter list will be loaded from your API
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
