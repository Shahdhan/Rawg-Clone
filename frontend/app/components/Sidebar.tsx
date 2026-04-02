"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FavoriteGame {
  id: number;
  game_id: number;
  game: {
    id: number;
    title: string;
    background_image: string;
  };
}

interface SidebarProps {
  onPlatformClick: (platform: string) => void;
  onGenreClick: (genre: string) => void;
  activePlatform: string;
  activeGenre: string;
}

const platforms = [
  { id: "4", name: "PC" },
  { id: "187", name: "PlayStation 5" },
  { id: "18", name: "PlayStation 4" },
  { id: "16", name: "PlayStation 3" },
  { id: "186", name: "Xbox Series S/X" },
  { id: "1", name: "Xbox One" },
  { id: "14", name: "Xbox 360" },
  { id: "7", name: "Nintendo Switch" },
  { id: "8", name: "Nintendo 3DS" },
  { id: "3", name: "iOS" },
  { id: "21", name: "Android" },
  { id: "5", name: "macOS" },
  { id: "6", name: "Linux" },
  { id: "171", name: "Web" },
];

const genres = [
  { id: "4", name: "Action" },
  { id: "51", name: "Indie" },
  { id: "3", name: "Adventure" },
  { id: "5", name: "RPG" },
  { id: "10", name: "Strategy" },
  { id: "2", name: "Shooter" },
  { id: "40", name: "Casual" },
  { id: "14", name: "Simulation" },
  { id: "7", name: "Puzzle" },
  { id: "11", name: "Arcade" },
  { id: "83", name: "Platformer" },
  { id: "1", name: "Racing" },
  { id: "15", name: "Sports" },
  { id: "6", name: "Fighting" },
  { id: "19", name: "Family" },
  { id: "17", name: "Card" },
  { id: "28", name: "Board Games" },
  { id: "34", name: "Educational" },
];

const VISIBLE = 10;

export default function Sidebar({
  onPlatformClick,
  onGenreClick,
  activePlatform,
  activeGenre,
}: SidebarProps) {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set());
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [showAllFavorites, setShowAllFavorites] = useState(false);

  const fetchFavorites = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/api/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((newData: FavoriteGame[]) => {
        setFavorites((prev) => {
          const prevIds = new Set(prev.map((f) => f.id));
          const newIds = new Set(newData.map((f) => f.id));

          const removedIds = prev.filter((f) => !newIds.has(f.id)).map((f) => f.id);
          if (removedIds.length > 0) {
            setLeavingIds(new Set(removedIds));
            setTimeout(() => {
              setFavorites(newData);
              setLeavingIds(new Set());
            }, 300);
            return prev;
          }

          const addedIds = newData.filter((f) => !prevIds.has(f.id)).map((f) => f.id);
          if (addedIds.length > 0) {
            setEnteringIds(new Set(addedIds));
            setTimeout(() => setEnteringIds(new Set()), 300);
          }

          return newData;
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchFavorites();
    window.addEventListener("favorites-updated", fetchFavorites);
    return () => window.removeEventListener("favorites-updated", fetchFavorites);
  }, []);

  const visiblePlatforms = showAllPlatforms ? platforms : platforms.slice(0, VISIBLE);
  const hiddenPlatforms = platforms.length - VISIBLE;

  const visibleGenres = showAllGenres ? genres : genres.slice(0, VISIBLE);
  const hiddenGenres = genres.length - VISIBLE;

  const visibleFavorites = showAllFavorites ? favorites : favorites.slice(0, VISIBLE);
  const hiddenFavorites = favorites.length - VISIBLE;

  return (
    <aside className="w-64 min-h-screen p-6 border-r border-gray-800 shrink-0">

      {/* Platforms */}
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4 py-2 uppercase tracking-wider text-sm">
          Platforms
        </h3>
        <ul className="space-y-1">
          {visiblePlatforms.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onPlatformClick(activePlatform === p.id ? "" : p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                  activePlatform === p.id
                    ? "bg-white text-gray-900 font-bold"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showAllPlatforms ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          {hiddenPlatforms > 0 && (
            <button
              onClick={() => setShowAllPlatforms(true)}
              className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
            >
              + {hiddenPlatforms} more
            </button>
          )}
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showAllPlatforms ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <button
            onClick={() => setShowAllPlatforms(false)}
            className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
          >
            Show less
          </button>
        </div>
      </div>

      {/* Genres */}
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4 py-2 uppercase tracking-wider text-sm">
          Genres
        </h3>
        <ul className="space-y-1">
          {visibleGenres.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => onGenreClick(activeGenre === g.id ? "" : g.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                  activeGenre === g.id
                    ? "bg-white text-gray-900 font-bold"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {g.name}
              </button>
            </li>
          ))}
        </ul>
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showAllGenres ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          {hiddenGenres > 0 && (
            <button
              onClick={() => setShowAllGenres(true)}
              className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
            >
              + {hiddenGenres} more
            </button>
          )}
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            showAllGenres ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <button
            onClick={() => setShowAllGenres(false)}
            className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
          >
            Show less
          </button>
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white font-bold mb-4 py-2 uppercase tracking-wider text-sm">
            ★ Favorites
          </h3>
          <ul className="space-y-2">
            {visibleFavorites.map((fav) => (
              <li
                key={fav.id}
                className={`transition-all duration-300 ease-out overflow-hidden ${
                  leavingIds.has(fav.id)
                    ? "opacity-0 -translate-x-2 max-h-0"
                    : enteringIds.has(fav.id)
                    ? "opacity-0 translate-x-2 max-h-0"
                    : "opacity-100 translate-x-0 max-h-20"
                }`}
              >
                <a
                  href={`/games/${fav.game_id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition text-sm"
                >
                  {fav.game?.background_image && (
                    <img
                      src={fav.game.background_image}
                      alt={fav.game.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <span className="truncate">{fav.game?.title}</span>
                </a>
              </li>
            ))}
          </ul>
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showAllFavorites ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
            }`}
          >
            {hiddenFavorites > 0 && (
              <button
                onClick={() => setShowAllFavorites(true)}
                className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
              >
                + {hiddenFavorites} more
              </button>
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showAllFavorites ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <button
              onClick={() => setShowAllFavorites(false)}
              className="mt-2 text-xs text-gray-500 hover:text-white transition px-3"
            >
              Show less
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
