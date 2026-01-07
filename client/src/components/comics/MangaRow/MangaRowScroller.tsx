import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode, forwardRef } from "react";
import { AccentColor, mangaAccentColors } from "@/config/mangaAccentColors";

interface Props {
  children: ReactNode;
  canLeft: boolean;
  canRight: boolean;
  activeDot: number;
  dotCount: number;
  scroll: (dir: "left" | "right") => void;
  accentColor?: AccentColor;
}

const MangaRowScroller = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      canLeft,
      canRight,
      activeDot,
      dotCount,
      scroll,
      accentColor = "red",
    },
    ref
  ) => {
    const colors = mangaAccentColors[accentColor];

    return (
      <div className="relative">
        {/* Scroll Container */}
        <div className="relative group/row">
          {/* Left Button - ALWAYS VISIBLE FOR TESTING */}
          <button
            onClick={() => {
              scroll("left");
            }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 
              w-10 h-10 rounded-full backdrop-blur-md
              bg-black/80 border-2 border-red-500
              flex items-center justify-center
              transition-opacity duration-300 shadow-xl
              ${canLeft ? "opacity-100" : "opacity-30"}`}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Scrollable Area */}
          <div
            ref={ref}
            className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {children}
          </div>

          {/* Right Button - ALWAYS VISIBLE FOR TESTING */}
          <button
            onClick={() => {
              scroll("right");
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 
              w-10 h-10 rounded-full backdrop-blur-md
              bg-black/80 border-2 border-red-500
              flex items-center justify-center
              transition-opacity duration-300 shadow-xl
              ${canRight ? "opacity-100" : "opacity-30"}`}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Dots */}
        {dotCount > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: dotCount }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeDot
                    ? `${colors.activeButton} w-16 ${colors.glow}`
                    : "bg-gray-700 w-8"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

MangaRowScroller.displayName = "MangaRowScroller";

export default MangaRowScroller;
