"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  onChange: (value: string) => void;
  defaultLabel: string;
}

export default function Dropdown({ options, onChange, defaultLabel }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-full px-4 py-2 hover:border-gray-400 transition"
      >
        <span>{selected ? selected.label : defaultLabel}</span>
        <span className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl shadow-black/50 min-w-[160px]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-800 ${
                selected?.value === option.value
                  ? "text-white font-semibold bg-gray-800"
                  : "text-gray-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
