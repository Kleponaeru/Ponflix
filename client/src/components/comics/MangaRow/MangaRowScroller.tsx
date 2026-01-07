import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface MangaRowScrollerProps {
  children: ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
  canLeft: boolean;
  canRight: boolean;
  activeDot: number;
  dotCount: number;
  scrollBy: (dir: "left" | "right") => void;
  accentColor?: "red" | "blue" | "green" | "purple" | "orange";
}

export default function MangaRowScroller({
  children,
  ref,
  canLeft,
  canRight,
  activeDot,
  dotCount,
  scrollBy,
  accentColor = "red",
}: MangaRowScrollerProps) {
  const colorMap = {
    red: {
      button: "text-red-400",
      activeButton: "bg-gradient-to-r from-red-600 to-red-500",
      scrollButton: "hover:bg-red-600/30 border-red-500/30",
      glow: "shadow-red-500/50",
    },
    blue: {
      button: "text-blue-400",
      activeButton: "bg-gradient-to-r from-blue-600 to-blue-500",
      scrollButton: "hover:bg-blue-600/30 border-blue-500/30",
      glow: "shadow-blue-500/50",
    },
    green: {
      button: "text-green-400",
      activeButton: "bg-gradient-to-r from-green-600 to-green-500",
      scrollButton: "hover:bg-green-600/30 border-green-500/30",
      glow: "shadow-green-500/50",
    },
    purple: {
      button: "text-purple-400",
      activeButton: "bg-gradient-to-r from-purple-600 to-purple-500",
      scrollButton: "hover:bg-purple-600/30 border-purple-500/30",
      glow: "shadow-purple-500/50",
    },
    orange: {
      button: "text-orange-400",
      activeButton: "bg-gradient-to-r from-orange-600 to-orange-500",
      scrollButton: "hover:bg-orange-600/30 border-orange-500/30",
      glow: "shadow-orange-500/50",
    },
  };

  const colors = colorMap[accentColor];

  return (
    <div className="space-y-4">
      <div className="relative group/row">
        {/* Left Scroll Button */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-10 w-10 
            rounded-full backdrop-blur-md transition-all duration-300
            ${colors.scrollButton}
            ${
              canLeft
                ? "opacity-0 group-hover/row:opacity-100 shadow-lg"
                : "opacity-0 pointer-events-none"
            }`}
          onClick={() => scrollBy("left")}
          disabled={!canLeft}
        >
          <ChevronLeft className={`h-5 w-5 ${colors.button}`} />
        </Button>

        {/* Scrollable Container */}
        <div
          ref={ref}
          className="flex items-center space-x-5 overflow-x-scroll scrollbar-hide pb-12 will-change-scroll px-4 md:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>

        {/* Right Scroll Button */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-0 bottom-0 right-0 z-40 m-auto h-10 w-10 
            rounded-full backdrop-blur-md transition-all duration-300
            ${colors.scrollButton}
            ${
              canRight
                ? "opacity-0 group-hover/row:opacity-100 shadow-lg"
                : "opacity-0 pointer-events-none"
            }`}
          onClick={() => scrollBy("right")}
          disabled={!canRight}
        >
          <ChevronRight className={`h-5 w-5 ${colors.button}`} />
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: dotCount }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeDot
                ? `${colors.activeButton} w-20 shadow-lg ${colors.glow}`
                : "bg-gray-800 w-10 hover:bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
