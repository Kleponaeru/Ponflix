import { MangaListItem } from "@/types/manga-list";
import MangaRowHeader from "./MangaRowHeader";
import MangaRowScroller from "./MangaRowScroller";
import MangaCard from "../MangaCard/MangaCard";
import { useMangaRowScroll } from "./useMangaRowScroll";
import Skeleton from "@mui/material/Skeleton";
import { mangaAccentColors, AccentColor } from "@/config/mangaAccentColors";

interface MangaRowProps {
  title: string;
  mangas: MangaListItem[];
  accentColor?: AccentColor;
  genreId?: string;
  isLoading?: boolean;
}

export default function MangaRow({
  title,
  mangas,
  accentColor = "red",
  genreId,
  isLoading = false,
}: MangaRowProps) {
  const isOngoingOrCompleted =
    title === "Ongoing Manga" || title === "Completed Manga";
  const dotCount = isOngoingOrCompleted ? 5 : 3;
  const scroll = useMangaRowScroll(dotCount);

  if (mangas.length === 0 && !isLoading) return null;

  return (
    <section className="space-y-4 mt-8 md:mt-12 mb-10">
      <MangaRowHeader
        title={title}
        genreId={genreId}
        accentColor={accentColor}
      />

      {isLoading ? (
        <div className="px-4 md:px-12">
          <div className="flex space-x-5 overflow-x-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{
                  width: "clamp(140px, 19vw, 230px)",
                  height: "clamp(240px, 28vw, 380px)",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="82%"
                  sx={{ bgcolor: "grey.900", borderRadius: "12px" }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  sx={{ bgcolor: "grey.900", mt: 1.5 }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ bgcolor: "grey.900" }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <MangaRowScroller
          ref={scroll.ref}
          canLeft={scroll.canLeft}
          canRight={scroll.canRight}
          activeDot={scroll.activeDot}
          scrollBy={scroll.scrollBy}
          dotCount={dotCount}
          accentColor={accentColor}
        >
          {mangas.map((manga: MangaListItem, index: number) => (
            <MangaCard key={manga.id} manga={manga} index={index} />
          ))}
        </MangaRowScroller>
      )}
    </section>
  );
}
