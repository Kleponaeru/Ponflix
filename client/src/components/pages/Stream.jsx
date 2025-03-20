import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Stream() {
  const { animeId } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Stream: Fetching anime for ID:", animeId);

    const fetchAnimeDetails = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/otakudesu/anime/${animeId}`
        );
        console.log("Stream: API Response Status:", res.status);

        if (!res.ok) {
          throw new Error(`Failed to fetch anime: ${res.status}`);
        }
        const data = await res.json();
        console.log(
          "Stream: Full API Response:",
          JSON.stringify(data, null, 2)
        );

        if (data.ok && data.data) {
          // Sort episodes by title (ascending)
          const sortedEpisodes = (data.data.episodeList || []).sort(
            (a, b) => Number(a.title) - Number(b.title)
          );
          setAnime({
            title: data.data.title,
            episodes: sortedEpisodes,
          });
        } else {
          throw new Error("No valid anime data found");
        }
      } catch (err) {
        console.error("Stream: Error:", err.message || "An error occurred");
        setError(err.message || "An error occurred");
        setAnime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [animeId]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (error || !anime) {
    return (
      <div className="text-white text-center mt-10">
        {error || "Anime not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-20">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-red-600 to-orange-500 text-transparent bg-clip-text">
        {anime.title}
      </h1>
      <div className="max-w-5xl mx-auto bg-gray-900 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">Episodes</h2>
        {anime.episodes.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {anime.episodes.map((episode) => (
              <EpisodeCard key={episode.episodeId} episode={episode} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            No episodes available
          </p>
        )}
      </div>
    </div>
  );
}

function EpisodeCard({ episode }) {
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStreamingUrl = async () => {
    setLoading(true);
    try {
      const episodeRes = await fetch(
        `http://localhost:3001/otakudesu/episode/${episode.episodeId}`
      );
      if (!episodeRes.ok) {
        throw new Error("Failed to fetch episode details");
      }
      const episodeData = await episodeRes.json();

      if (episodeData.ok && episodeData.data) {
        if (episodeData.data.defaultStreamingUrl) {
          setStreamingUrl(episodeData.data.defaultStreamingUrl);
        } else {
          const server720p = episodeData.data.server.qualities.find(
            (q) => q.title === "720p"
          );
          if (server720p && server720p.serverList[0]) {
            const serverRes = await fetch(
              `http://localhost:3001/otakudesu/server/${server720p.serverList[0].serverId}`
            );
            const serverData = await serverRes.json();
            if (serverData.ok && serverData.data && serverData.data.url) {
              setStreamingUrl(serverData.data.url);
            }
          }
        }
      }
    } catch (error) {
      console.error("EpisodeCard: Error fetching streaming URL:", error);
      setStreamingUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {streamingUrl ? (
        <a
          href={streamingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 text-white font-semibold rounded-lg shadow-md hover:from-red-700 hover:to-red-900 transition-all duration-200"
        >
          {episode.title}
        </a>
      ) : (
        <button
          onClick={fetchStreamingUrl}
          disabled={loading}
          className={`w-12 h-12 flex items-center justify-center bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h-8z"
              ></path>
            </svg>
          ) : (
            episode.title
          )}
        </button>
      )}
    </div>
  );
}
