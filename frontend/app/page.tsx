"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import OrderFilter from "./components/OrderFilter";
import Sidebar from "./components/Sidebar";
import GameCard from "./components/GameCard";
import { fetchGames, Game } from "./lib/api";

export default function Home() {
  const [ordering, setOrdering] = useState("");
  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [ordering, platform, genre, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["games", ordering, platform, genre, search, currentPage],
    queryFn: () =>
      fetchGames({ ordering, platform, genre, search, page: currentPage }),
  });

  const games = data?.data || [];
  const lastPage = data?.lastPage || 1;
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onSearch={setSearch} />

      <div className="flex">
        <Sidebar
          onPlatformClick={setPlatform}
          onGenreClick={setGenre}
          activePlatform={platform}
          activeGenre={genre}
        />

        <main className="flex-1 p-8">
          <h1 className="text-white text-5xl mb-8">
            {search ? `Search Results for "${search}"` : "Featured Games"}
          </h1>

          <OrderFilter
            onOrderChange={setOrdering}
            onPlatformChange={setPlatform}
          />

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Loading games...</p>
            </div>
          ) : games && games.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
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
