import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  LoaderCircle,
  Menu,
  X,
} from "lucide-react";
import { extractSlug } from "@/utils/extractSlug";

interface ChapterData {
  title: string;
  images: string[];
  nextChapter?: string;
  prevChapter?: string;
  chapters: { slug: string; title: string }[];
  mangaTitle: string;
}

const API_URL = "https://ponmics-api.necode.id/Comics-API/api.php";

export default function ChapterReader() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const controlsTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!id || !chapterId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setChapter(null);
    setCurrentImageIndex(0);
    setShowChapterList(false);
    setShowControls(true);
    window.scrollTo({ top: 0, behavior: "auto" });

    const loadChapter = async () => {
      try {
        const response = await fetch(
          `${API_URL}?chapter=${encodeURIComponent(chapterId)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Chapter could not be loaded.");
        const json = await response.json();
        if (!json?.status || !json?.data) throw new Error("Invalid chapter response.");

        const data = json.data;
        const nextChapter = data.navigasi?.selanjutnya || undefined;
        const prevChapter = data.navigasi?.sebelumnya || undefined;
        setChapter({
          title: data.judul || "Unknown chapter",
          images: Array.isArray(data.gambar)
            ? data.gambar.map((image: { url: string }) => image.url).filter(Boolean)
            : [],
          nextChapter,
          prevChapter,
          chapters: (data.info_komik?.chapter || []).map((item: any) => ({
            slug: item.link_chapter,
            title: item.judul_chapter,
          })),
          mangaTitle: data.info_komik?.judul || "Unknown comic",
        });
      } catch (loadError) {
        if ((loadError as Error).name !== "AbortError") setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadChapter();
    return () => controller.abort();
  }, [chapterId, id]);

  const navigateChapter = useCallback(
    (chapterPath?: string) => {
      if (!chapterPath || !id) return;
      navigate(`/comics/${id}/chapter/${extractSlug(chapterPath)}`);
    },
    [id, navigate]
  );

  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) window.clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    showControlsBriefly();
    return () => {
      if (controlsTimeout.current) window.clearTimeout(controlsTimeout.current);
    };
  }, [showControlsBriefly, chapterId]);

  useEffect(() => {
    const updateProgress = () => {
      const pages = document.querySelectorAll<HTMLElement>("[data-reader-page]");
      const middle = window.innerHeight / 2;
      for (let index = 0; index < pages.length; index += 1) {
        const bounds = pages[index].getBoundingClientRect();
        if (bounds.top <= middle && bounds.bottom >= middle) {
          setCurrentImageIndex(index);
          return;
        }
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [chapter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showChapterList) setShowChapterList(false);
        else navigate(`/comics/${id}`);
      }
      if (event.key === "ArrowLeft") navigateChapter(chapter?.prevChapter);
      if (event.key === "ArrowRight") navigateChapter(chapter?.nextChapter);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter, id, navigate, navigateChapter, showChapterList]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08090b]">
        <LoaderCircle className="h-9 w-9 animate-spin text-[#e50914]" />
      </main>
    );
  }

  if (error || !chapter) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#08090b] px-4 text-center text-white">
        <BookOpen className="h-8 w-8 text-[#e50914]" />
        <h1 className="mt-4 text-xl font-semibold">Chapter unavailable</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
          This chapter couldn’t be loaded. It may have moved or the service may be temporarily unavailable.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/comics/${id}`)}
          className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85"
        >
          Back to title
        </button>
      </main>
    );
  }

  if (!chapter.images.length) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#08090b] px-4 text-center text-white">
        <BookOpen className="h-8 w-8 text-[#e50914]" />
        <h1 className="mt-4 text-xl font-semibold">No pages available</h1>
        <p className="mt-2 text-sm text-white/50">There are no readable pages for this chapter yet.</p>
        <button
          type="button"
          onClick={() => navigate(`/comics/${id}`)}
          className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85"
        >
          Back to title
        </button>
      </main>
    );
  }

  const progress = ((currentImageIndex + 1) / chapter.images.length) * 100;

  return (
    <main
      className="min-h-screen bg-[#08090b] text-white"
      onMouseMove={showControlsBriefly}
      onTouchStart={showControlsBriefly}
    >
      <div
        className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
          showControls ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="border-b border-white/[0.06] bg-[#08090b]/85 px-3 py-3 backdrop-blur-xl sm:px-5">
          <div className="content-shell flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/comics/${id}`)}
                aria-label="Back to title details"
                className="shrink-0 rounded-full p-2 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold sm:text-base">{chapter.title}</h1>
                <p className="truncate text-xs text-white/45">{chapter.mangaTitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setShowChapterList(true)}
                aria-label="Open chapter list"
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/comics")}
                aria-label="Browse comics"
                className="hidden rounded-full p-2 transition hover:bg-white/10 sm:block"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/comics/${id}`)}
                aria-label="Title details"
                className="hidden rounded-full p-2 transition hover:bg-white/10 sm:block"
              >
                <BookOpen className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-0 pb-36 pt-16 sm:px-4 sm:pt-20">
        {chapter.images.map((image, index) => (
          <div data-reader-page key={`${chapterId}-${index}`} className="mb-1 bg-black">
            <img
              src={image}
              alt={`Page ${index + 1}`}
              className="h-auto w-full"
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}

        <div className="mx-3 mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-12 text-center sm:mx-0 sm:py-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ff6670]">
            You’re all caught up
          </p>
          <h2 className="mb-5 mt-2 text-2xl font-semibold">End of chapter</h2>
          {chapter.nextChapter ? (
            <button
              type="button"
              onClick={() => navigateChapter(chapter.nextChapter)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Continue reading <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <p className="text-sm text-white/45">You’ve reached the latest chapter.</p>
          )}
        </div>
      </section>

      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition duration-300 ${
          showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-white/[0.07] bg-[#101115]/90 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
          <div className="content-shell">
            <div className="mb-3 flex justify-between text-xs text-white/45">
              <span>Page {currentImageIndex + 1}</span>
              <span>{chapter.images.length} pages</span>
            </div>
            <div
              role="progressbar"
              aria-label="Reading progress"
              aria-valuemin={0}
              aria-valuemax={chapter.images.length}
              aria-valuenow={currentImageIndex + 1}
              className="mb-4 h-1 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full bg-[#e50914] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigateChapter(chapter.prevChapter)}
                disabled={!chapter.prevChapter}
                aria-label="Previous chapter"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="min-w-0 flex-1 truncate text-center text-xs text-white/45 sm:text-sm">
                {chapter.mangaTitle}
              </span>
              <button
                type="button"
                onClick={() => navigateChapter(chapter.nextChapter)}
                disabled={!chapter.nextChapter}
                aria-label="Next chapter"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChapterList && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reader-chapter-list-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setShowChapterList(false)}
        >
          <section
            className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111216] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff6670]">
                  {chapter.mangaTitle}
                </p>
                <h2 id="reader-chapter-list-title" className="mt-1 text-lg font-semibold">
                  Choose a chapter
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowChapterList(false)}
                aria-label="Close chapter list"
                className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[calc(80vh-5rem)] overflow-auto p-2">
              {chapter.chapters.length ? (
                chapter.chapters.map((item) => {
                  const slug = extractSlug(item.slug);
                  return (
                    <button
                      type="button"
                      key={item.slug}
                      onClick={() => {
                        setShowChapterList(false);
                        navigateChapter(item.slug);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-white/[0.07] ${
                        slug === chapterId ? "bg-white/[0.08] text-white" : "text-white/65"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-8 text-center text-sm text-white/45">
                  No chapter list is available.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
