"use client";

import { useParams, useNavigate } from "react-router-dom";
import { JSX, useEffect, useState } from "react";
import { Loader2, Star, Calendar } from "lucide-react";
import type { Manga } from "@/types/manga";
import { mapMangaDetail } from "@/lib/mappers/manga";

export default function MangaDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    async function fetchManga() {
      try {
        const res = await fetch(
          `http://localhost/Comics-API/api.php?komik=${id}`
        );
        const json = await res.json();
        setManga(mapMangaDetail(json.data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchManga();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="text-center text-gray-400 mt-20">Manga not found</div>
    );
  }

  return (
    <div className="px-6 md:px-16 py-10 text-white">
      <div className="flex flex-col md:flex-row gap-8">
        <img
          src={manga.imageUrl}
          alt={manga.title}
          className="w-60 rounded-lg shadow-lg"
        />

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{manga.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
              {manga.rating}
            </div>

            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {manga.year}
            </div>

            <span>{manga.status}</span>
          </div>

          <p className="text-gray-300 leading-relaxed">
            {manga.description ?? "No description available."}
          </p>

          <button
            onClick={() => navigate(`/manga/${manga.id}/chapter/1`)}
            className="mt-4 px-5 py-2 rounded bg-red-600 hover:bg-red-700 transition"
          >
            Read First Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
