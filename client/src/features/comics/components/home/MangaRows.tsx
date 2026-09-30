import { useLatestAnime } from "@/features/anime/hooks/useLatestAnime";
import { useSpotlightAnime } from "@/features/anime/hooks/useSpotlightAnime";
import LatestAnimeShelf from "@/features/anime/components/LatestAnimeShelf";
import MangaRow from "@/features/comics/components/rows/MangaRow";
import HomeFeaturedBanner from "@/features/comics/components/home/HomeFeaturedBanner";
import { useLatestMangas } from "@/features/comics/hooks/useLatestMangas";

export default function MangaRows() {
  const { data: comics, loading: comicsLoading } = useLatestMangas();
  const { anime: latestAnime, loading: latestAnimeLoading } = useLatestAnime();
  const { anime: spotlightAnime, loading: spotlightLoading } = useSpotlightAnime();

  return (
    <main className="overflow-hidden bg-[#08090b] pb-16">
      <HomeFeaturedBanner
        anime={spotlightAnime}
        comics={comics.featured}
        animeLoading={spotlightLoading}
        comicsLoading={comicsLoading}
      />
      <LatestAnimeShelf anime={latestAnime} loading={latestAnimeLoading} />

      <div className="relative z-10 mt-8 space-y-9 pb-8 sm:mt-10 sm:space-y-12 md:mt-12 md:space-y-14">
        <MangaRow title="Latest manga" mangas={comics.manga} isLoading={comicsLoading} />
        <MangaRow title="Latest manhwa" mangas={comics.manhwa} isLoading={comicsLoading} />
        <MangaRow title="Latest manhua" mangas={comics.manhua} isLoading={comicsLoading} />
      </div>
    </main>
  );
}
