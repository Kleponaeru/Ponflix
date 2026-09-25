import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import Navbar from "./components/ui/Navbar";
import ComicsLayout from "./components/layout/ComicsLayout";
import PageLoader from "./components/ui/PageLoader";

const DetailGenre = lazy(() => import("./components/anime/DetailGenre"));
const OngoingDetail = lazy(() => import("./components/anime/OnGoingDetail"));
const CompletedDetail = lazy(() => import("./components/anime/CompletedDetail"));
const Stream = lazy(() => import("./components/pages/Stream"));
const Genres = lazy(() => import("./components/pages/Genres"));
const MangaRows = lazy(() => import("./components/comics/MangaRows"));
const UnderConstruction = lazy(() => import("./components/maintenance/UnderConstruction"));
const MangaDetail = lazy(() => import("./components/comics/detail/MangaDetail"));
const ChapterReader = lazy(() => import("./components/comics/ChapterReader"));
const CategoriesManga = lazy(() => import("./components/comics/detail/CategoriesManga"));

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
