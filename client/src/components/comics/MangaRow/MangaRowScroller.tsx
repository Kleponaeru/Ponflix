import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
  canLeft: boolean;
  canRight: boolean;
  activeDot: number;
  dotCount: number;
  scrollBy: (dir: "left" | "right") => void;
}

export default function MangaRowScroller({
  children,
  ref,
  canLeft,
  canRight,
  activeDot,
  dotCount,
  scrollBy,
}: Props) {
  return (
    <>
      <div className="relative group">
        {canLeft && (
          <button
            onClick={() => scrollBy("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20"
          >
            <ChevronLeft />
          </button>
        )}

        <div
          ref={ref}
          className="flex gap-5 overflow-x-scroll scrollbar-hide px-4 md:px-12"
        >
          {children}
        </div>

        {canRight && (
          <button
            onClick={() => scrollBy("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeDot ? "bg-red-500 w-12" : "bg-gray-700 w-6"
            }`}
          />
        ))}
      </div>
    </>
  );
}
