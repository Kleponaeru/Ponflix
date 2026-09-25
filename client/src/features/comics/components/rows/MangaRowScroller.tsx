import { ReactNode, forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  children: ReactNode;
  canLeft: boolean;
  canRight: boolean;
  scroll: (direction: "left" | "right") => void;
}

const MangaRowScroller = forwardRef<HTMLDivElement, Props>(
  ({ children, canLeft, canRight, scroll }, ref) => (
    <div className="content-shell group/rail relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll titles left"
          className="absolute left-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-r-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] sm:gap-4 lg:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll titles right"
          className="absolute right-0 top-[38%] z-20 hidden h-20 w-11 -translate-y-1/2 items-center justify-center rounded-l-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/90 focus-visible:opacity-100 group-hover/rail:opacity-100 lg:flex"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}
    </div>
  )
);

MangaRowScroller.displayName = "MangaRowScroller";

export default MangaRowScroller;
