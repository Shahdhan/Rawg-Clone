"use client";

import Dropdown from "./Dropdown";

interface OrderFilterProps {
  onOrderChange: (ordering: string) => void;
  onPlatformChange: (platform: string) => void;
}

export default function OrderFilter({ onOrderChange, onPlatformChange }: OrderFilterProps) {
  const orderOptions = [
    { value: "relevant", label: "Relevant" },
    { value: "-rating", label: "Popular" },
    { value: "rating", label: "Least Popular" },
    { value: "title", label: "Name: A - Z" },
    { value: "-title", label: "Name: Z - A" },
    { value: "-release_date", label: "Newest First" },
    { value: "release_date", label: "Oldest First" },
  ];

  const platformOptions = [
    { value: "", label: "All Platforms" },
    { value: "187", label: "PlayStation 5" },
    { value: "18", label: "PlayStation 4" },
    { value: "4", label: "PC" },
    { value: "1", label: "Xbox One" },
    { value: "186", label: "Xbox Series S/X" },
    { value: "3", label: "iOS" },
    { value: "21", label: "Android" },
    { value: "6", label: "Linux" },
    { value: "7", label: "Nintendo Switch" },
  ];

  return (
    <div className="flex items-center gap-3 mb-6 mt-4">
      <Dropdown options={orderOptions} onChange={onOrderChange} defaultLabel="Sort: Popular" />
      <Dropdown options={platformOptions} onChange={onPlatformChange} defaultLabel="All Platforms" />
    </div>
  );
}
