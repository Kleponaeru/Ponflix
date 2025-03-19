"use client";
import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import Navbar from "./components/Navbar";

export default function App() {
  const [categories, setCategories] = useState([]);
  const apiBaseUrl = "http://localhost:3001";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ongoing, completed, and genres
        const [ongoingRes, completedRes, genresRes] = await Promise.all([
          fetch(`${apiBaseUrl}/otakudesu/ongoing?page=1`),
          fetch(`${apiBaseUrl}/otakudesu/completed?page=1`),
          fetch(`${apiBaseUrl}/otakudesu/genres`),
        ]);

        const ongoingData = await ongoingRes.json();
        const completedData = await completedRes.json();
        const genresData = await genresRes.json();

        // Map ongoing and completed categories
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

        // Use all genres from the API
        const allGenres = genresData.data.genreList;

        // Fetch anime for each genre
        const genrePromises = allGenres.map((genre) =>
          fetch(`${apiBaseUrl}/otakudesu/genres/${genre.genreId}?page=1`)
            .then((res) => res.json())
            .catch((error) => {
              console.error(`Error fetching genre ${genre.title}:`, error);
              return { data: { animeList: [] } }; // Fallback for failed requests
            })
        );

        const genreResults = await Promise.all(genrePromises);

        // Map genre data into categories
        const genreCategories = genreResults.map((result, index) => ({
          title: allGenres[index].title,
          movies: result.data.animeList.map((anime) => ({
            id: anime.animeId,
            title: anime.title,
            imageUrl: anime.poster,
          })),
        }));

        // Combine base categories with all genre categories
        setCategories([...baseCategories, ...genreCategories]);
      } catch (error) {
        console.error("Error fetching Otakudesu data:", error);
        setCategories([]);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  return (
    <main className="min-h-screen bg-black text-white pt-16">
      <Navbar />
      <Hero />
      <div className="relative z-10 pb-10">
        {categories.length > 0 ? (
          categories.map((category) => (
            <MovieRow
              key={category.title}
              title={category.title}
              movies={category.movies}
            />
          ))
        ) : (
          <p className="text-center">Loading anime data...</p>
        )}
      </div>
    </main>
  );
}
