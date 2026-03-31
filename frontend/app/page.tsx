"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import OrderFilter from "./components/OrderFilter";
import Sidebar from "./components/Sidebar";
import GameCard from "./components/GameCard";
import { fetchGames, Game } from "./lib/api";
import Recommendations from "./components/Recommendations";
import Loading from "./components/Loading";

export default function Home() {
  const [ordering, setOrdering] = useState("");
  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = sessionStorage.getItem("gamesPage");
    return saved ? parseInt(saved) : 1;
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const prevFilters = useRef({ ordering, platform, genre, search });

  const fetchFavoriteIds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/favorites`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setFavoriteIds(new Set(data.map((f: any) => f.game_id))))
      .catch(() => {});
  };

  useEffect(() => {
    fetchFavoriteIds();
  }, []);

  useEffect(() => {
    sessionStorage.setItem("gamesPage", String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    const prev = prevFilters.current;
    const changed =
      prev.ordering !== ordering ||
      prev.platform !== platform ||
      prev.genre !== genre ||
      prev.search !== search;
    prevFilters.current = { ordering, platform, genre, search };
    if (changed) {
      setCurrentPage(1);
      sessionStorage.setItem("gamesPage", "1");
    }
  }, [ordering, platform, genre, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["games", ordering, platform, genre, search, currentPage],
    queryFn: () =>
      fetchGames({ ordering, platform, genre, search, page: currentPage }),
    staleTime: 5 * 60 * 1000,
  });

  const games = data?.data || [];
  const lastPage = data?.lastPage || 1;
  const total = data?.total || 0;

  useEffect(() => {
    if (currentPage < lastPage) {
      queryClient.prefetchQuery({
        queryKey: ["games", ordering, platform, genre, search, currentPage + 1],
        queryFn: () =>
          fetchGames({
            ordering,
            platform,
            genre,
            search,
            page: currentPage + 1,
          }),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [currentPage, lastPage, ordering, platform, genre, search, queryClient]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar
        onSearch={(q) => {
          setSearch(q);
        }}
        onReset={() => {
          setSearch("");
          setOrdering("");
          setPlatform("");
          setGenre("");
          setCurrentPage(1);
        }}
      />

      {isLoading && <Loading />}

      <div className="flex">
        <Sidebar
          onPlatformClick={setPlatform}
          onGenreClick={setGenre}
          activePlatform={platform}
          activeGenre={genre}
        />

        <main className="flex-1 p-8">
          {search ? (
            <h1 className="text-white text-5xl mb-8">
              Search Results for &ldquo;{search}&rdquo;
            </h1>
          ) : (
            <>
              <h1 className="text-white text-5xl mb-4">Recommended For You</h1>
              <Recommendations platform={platform} genre={genre} />
              <h1 className="text-white text-5xl mb-8 mt-8">Featured Games</h1>
            </>
          )}

          <OrderFilter
            onOrderChange={setOrdering}
            onPlatformChange={setPlatform}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-900 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-3 bg-gray-800 rounded w-16" />
                      <div className="h-3 bg-gray-800 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : games && games.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    favoriteIds={favoriteIds}
                    onFavoriteChange={fetchFavoriteIds}
                  />
                ))}
              </div>

              {/* ✅ Pagination controls */}
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>

                <span className="text-gray-400">
                  Page {currentPage} of {lastPage}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, lastPage))
                  }
                  disabled={currentPage === lastPage}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>

              <p className="text-center text-gray-500 mt-2 text-sm">
                Showing {games.length} of {total} games
              </p>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl mb-4">No games found</p>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
