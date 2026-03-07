"use client";

import { useEffect, useState } from "react";
import { fetchGame } from "@/app/lib/api";
import { useParams } from "next/navigation";
import { Game } from "@/app/lib/api";
import ReviewSection from "@/app/components/ReviewSection";
import Navbar from "@/app/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [search, setSearch] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      const data = await fetchGame(id);
      setGame(data);
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-2xl">Loading game Details...</p>
      </div>
    );
  }

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
    <div>
      <Navbar onSearch={setSearch} />
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-4xl font-bold text-center mb-10 mt-4">
          {game.title}
        </h1>

        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.title}
            className="w-full max-h-[500px] object-contain rounded-lg mb-6"
          />
        )}

        <div className="space-y-3">
          <div className="space-y-6">
            {game.genres && game.genres.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Genre</h2>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-gray-700 px-4 py-2 rounded-lg text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p>
            <strong>Released:</strong>{" "}
            {new Date(game.release_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Rating:</strong> {game.rating}
          </p>
          <p>
            <strong>Playtime:</strong> {game.playtime} hours
          </p>

          {/* ✅ Favorite button just above reviews */}
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`mt-4 px-6 py-2 rounded-lg font-semibold transition ${
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

        <ReviewSection gameId={id} />
      </div>
    </div>
  );
}
