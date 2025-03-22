"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../ui/Navbar";
import Skeleton from "@mui/material/Skeleton";
import { CircularProgress } from "@mui/material";

export default function Stream() {
  const { animeId } = useParams();
  const [anime, setAnime] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const EPISODES_PER_TAB = 30;

  // For the StreamPage component:
  useEffect(() => {
    // Reset player state when animeId changes
    setSelectedUrl(null);
    setSelectedEpisode(null);
    setError(null);
    setActiveTab(0);

    const fetchAnimeDetails = async () => {
      try {
        const res = await fetch(
          `https://ponflix-api.vercel.app/samehadaku/anime/${animeId}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch anime: ${res.status}`);
        }
        const data = await res.json();

        if (data.ok && data.data) {
          const sortedEpisodes = (data.data.episodeList || []).sort(
            (a, b) => Number(a.title) - Number(b.title)
          );

          // Enhanced title fallback logic
          let displayTitle = data.data.title;

          // If main title is empty, try english
          if (!displayTitle || displayTitle === "") {
            displayTitle = data.data.english || "";
          }

          // If still empty, try synonyms
          if (!displayTitle || displayTitle === "") {
            displayTitle = data.data.synonyms || "";
          }

          // If still empty, try japanese
          if (!displayTitle || displayTitle === "") {
            displayTitle = data.data.japanese || "Unknown Anime";
          }

          setAnime({
            title: displayTitle,
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

  const fetchStreamingUrl = async (episode) => {
    setEpisodeLoading(true);
    setSelectedEpisode(episode.title);

    try {
      const episodeRes = await fetch(
        `https://ponflix-api.vercel.app/samehadaku/episode/${episode.episodeId}`
      );
      if (!episodeRes.ok) {
        throw new Error("Failed to fetch episode details");
      }
      const episodeData = await episodeRes.json();
      console.log("Episode Data:", JSON.stringify(episodeData, null, 2));

      if (episodeData.ok && episodeData.data) {
        let url = null;

        const server720p = episodeData.data.server.qualities.find(
          (q) => q.title === "720p"
        );
        console.log("720p Quality Found:", server720p || "Not available");

        if (server720p && server720p.serverList[0]) {
          const serverRes = await fetch(
            `https://ponflix-api.vercel.app/samehadaku/server/${server720p.serverList[0].serverId}`
          );
          const serverData = await serverRes.json();
          console.log(
            "720p Server Response:",
            JSON.stringify(serverData, null, 2)
          );
          if (serverData.ok && serverData.data && serverData.data.url) {
            url = serverData.data.url;
            console.log("Selected 720p URL:", url);
          }
        }

        if (!url && episodeData.data.defaultStreamingUrl) {
          url = episodeData.data.defaultStreamingUrl;
          console.log("Falling back to defaultStreamingUrl:", url);
        }

        if (!url && episodeData.data.server.qualities.length > 0) {
          console.log("Falling back to other qualities...");
          for (const quality of episodeData.data.server.qualities) {
            if (quality.serverList[0]) {
              const serverRes = await fetch(
                `https://ponflix-api.vercel.app/samehadaku/server/${quality.serverList[0].serverId}`
              );
              const serverData = await serverRes.json();
              console.log(
                `Server Response for ${quality.title}:`,
                JSON.stringify(serverData, null, 2)
              );
              if (serverData.ok && serverData.data && serverData.data.url) {
                url = serverData.data.url;
                console.log(`Selected ${quality.title} URL:`, url);
                break;
              }
            }
          }
        }

        if (url) {
          console.log("Setting selectedUrl in player:", url);
          setSelectedUrl(url);
        } else {
          throw new Error("No streaming URL found");
        }
      }
    } catch (error) {
      console.error("Error fetching streaming URL:", error);
      setError("Failed to load episode. Please try again.");
      setSelectedUrl(null);
    } finally {
      setEpisodeLoading(false);
    }
  };

  const generateTabs = () => {
    if (!anime || !anime.episodes || anime.episodes.length === 0) return [];

    const lastEpisodeNum = Number(
      anime.episodes[anime.episodes.length - 1].title
    );
    const tabCount = Math.ceil(lastEpisodeNum / EPISODES_PER_TAB);

    return Array.from({ length: tabCount }, (_, i) => {
      const start = i * EPISODES_PER_TAB + 1;
      const end = Math.min((i + 1) * EPISODES_PER_TAB, lastEpisodeNum);
      return { index: i, label: `${start}-${end}` };
    });
  };

  const getEpisodesForCurrentTab = () => {
    if (!anime || !anime.episodes) return [];

    const tabs = generateTabs();
    if (tabs.length === 0) return anime.episodes;

    const currentTab = tabs[activeTab];
    if (!currentTab) return [];

    const startEp = Number.parseInt(currentTab.label.split("-")[0]);
    const endEp = Number.parseInt(currentTab.label.split("-")[1]);

    return anime.episodes.filter((ep) => {
      const epNum = Number(ep.title);
      return epNum >= startEp && epNum <= endEp;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6 mt-12">
              <Skeleton
                variant="text"
                width={60}
                height={30}
                sx={{ bgcolor: "grey.800" }}
              />
              <span className="text-gray-400">/</span>
              <Skeleton
                variant="text"
                width={120}
                height={30}
                sx={{ bgcolor: "grey.800" }}
              />
            </div>
            <div className="bg-gray-900 rounded-xl shadow-lg p-6">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={400}
                sx={{ bgcolor: "grey.800", borderRadius: "0.5rem" }}
              />
              <Skeleton
                variant="text"
                width={120}
                height={40}
                sx={{
                  bgcolor: "grey.800",
                  marginTop: "2rem",
                  marginBottom: "1rem",
                }}
              />
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {[...Array(20)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={48}
                    height={48}
                    sx={{ bgcolor: "grey.800", borderRadius: "0.5rem" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !anime) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          <div className="text-red-500 text-xl mb-4">
            {error || "Anime not found"}
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </>
    );
  }

  const tabs = generateTabs();
  const currentTabEpisodes = getEpisodesForCurrentTab();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-20">
        <div className="max-w-5xl mx-auto">
          {anime && (
            <nav className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 mt-12 flex-wrap">
              <Link
                to="/"
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-white">{anime.title}</span>
              {selectedEpisode && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-white">Episode {selectedEpisode}</span>
                </>
              )}
            </nav>
          )}

          <div className="bg-gray-900 rounded-xl shadow-lg p-6">
            {/* Video Player */}
            <div className="mb-8 relative">
              {selectedUrl ? (
                <iframe
                  src={selectedUrl}
                  className="w-full h-[300px] md:h-[500px] rounded-lg"
                  allowFullScreen
                  title={`Streaming ${anime.title} Episode ${selectedEpisode}`}
                ></iframe>
              ) : (
                <div className="w-full h-[300px] md:h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-gray-400 text-lg mb-2">
                      Select an episode to start streaming
                    </p>
                    <p className="text-gray-500 text-sm">
                      Episodes are listed below
                    </p>
                  </div>
                </div>
              )}

              {episodeLoading && (
                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <CircularProgress
                      color="error"
                      size={48}
                      className="mb-2"
                    />
                    <p className="text-white">Loading episode...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Episode List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-100">
                  Episodes
                </h2>
                <div className="text-sm text-gray-400">
                  {anime.episodes.length} episodes
                </div>
              </div>

              {tabs.length > 1 && (
                <div className="mb-4 border-b border-gray-700">
                  <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                    {tabs.map((tab) => (
                      <button
                        key={tab.index}
                        onClick={() => setActiveTab(tab.index)}
                        className={`px-4 py-2 mr-2 rounded-t-lg transition-colors ${
                          activeTab === tab.index
                            ? "bg-gray-700 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentTabEpisodes.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {currentTabEpisodes.map((episode) => (
                    <EpisodeButton
                      key={episode.episodeId}
                      episode={episode}
                      isSelected={selectedEpisode === episode.title}
                      isLoading={episodeLoading}
                      onClick={() => fetchStreamingUrl(episode)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8 bg-gray-800/50 rounded-lg">
                  No episodes available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EpisodeButton({ episode, isSelected, isLoading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ${
        isSelected
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-white"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {episode.title}
    </button>
  );
}
