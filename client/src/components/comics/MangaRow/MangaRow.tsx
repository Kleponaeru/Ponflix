import type { MangaListItem } from "@/types/manga-list";
import MangaRowHeader from "./MangaRowHeader";
import MangaRowScroller from "./MangaRowScroller";
import MangaCard from "../MangaCard/MangaCard";
import { useMangaRowScroll } from "@/hooks/useMangaRowScroll";

interface Props {
  title: string;
  mangas: MangaListItem[];
  genreId?: string;
  isLoading?: boolean;
}

function RowSkeleton() {
  return (
    <div className="content-shell overflow-hidden" aria-hidden="true">
      <div className="flex gap-3 md:gap-5">
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="w-[clamp(9.25rem,17vw,13.25rem)] shrink-0" key={index}>
            <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MangaRow({
  title,
  mangas,
  genreId,
  isLoading = false,
}: Props) {
  const scroll = useMangaRowScroll();

  if (mangas.length === 0 && !isLoading) return null;

  return (
    <section className="space-y-3" aria-label={title}>
      <MangaRowHeader title={title} genreId={genreId} />
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <MangaRowScroller
          ref={scroll.rowRef}
          canLeft={scroll.canLeft}
          canRight={scroll.canRight}
          scroll={scroll.scroll}
        >
          {mangas.map((manga, index) => (
            <div className="snap-start" key={manga.id}>
              <MangaCard manga={manga} index={index} />
            </div>
          ))}
        </MangaRowScroller>
      )}
    </section>
  );
}
