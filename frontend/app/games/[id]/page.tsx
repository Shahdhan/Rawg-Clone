"use client";

import { useEffect, useState } from "react";
import { fetchGame } from "@/app/lib/api";
import { useParams } from "next/navigation";
import { Game } from "@/app/lib/api";
import ReviewSection from "@/app/components/ReviewSection";
import Navbar from "@/app/components/Navbar";
import Loading from "@/app/components/Loading";
import GameCard from "@/app/components/GameCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [search, setSearch] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);

  useEffect(() => {
    const loadGame = async () => {
      const data = await fetchGame(id);
      setGame(data);
      setLoading(false);
      fetch(`${API_URL}/api/games/${id}/similar`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setSimilarGames(data))
        .catch(() => {});
    };
    loadGame();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.some((fav: any) => String(fav.game_id) === id);
          setIsFavorite(found);
        }
      } catch (err) {
        console.error("Error checking favorites:", err);
      }
    };
    checkFavorite();
  }, [id]);

  const handleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to add favorites!");
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/api/favorites/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsFavorite(false);
      } else {
        const res = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ game_id: id }),
        });
        if (res.ok) setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error updating favorites:", err);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">Game not found</p>
          <a href="/" className="text-blue-600 hover:text-blue-400">
            Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar onSearch={setSearch} />

      {/* Back Button */}
      <div className="px-6 py-3">
        <a
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white bg-gray-900/70 hover:bg-gray-800 px-4 py-2 rounded-lg transition w-fit"
        >
          ← Back
        </a>
      </div>

      {/* Hero Image */}
      <div className="relative w-full overflow-hidden h-[700px]">
        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.title}
            className="w-full h-full object-cover object-top"
          />
        )}

        {/* Gradient from 50% */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />

        {/* Title + Genres, vertically centered, left aligned */}
        <div className="absolute bottom-8 left-0 px-8">
          <h1 className="text-[2rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[6rem] font-bold drop-shadow-lg leading-none mb-4">
            {game.title}
          </h1>
          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {game.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-gray-800/80 px-5 py-2 rounded-full text-base"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-8 pb-16 pt-8">
        {/* Meta info + Rating + Favorite Button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-2">
              <span>
                {new Date(game.release_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>{game.playtime} hours</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${star <= Math.round(game.rating) ? "text-yellow-400" : "text-gray-600"}`}
                >
                  ★
                </span>
              ))}
              <span className="text-gray-400 text-sm ml-2">
                ({game.rating}/5)
              </span>
            </div>
          </div>
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              isFavorite
                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {favLoading
              ? "..."
              : isFavorite
                ? "★ Favorited"
                : "☆ Add to Favorites"}
          </button>
        </div>

        {/* Description */}
        {game.description && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-3">About</h2>
            <p className="text-gray-300 leading-relaxed">{game.description}</p>
          </div>
        )}

        {/* Available Platforms */}
        {game.platforms && game.platforms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Available On</h2>
            <div className="flex flex-wrap gap-3">
              {(game.platforms as any[]).map((p) => {
                const slug: string = (
                  p.platform?.slug ??
                  p.slug ??
                  ""
                ).toLowerCase();
                const name: string = p.platform?.name ?? p.name ?? "";
                const id: number = p.platform?.id ?? p.id;
                const icon =
                  slug.includes("pc") || slug.includes("windows")
                    ? "🖥️"
                    : slug.includes("playstation")
                      ? "🎮"
                      : slug.includes("xbox")
                        ? "🎮"
                        : slug.includes("nintendo") || slug.includes("switch")
                          ? "🕹️"
                          : slug.includes("ios") || slug.includes("iphone")
                            ? "📱"
                            : slug.includes("android")
                              ? "📱"
                              : slug.includes("mac")
                                ? "💻"
                                : slug.includes("linux")
                                  ? "🐧"
                                  : "🎮";
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300"
                  >
                    {icon} {name}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection gameId={id} />

        {/* Similar Games */}
        {similarGames.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              More Games Like This
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {similarGames.map((g) => (
                <div key={g.id} className="shrink-0 w-56">
                  <GameCard game={g} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
