"use client";

import { useState, useEffect } from "react";
import MangaRow from "./MangaRow";

export default function MangaRows() {
  const [mangaData, setMangaData] = useState({
    manga: [],
    manhwa: [],
    manhua: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBaseUrl = "https://ponmics-api.infy.uk";

  useEffect(() => {
    const loadMangas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api.php?latest=1&page=1`, {
          headers: { 'Accept': 'application/json' },
        });
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment.");
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.status && data.data.komik) {
          // Map data to match MangaRow's expected props
          const mappedMangas = data.data.komik.map(manga => ({
            id: manga.link.split('/').filter(Boolean).pop(),
            title: manga.judul,
            imageUrl: manga.gambar,
            rating: manga.rating || "N/A",
            genre: manga.tipe || "Unknown",
            year: "N/A", // Placeholder, as API doesn't provide year
            episodes: "N/A", // Placeholder, as API doesn't provide episodes
            status: manga.warna === "Warna" ? "Colored" : "B&W",
            tipe: manga.tipe || "Unknown", // Preserve tipe for filtering
          }));

          // Filter into separate arrays
          const manga = mappedMangas.filter(m => m.tipe.toLowerCase() === "manga");
          const manhwa = mappedMangas.filter(m => m.tipe.toLowerCase() === "manhwa");
          const manhua = mappedMangas.filter(m => m.tipe.toLowerCase() === "manhua");

          setMangaData({ manga, manhwa, manhua });
          setError(null);
        } else {
          throw new Error(data.message || "Failed to fetch manga list");
        }
      } catch (err) {
        setError(`Error loading manga: ${err.message}`);
        setMangaData({ manga: [], manhwa: [], manhua: [] });
      }
      setLoading(false);
    };

    loadMangas();
  }, []);

  return (
    <div className="py-6 px-4 md:px-12">
      {error && <p className="text-red-500 text-center">{error}</p>}
      {loading ? (
        <>
          <MangaRow title="Latest Manga" mangas={[]} accentColor="red" genreId="manga" />
          <MangaRow title="Latest Manhwa" mangas={[]} accentColor="blue" genreId="manhwa" />
          <MangaRow title="Latest Manhua" mangas={[]} accentColor="green" genreId="manhua" />
        </>
      ) : (
        <>
          <MangaRow title="Latest Manga" mangas={mangaData.manga} accentColor="red" genreId="manga" />
          <MangaRow title="Latest Manhwa" mangas={mangaData.manhwa} accentColor="blue" genreId="manhwa" />
          <MangaRow title="Latest Manhua" mangas={mangaData.manhua} accentColor="green" genreId="manhua" />
        </>
      )}
    </div>
  );
}