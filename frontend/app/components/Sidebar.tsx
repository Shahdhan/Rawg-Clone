"use client";

interface SidebarProps {
  onPlatformClick: (platform: string) => void;
  onGenreClick: (genre: string) => void;
  activePlatform: string;
  activeGenre: string;
}

const platforms = [
  { id: "187", name: "PlayStation 5" },
  { id: "18", name: "PlayStation 4" },
  { id: "4", name: "PC" },
  { id: "1", name: "Xbox One" },
  { id: "186", name: "Xbox Series S/X" },
  { id: "3", name: "iOS" },
  { id: "21", name: "Android" },
  { id: "7", name: "Nintendo Switch" },
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
];

export default function Sidebar({
  onPlatformClick,
  onGenreClick,
  activePlatform,
  activeGenre,
}: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen p-6 border-r border-gray-800 shrink-0">
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4 py-2 uppercase tracking-wider text-sm">
          Platforms
        </h3>
        <ul className="space-y-1">
          {platforms.map((p) => (
            <li key={p.id}>
              <button
                onClick={() =>
                  onPlatformClick(activePlatform === p.id ? "" : p.id)
                }
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
      </div>
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4 py-2 uppercase tracking-wider text-sm">
          Genres
        </h3>
        <ul className="space-y-1">
          {genres.map((g) => (
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
      </div>
    </aside>
  );
}
