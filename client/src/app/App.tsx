import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import Navbar from "@/shared/components/ui/Navbar";
import ComicsLayout from "@/app/layouts/ComicsLayout";
import PageLoader from "@/shared/components/ui/PageLoader";

const DetailGenre = lazy(() => import("@/features/anime/pages/DetailGenre"));
const OngoingDetail = lazy(() => import("@/features/anime/pages/OnGoingDetail"));
const CompletedDetail = lazy(() => import("@/features/anime/pages/CompletedDetail"));
const Stream = lazy(() => import("@/features/anime/pages/Stream"));
const Genres = lazy(() => import("@/features/anime/pages/Genres"));
const MangaRows = lazy(() => import("@/features/comics/components/home/MangaRows"));
const UnderConstruction = lazy(() => import("@/features/anime/pages/UnderConstruction"));
const MangaDetail = lazy(() => import("@/features/comics/components/detail/MangaDetail"));
const ChapterReader = lazy(() => import("@/features/comics/components/reader/ChapterReader"));
const CategoriesManga = lazy(() => import("@/features/comics/components/detail/CategoriesManga"));

export default function App() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!hasMounted.current || navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
    hasMounted.current = true;
  }, [navigationType, pathname]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/comics" replace />} />
        <Route
          path="/anime"
          element={
            <div className="min-h-screen bg-[#08090b] text-white">
              <Navbar />
              <UnderConstruction />
            </div>
          }
        />
        <Route element={<ComicsLayout />}>
          <Route path="/comics" element={<MangaRows />} />
          <Route path="/comics/category/:type" element={<CategoriesManga />} />
          <Route path="/comics/:id" element={<MangaDetail />} />
        </Route>
        <Route path="/comics/:id/chapter/:chapterId" element={<ChapterReader />} />
        <Route path="/genres/:genreId" element={<DetailGenre />} />
        <Route path="/ongoing" element={<OngoingDetail />} />
        <Route path="/completed" element={<CompletedDetail />} />
        <Route path="/stream/:animeId" element={<Stream />} />
        <Route path="/genres" element={<Genres />} />
      </Routes>
    </Suspense>
  );
}
