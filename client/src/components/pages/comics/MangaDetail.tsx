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
      <div className="flex flex-col md:flex-row gap-10">
        {/* Cover */}
        <img
          src={manga.imageUrl}
          alt={manga.title}
          className="w-60 h-auto rounded-lg shadow-lg self-start"
        />

        {/* Info */}
        <div className="flex-1 space-y-5">
          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight">{manga.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {manga.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                {manga.rating}
              </div>
            )}

            {manga.votes && <span>({manga.votes})</span>}

            <span>
              {manga.status
                ? manga.status == "Berjalan"
                  ? "Ongoing"
                  : "Completed"
                : "Unknown"}
            </span>
            <span>{manga.type}</span>
          </div>

          {/* Author info */}
          <div className="text-sm text-gray-400 space-y-1">
            {manga.author && (
              <div>
                Author: <span className="text-white">{manga.author}</span>
              </div>
            )}
            {manga.illustrator && (
              <div>
                Illustrator:{" "}
                <span className="text-white">{manga.illustrator}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {manga.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {manga.genres.map((g) => (
                <span
                  key={g.slug}
                  className="px-3 py-1 text-sm bg-gray-800 rounded-full hover:bg-red-600 transition"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 leading-relaxed">
            {manga.description || "No description available."}
          </p>

          {/* Alternative titles */}
          {manga.alternativeTitles.length > 0 && (
            <details className="text-gray-400">
              <summary className="cursor-pointer hover:text-white transition">
                Alternative Titles
              </summary>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {manga.alternativeTitles.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            {manga.firstChapter && (
              <button
                onClick={() => navigate(`/chapter${manga.firstChapter?.slug}`)}
                className="gap-3 px-5 py-2 group relative inline-flex items-center bg-white text-black rounded-md overflow-hidden transition-all duration-300 hover:bg-red-600 hover:text-white hover:scale-105"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                Read First Chapter
              </button>
            )}

            {manga.latestChapter && (
              <button
                onClick={() => navigate(`/chapter${manga.latestChapter?.slug}`)}
                className="px-5 py-2 border border-gray-600 rounded-md hover:border-red-600 hover:text-red-500 transition"
              >
                Latest Chapter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spoiler preview */}
      {manga.spoilerImages.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {manga.spoilerImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`spoiler-${i}`}
                className="rounded-lg hover:scale-105 transition"
              />
            ))}
          </div>
        </div>
      )}

      {/* Chapter list */}
      {manga.chapters.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold mb-4">Chapters</h2>

          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-2">
            {manga.chapters.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate(`/comics/${id}/chapter${c.slug}`)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-900 rounded hover:bg-red-600 transition"
              >
                <span>{c.title}</span>
                <span className="text-sm text-gray-400">{c.releasedAt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
