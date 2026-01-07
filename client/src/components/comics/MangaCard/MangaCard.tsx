import { MangaListItem } from "@/types/manga-list";
import { useNavigate } from "react-router-dom";

interface Props {
  manga: MangaListItem;
}

export default function MangaCard({ manga }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="w-[180px] flex-shrink-0 cursor-pointer"
      onClick={() => navigate(`/comics/${manga.id}`)}
    >
      <img
        src={manga.imageUrl}
        alt={manga.title}
        className="w-full h-[260px] object-cover rounded-lg"
      />
      <h3 className="mt-2 text-sm font-semibold text-white line-clamp-1">
        {manga.title}
      </h3>
    </div>
  );
}
