import Link from "next/link";
import { Game } from "../lib/api";

interface GameCardProbs {
  game: Game;
}

export default function GameCard({ game }: GameCardProbs) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer">
        {/* Game Image */}
        <div className="relative h-48 w-full bg-gray-700">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}

          {/* Rating Badge */}
          {game.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-yellow-400 font-bold">
                ★ {game.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="p-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
            {game.title}
          </h3>

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
        </div>
      </div>
    </Link>
  );
}
