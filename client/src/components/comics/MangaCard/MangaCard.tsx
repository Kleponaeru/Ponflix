import { MangaListItem } from "@/types/manga-list";
import { useNavigate } from "react-router-dom";
import { Play, Info, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  manga: MangaListItem;
  index?: number;
}

export default function MangaCard({ manga, index = 0 }: Props) {
  const navigate = useNavigate();

  const handleStreamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/comics/${manga.id}/chapter/1`);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/comics/${manga.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      className="flex-shrink-0 relative group/card"
      style={{
        width: "clamp(140px, 19vw, 230px)",
        height: "clamp(240px, 28vw, 380px)",
      }}
    >
      {/* Main Card */}
      <div
        className="w-full h-4/5 overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-gray-800 relative cursor-pointer
          border border-gray-800 group-hover/card:border-gray-700 transition-all duration-300
          shadow-lg group-hover/card:shadow-2xl"
        onClick={() => navigate(`/comics/${manga.id}`)}
      >
        {/* Top 3 Ranking Badge */}
        {index < 3 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current" />
          </div>
        )}

        {/* Manga Image */}
        <img
          src={manga.imageUrl || "/placeholder.svg"}
          alt={manga.title}
          className="object-cover w-full h-full transition-all duration-500 group-hover/card:scale-110 will-change-transform"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <div className="flex flex-col gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
            {/* Colored/B&W Badge */}
            <div className="flex justify-between items-start">
              <div
                className={`${
                  manga.isColored
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gray-700"
                } text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg`}
              >
                {manga.isColored ? "COLORED" : "B&W"}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-white text-sm font-semibold line-clamp-2 drop-shadow-lg">
              {manga.title}
            </h3>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleStreamClick}
                className="bg-white hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                title="Read now"
              >
                <Play className="h-3.5 w-3.5 text-black" fill="black" />
              </button>
              <button
                onClick={handleInfoClick}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                title="More info"
              >
                <Info className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div
        className="mt-3 px-1 cursor-pointer h-1/5 flex flex-col"
        onClick={handleStreamClick}
      >
        <h3
          className="text-sm font-semibold text-white transition-colors duration-300 group-hover/card:text-red-400 line-clamp-1"
          title={manga.title}
        >
          {manga.title}
        </h3>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center mt-1.5 w-full gap-1">
          <div className="flex items-center text-xs text-gray-400">
            <span className="px-2 py-0.5 bg-gray-800 rounded-md font-medium">
              {manga.type}
            </span>

            {manga.latestChapter && (
              <>
                <span className="mx-1.5 text-gray-600">•</span>
                <span className="text-gray-500 truncate">
                  {manga.latestChapter.title}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
