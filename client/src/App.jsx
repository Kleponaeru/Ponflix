import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import Navbar from "./components/ui/Navbar";
import DetailGenre from "./components/DetailGenre";
import OngoingDetail from "./components/OnGoingDetail";
import CompletedDetail from "./components/CompletedDetail";
import Skeleton from "@mui/material/Skeleton";
import Stream from "./components/pages/Stream";
import Genres from "./components/pages/Genres";
import MangaRows from "./components/pages/comics/MangaRows";

export default function App() {
  const [categories, setCategories] = useState([]);
  const apiBaseUrl = "https://ponflix-api.vercel.app";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ongoingRes, completedRes, genresRes] = await Promise.all([
          fetch(`${apiBaseUrl}/otakudesu/ongoing?page=1`),
          fetch(`${apiBaseUrl}/otakudesu/completed?page=1`),
          fetch(`${apiBaseUrl}/otakudesu/genres`),
        ]);

        const ongoingData = await ongoingRes.json();
        const completedData = await completedRes.json();
        const genresData = await genresRes.json();

        const baseCategories = [
          {
            title: "Ongoing Anime",
            movies: ongoingData.data.animeList.map((anime) => ({
              id: anime.animeId,
              title: anime.title,
              imageUrl: anime.poster,
            })),
          },
          {
            title: "Completed Anime",
            movies: completedData.data.animeList.map((anime) => ({
              id: anime.animeId,
              title: anime.title,
              imageUrl: anime.poster,
            })),
          },
        ];

        const allGenres = genresData.data.genreList;
        const genrePromises = allGenres.map((genre) =>
          fetch(`${apiBaseUrl}/otakudesu/genres/${genre.genreId}?page=1`)
            .then((res) => res.json())
            .catch((error) => {
              console.error(`Error fetching genre ${genre.title}:`, error);
              return { data: { animeList: [] } };
            })
        );

        const genreResults = await Promise.all(genrePromises);

        const genreCategories = genreResults.map((result, index) => ({
          title: allGenres[index].title,
          genreId: allGenres[index].genreId,
          movies: result.data.animeList.map((anime) => ({
            id: anime.animeId,
            title: anime.title,
            imageUrl: anime.poster,
          })),
        }));

        setCategories([...baseCategories, ...genreCategories]);
      } catch (error) {
        console.error("Error fetching otakudesu data:", error);
        setCategories([]);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen bg-black text-white pt-16">
            <Navbar />
            <Hero />
            <div className="relative z-10 pb-10">
              {/* Show Skeleton Immediately */}
              {categories.length === 0 &&
                [...Array(3)].map((_, index) => (
                  <MovieRow
                    key={index}
                    title="Loading..."
                    movies={[]}
                    genreId=""
                  />
                ))}

              {/* Replace Skeleton with Real Data Once categories Load */}
              {categories.length > 0 &&
                categories.map((category) => (
                  <MovieRow
                    key={category.title}
                    title={category.title}
                    movies={category.movies}
                    genreId={category.genreId}
                  />
                ))}
            </div>
          </main>
        }
      />
      <Route path="/genres/:genreId" element={<DetailGenre />} />
      <Route path="/ongoing" element={<OngoingDetail />} />
      <Route path="/completed" element={<CompletedDetail />} />
      <Route path="/stream/:animeId" element={<Stream />} />
      <Route path="/genres" element={<Genres />} />
      <Route
        path="/comics"
        element={
          <main className="min-h-screen bg-black text-white pt-16">
            <Navbar />
            <MangaRows />
          </main>
        }
      />
    </Routes>
  );
}
