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
  const [selectedServer, setSelectedServer] = useState(null);
  const [servers, setServers] = useState({ "720p": [], "1080p": [] }); // Fixed initial state
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const EPISODES_PER_TAB = 30;

  useEffect(() => {
    setSelectedUrl(null);
    setSelectedEpisode(null);
    setSelectedServer(null);
    setServers({ "720p": [], "1080p": [] }); // Consistent reset
    setError(null);
    setActiveTab(0);

    const fetchAnimeDetails = async () => {
      try {
        const res = await fetch(
          `https://ponflix-api.vercel.app/samehadaku/anime/${animeId}`
        );
        if (!res.ok) throw new Error(`Failed to fetch anime: ${res.status}`);
        const data = await res.json();

        if (data.ok && data.data) {
          const sortedEpisodes = (data.data.episodeList || []).sort(
            (a, b) => Number(a.title) - Number(b.title)
          );

          let displayTitle =
            data.data.title ||
            data.data.english ||
            data.data.synonyms ||
            data.data.japanese ||
            "Unknown Anime";

          setAnime({
            title: displayTitle,
            episodes: sortedEpisodes,
            description: data.data.synopsis || "No description available",
            thumbnail: data.data.poster || "/placeholder.jpg",
          });
        } else {
          throw new Error("No valid anime data found");
        }
      } catch (err) {
        console.error("Stream: Error:", err.message);
        setError(err.message);
        setAnime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [animeId]);

  const fetchStreamingUrl = async (episode, serverId = null) => {
    setEpisodeLoading(true);
    setSelectedEpisode(episode.title);

    try {
      const episodeRes = await fetch(
        `https://ponflix-api.vercel.app/samehadaku/episode/${episode.episodeId}`
      );
      if (!episodeRes.ok) throw new Error("Failed to fetch episode details");
      const episodeData = await episodeRes.json();

      if (episodeData.ok && episodeData.data) {
        const qualities = episodeData.data.server.qualities.filter(
          (q) => q.title === "720p" || q.title === "1080p"
        );
        const serverMap = {
          "720p": [],
          "1080p": [],
        };
        qualities.forEach((q) => {
          if (q.title === "720p" || q.title === "1080p") {
            serverMap[q.title] = q.serverList;
          }
        });

        setServers(serverMap);

        let targetServer = null;
        if (serverId) {
          targetServer =
            serverMap["720p"].find((s) => s.serverId === serverId) ||
            serverMap["1080p"].find((s) => s.serverId === serverId);
        }
        if (!targetServer) {
          targetServer = serverMap["720p"][0] || serverMap["1080p"][0];
        }

        if (targetServer) {
          const serverRes = await fetch(
            `https://ponflix-api.vercel.app/samehadaku/server/${targetServer.serverId}`
          );
          const serverData = await serverRes.json();

          if (serverData.ok && serverData.data && serverData.data.url) {
            setSelectedUrl(serverData.data.url);
            setSelectedServer(targetServer.serverId);
          } else {
            throw new Error("No streaming URL found");
          }
        } else if (episodeData.data.defaultStreamingUrl) {
          setSelectedUrl(episodeData.data.defaultStreamingUrl);
          setServers({ "720p": [], "1080p": [] });
        } else {
          throw new Error("No streaming URL found");
        }
      }
    } catch (error) {
      // console.error("Error fetching streaming URL:", error);
      setError("Failed to load the episode. Please try a different server.");
      setSelectedUrl(null);
      setServers({ "720p": [], "1080p": [] });
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
    return Array.from({ length: tabCount }, (_, i) => ({
      index: i,
      label: `${i * EPISODES_PER_TAB + 1}-${Math.min(
        (i + 1) * EPISODES_PER_TAB,
        lastEpisodeNum
      )}`,
    }));
  };

  const getEpisodesForCurrentTab = () => {
    if (!anime || !anime.episodes) return [];
    const tabs = generateTabs();
    if (tabs.length === 0) return anime.episodes;
    const currentTab = tabs[activeTab];
    if (!currentTab) return [];
    const [startEp, endEp] = currentTab.label.split("-").map(Number);
    return anime.episodes.filter((ep) => {
      const epNum = Number(ep.title);
      return epNum >= startEp && epNum <= endEp;
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
          {" "}
          {/* Updated to pt-24 */}
          <div className="max-w-7xl mx-auto mt-20">
            <Skeleton
              variant="text"
              width={200}
              height={30}
              sx={{ bgcolor: "grey.800", mb: 4 }}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
                  sx={{ bgcolor: "grey.800", mt: 4 }}
                />
              </div>
              <div>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={600}
                  sx={{ bgcolor: "grey.800", borderRadius: "0.5rem" }}
                />
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
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 pt-28 z-10">
          <div className="text-red-500 text-xl mb-4">
            {error || "Anime not found"}
          </div>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 pointer-events-auto z-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ pointerEvents: "none" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </>
    );
  }

  const tabs = generateTabs();
  const currentTabEpisodes = getEpisodesForCurrentTab();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <nav className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2 mt-20 flex-wrap">
            {" "}
            {/* Removed mt-12 */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Player and Server List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-xl shadow-lg p-6">
                {/* Video Player */}
                <div className="mb-4 relative">
                  {selectedUrl ? (
                    <video
                      src={selectedUrl}
                      className="w-full h-[300px] md:h-[500px] rounded-lg"
                      controls
                      playsInline
                      title={`Streaming ${anime.title} Episode ${selectedEpisode}`}
                    ></video>
                  ) : (
                    <div className="w-full h-[300px] md:h-[500px] bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center p-6">
                        <p className="text-gray-400 text-lg mb-2">
                          Select an episode to start streaming
                        </p>
                        <p className="text-gray-500 text-sm">
                          Episodes are listed on the right
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

                {/* Server List */}
                {(servers["720p"].length > 0 ||
                  servers["1080p"].length > 0) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Select Server
                    </h3>
                    {/* 720p Servers */}
                    {servers["720p"].length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-md font-medium text-gray-300 mb-2">
                          720p Servers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {servers["720p"].map((server) => (
                            <button
                              key={server.serverId}
                              onClick={() =>
                                fetchStreamingUrl(
                                  currentTabEpisodes.find(
                                    (ep) => ep.title === selectedEpisode
                                  ),
                                  server.serverId
                                )
                              }
                              disabled={
                                episodeLoading ||
                                selectedServer === server.serverId
                              }
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedServer === server.serverId
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-700 text-white hover:bg-gray-600"
                              } ${
                                episodeLoading
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {server.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 1080p Servers */}
                    {servers["1080p"].length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-300 mb-2">
                          1080p Servers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {servers["1080p"].map((server) => (
                            <button
                              key={server.serverId}
                              onClick={() =>
                                fetchStreamingUrl(
                                  currentTabEpisodes.find(
                                    (ep) => ep.title === selectedEpisode
                                  ),
                                  server.serverId
                                )
                              }
                              disabled={
                                episodeLoading ||
                                selectedServer === server.serverId
                              }
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                selectedServer === server.serverId
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-700 text-white hover:bg-gray-600"
                              } ${
                                episodeLoading
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {server.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-gray-900 rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-2xl font-semibold mb-4">
                  About {anime.title}
                </h2>
                {anime.description &&
                typeof anime.description === "object" &&
                anime.description.paragraphs ? (
                  <div className="text-gray-300 space-y-2">
                    {anime.description.paragraphs.map((paragraph, index) => (
                      <p key={index} className="text-gray-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    {anime.description ?? "No description available"}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Episode List */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Episodes</h2>
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

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {currentTabEpisodes.length > 0 ? (
                  currentTabEpisodes.map((episode) => (
                    <EpisodeCard
                      key={episode.episodeId}
                      episode={episode}
                      isSelected={selectedEpisode === episode.title}
                      isLoading={episodeLoading}
                      onClick={() => fetchStreamingUrl(episode)}
                      thumbnail={anime.thumbnail}
                    />
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-8 bg-gray-800/50 rounded-lg">
                    No episodes available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EpisodeCard({ episode, isSelected, isLoading, onClick, thumbnail }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-red-600/20 border border-red-600"
          : "bg-gray-800 hover:bg-gray-700"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <img
        src={thumbnail}
        alt={`Episode ${episode.title}`}
        className="w-24 h-14 object-cover rounded-md"
      />
      <div className="text-left">
        <p className="font-semibold">Episode {episode.title}</p>
        <p className="text-sm text-gray-400">Click to watch</p>
      </div>
    </button>
  );
}
