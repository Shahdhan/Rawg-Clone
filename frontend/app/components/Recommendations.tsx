"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useEffect } from "react";
import Loading from "./Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RecommendedGame {
  game: {
    id: number;
    title: string;
    background_image: string;
    rating: number;
    genres?: Array<{ id: number; name: string }>;
  };
  explanation: string;
  match: number | null;
}

async function fetchRecommendations(platform: string, genre: string): Promise<RecommendedGame[]> {
  const token = localStorage.getItem("token");
  const filterParams = new URLSearchParams();
  if (platform) filterParams.set("platform", platform);
  if (genre) filterParams.set("genre", genre);
  const filterStr = filterParams.toString() ? `?${filterParams.toString()}` : "";

  if (token) {
    const res = await fetch(`${API_URL}/api/recommendations${filterStr}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) return data;
    }
  }

  // Fallback: fetch top-rated popular games (with same filters)
  const fallbackParams = new URLSearchParams({ ordering: "-rating", page_size: "10" });
  if (platform) fallbackParams.set("platform", platform);
  if (genre) fallbackParams.set("genre", genre);
  const res = await fetch(`${API_URL}/api/games?${fallbackParams.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data ?? data.results ?? []).map((game: any) => ({
    game,
    explanation: "Popular Games You Might Enjoy",
    match: null,
  }));
}

interface RecommendationsProps {
  platform?: string;
  genre?: string;
}

export default function Recommendations({ platform = "", genre = "" }: RecommendationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", platform, genre],
    queryFn: () => fetchRecommendations(platform, genre),
  });

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!recommendations || recommendations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === recommendations.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [recommendations]);

  if (isLoading)
    return (
      <div className="relative w-full h-[500px] rounded-2xl bg-gray-900 animate-pulse" />
    );

  if (!recommendations || recommendations.length === 0) return null;

  const current = recommendations[currentIndex];

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${current.game.background_image})` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === 0 ? recommendations.length - 1 : prev - 1,
          )
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
      >
        ←
      </button>

      <button
        onClick={() =>
          setCurrentIndex((prev) =>
            prev === recommendations.length - 1 ? 0 : prev + 1,
          )
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
      >
        →
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-10">
        {/* Genres */}
        <div className="flex gap-2 mb-3">
          {current.game.genres?.map((genre) => (
            <span
              key={genre.id}
              className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm"
            >
              {genre.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-white text-5xl font-bold mb-2">
          {current.game.title}
        </h2>

        {/* Rating */}
        <p className="text-yellow-400 text-lg mb-2">⭐ {current.game.rating}</p>

        {/* Explanation + Match */}
        <div className="flex items-center gap-3 mb-6">
          <p className="text-gray-300 italic text-sm">{current.explanation}</p>
          {current.match != null && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              {current.match}% Match
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href={`/games/${current.game.id}`}
            className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            View Game
          </Link>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition ${
                  i === currentIndex ? "bg-white w-6" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
