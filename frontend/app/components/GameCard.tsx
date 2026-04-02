"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Game } from "../lib/api";

function resizeRawgImage(url: string, width: number = 640): string {
  if (!url) return url;
  return url.replace("https://media.rawg.io/media/", `https://media.rawg.io/media/resize/${width}/-/`);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GameCardProbs {
  game: Game;
  favoriteIds?: Set<number>;
  onFavoriteChange?: () => void;
}

export default function GameCard({ game, favoriteIds, onFavoriteChange }: GameCardProbs) {
  const [isFavorite, setIsFavorite] = useState(() => favoriteIds?.has(game.id) ?? false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(favoriteIds?.has(game.id) ?? false);
  }, [favoriteIds, game.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to add favorites!");
      return;
    }
    setLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`${API_URL}/api/favorites/${game.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsFavorite(false);
          window.dispatchEvent(new Event("favorites-updated"));
          onFavoriteChange?.();
        }
      } else {
        const res = await fetch(`${API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ game_id: game.id }),
        });
        if (res.ok) {
          setIsFavorite(true);
          window.dispatchEvent(new Event("favorites-updated"));
          onFavoriteChange?.();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/games/${game.id}`}>
      <div className="group bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-black/50 cursor-pointer relative">
        {/* Game Image */}
        <div className="relative h-48 w-full bg-gray-700">
          {game.background_image ? (
            <Image
              src={resizeRawgImage(game.background_image)}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzNzQxNTEiLz48L3N2Zz4="
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="p-4 relative">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-bold text-lg line-clamp-2 flex-1 pr-2">
              {game.title}
            </h3>
            <button
              onClick={handleFavorite}
              disabled={loading}
              className={`text-2xl transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 shrink-0 ${
                isFavorite
                  ? "text-yellow-400"
                  : "text-gray-500 hover:text-yellow-400"
              }`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>

          {game.release_date && (
            <p className="text-gray-400 text-sm mb-2">
              {new Date(game.release_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}

          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Rating — bottom right */}
          {game.rating > 0 && (
            <div className="absolute bottom-4 right-4">
              <span className="text-yellow-400 font-bold text-sm">
                ★ {game.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
