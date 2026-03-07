"use client";

interface OrderFilterProps {
  onOrderChange: (ordering: string) => void;
  onPlatformChange: (platform: string) => void;
}

export default function OrderFilter({
  onOrderChange,
  onPlatformChange,
}: OrderFilterProps) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-4">
      <div className="flex items-center gap-2">
        <label className="text-gray-500">Order By</label>
        <select
          onChange={(e) => onOrderChange(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-gray-600"
        >
          <option value="">Relevence</option>
          <option value="-added">Date</option>
          <option value="name">Name</option>
          <option value="-released">Release</option>
          <option value="-metacritic">Popularity</option>
          <option value="-rating">Rating</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-500">Platform</label>
        <select
          onChange={(e) => onPlatformChange(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-gray-600"
        >
          <option value="">All Platforms</option>
          <option value="187">PlayStation 5</option>
          <option value="18">PlayStation 4</option>
          <option value="4">PC</option>
          <option value="1">Xbox One</option>
          <option value="186">Xbox Series S/X</option>
          <option value="3">iOS</option>
          <option value="21">Android</option>
          <option value="6">Linux</option>
          <option value="7">Nintendo Switch</option>
        </select>
      </div>
    </div>
  );
}
