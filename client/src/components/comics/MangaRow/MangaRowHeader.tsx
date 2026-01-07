import { Link } from "react-router-dom";
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MangaRowHeaderProps {
  title: string;
  genreId?: string;
  accentColor?: "red" | "blue" | "green" | "purple" | "orange";
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

  const colorMap = {
    red: {
      title: "text-red-500",
      gradient: "from-red-500/20 via-transparent to-transparent",
      seeMore: "text-red-400 hover:text-red-300",
      activeButton: "bg-gradient-to-r from-red-600 to-red-500",
    },
    blue: {
      title: "text-blue-500",
      gradient: "from-blue-500/20 via-transparent to-transparent",
      seeMore: "text-blue-400 hover:text-blue-300",
      activeButton: "bg-gradient-to-r from-blue-600 to-blue-500",
    },
    green: {
      title: "text-green-500",
      gradient: "from-green-500/20 via-transparent to-transparent",
      seeMore: "text-green-400 hover:text-green-300",
      activeButton: "bg-gradient-to-r from-green-600 to-green-500",
    },
    purple: {
      title: "text-purple-500",
      gradient: "from-purple-500/20 via-transparent to-transparent",
      seeMore: "text-purple-400 hover:text-purple-300",
      activeButton: "bg-gradient-to-r from-purple-600 to-purple-500",
    },
    orange: {
      title: "text-orange-500",
      gradient: "from-orange-500/20 via-transparent to-transparent",
      seeMore: "text-orange-400 hover:text-orange-300",
      activeButton: "bg-gradient-to-r from-orange-600 to-orange-500",
    },
  };

  const colors = colorMap[accentColor];

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
