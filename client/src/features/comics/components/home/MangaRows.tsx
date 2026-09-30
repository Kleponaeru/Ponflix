import { useLatestAnime } from "@/features/anime/hooks/useLatestAnime";
import LatestAnimeShelf from "@/features/anime/components/LatestAnimeShelf";
import MangaRow from "@/features/comics/components/rows/MangaRow";
import HomeFeaturedBanner from "@/features/comics/components/home/HomeFeaturedBanner";
import { useLatestMangas } from "@/features/comics/hooks/useLatestMangas";

export default function MangaRows() {
  const { data: comics, loading: comicsLoading } = useLatestMangas();
  const { anime, loading: animeLoading } = useLatestAnime();

  return (
    <main className="overflow-hidden bg-[#08090b] pb-16">
      <HomeFeaturedBanner
        anime={anime}
        comics={comics.featured}
        animeLoading={animeLoading}
        comicsLoading={comicsLoading}
      />
      <LatestAnimeShelf anime={anime} loading={animeLoading} />

      <div className="relative z-10 mt-8 space-y-9 pb-8 sm:mt-10 sm:space-y-12 md:mt-12 md:space-y-14">
        <MangaRow title="Latest manga" mangas={comics.manga} isLoading={comicsLoading} />
        <MangaRow title="Latest manhwa" mangas={comics.manhwa} isLoading={comicsLoading} />
        <MangaRow title="Latest manhua" mangas={comics.manhua} isLoading={comicsLoading} />
      </div>
    </main>
  );
}
