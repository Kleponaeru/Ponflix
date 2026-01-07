import { Link } from "react-router-dom";
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mangaAccentColors, AccentColor } from "@/config/mangaAccentColors";

interface MangaRowHeaderProps {
  title: string;
  genreId?: string;
  accentColor?: AccentColor;
}

export default function MangaRowHeader({
  title,
  genreId,
  accentColor = "red",
}: MangaRowHeaderProps) {
  const getDetailLink = () => {
    if (title === "Ongoing Manga") return "/ongoing";
    if (title === "Completed Manga") return "/completed";
    if (genreId) return `/comics/category/${genreId}`;
    return "#";
  };

  const colors = mangaAccentColors[accentColor];

  return (
    <div className="relative px-4 md:px-12">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} blur-3xl -z-10`}
      />

      {/* Header Content */}
      <div className="flex justify-between items-center w-full pb-2 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 ${colors.activeButton} rounded-full`} />
          <h2
            className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${colors.title}`}
          >
            {title}
            {title.includes("Trending") && (
              <TrendingUp className="h-5 w-5 animate-pulse" />
            )}
            {title.includes("New") && (
              <Sparkles className="h-5 w-5 animate-pulse" />
            )}
          </h2>
        </div>

        <Link to={getDetailLink()}>
          <Button
            variant="link"
            className={`text-sm md:text-base font-semibold ${colors.seeMore} flex items-center gap-1 group`}
          >
            Explore All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
