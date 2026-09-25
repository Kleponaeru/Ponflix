import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  title: string;
  genreId?: string;
}

function getBrowseLink(title: string, genreId?: string) {
  if (genreId) return `/comics/category/${genreId}`;
  if (/manhwa/i.test(title)) return "/comics/category/Manhwa";
  if (/manhua/i.test(title)) return "/comics/category/Manhua";
  if (/manga/i.test(title)) return "/comics/category/Manga";
  return undefined;
}

export default function MangaRowHeader({ title, genreId }: Props) {
  const browseLink = getBrowseLink(title, genreId);

  return (
    <div className="content-shell mb-3 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
      </div>
      {browseLink && (
        <Link
          to={browseLink}
          className="group inline-flex shrink-0 items-center gap-1 pb-0.5 text-xs font-medium text-white/55 transition hover:text-white sm:text-sm"
        >
          See all
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
