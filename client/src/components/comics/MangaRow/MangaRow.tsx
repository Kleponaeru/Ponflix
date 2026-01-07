import { MangaListItem } from "@/types/manga-list";
import MangaRowHeader from "./MangaRowHeader";
import MangaRowScroller from "./MangaRowScroller";
import MangaCard from "../MangaCard/MangaCard";
import { useMangaRowScroll } from "./useMangaRowScroll";

interface Props {
  title: string;
  mangas: MangaListItem[];
  isLoading?: boolean;
}

export default function MangaRow({ title, mangas, isLoading }: Props) {
  const dotCount = title.includes("Latest") ? 3 : 5;
  const scroll = useMangaRowScroll(dotCount);

  if (!mangas.length && !isLoading) return null;

  return (
    <section className="mt-12">
      <MangaRowHeader title={title} />

      <MangaRowScroller {...scroll} dotCount={dotCount}>
        {mangas.map((manga: MangaListItem) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </MangaRowScroller>
    </section>
  );
}
