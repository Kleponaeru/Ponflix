import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigationType } from "react-router-dom";
import ComicsLayout from "@/app/layouts/ComicsLayout";
import SiteLayout from "@/app/layouts/SiteLayout";
import PageLoader from "@/shared/components/ui/PageLoader";

const MangaRows = lazy(() => import("@/features/comics/components/home/MangaRows"));
const MangaDetail = lazy(() => import("@/features/comics/components/detail/MangaDetail"));
const ChapterReader = lazy(() => import("@/features/comics/components/reader/ChapterReader"));
const CategoriesManga = lazy(() => import("@/features/comics/components/detail/CategoriesManga"));
const AnimeHome = lazy(() => import("@/features/anime/pages/AnimeHome"));
const AnimeSearch = lazy(() => import("@/features/anime/pages/AnimeSearch"));
const AnimeDetail = lazy(() => import("@/features/anime/pages/AnimeDetail"));
const AnimeWatch = lazy(() => import("@/features/anime/pages/AnimeWatch"));
const AnimeLayout = lazy(() => import("@/features/anime/components/AnimeLayout"));

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
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Navigate to="/comics" replace />} />
          <Route element={<AnimeLayout />}>
            <Route path="/anime" element={<AnimeHome />} />
            <Route path="/anime/search" element={<AnimeSearch />} />
            <Route path="/anime/:slug/episode/:episodeSlug" element={<AnimeWatch />} />
            <Route path="/anime/:slug" element={<AnimeDetail />} />
          </Route>
          <Route element={<ComicsLayout />}>
            <Route path="/comics" element={<MangaRows />} />
            <Route path="/comics/category/:type" element={<CategoriesManga />} />
            <Route path="/comics/:id" element={<MangaDetail />} />
          </Route>
          <Route path="/comics/:id/chapter/:chapterId" element={<ChapterReader />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
