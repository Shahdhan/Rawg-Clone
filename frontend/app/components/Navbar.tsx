"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (onSearch) {
      const delay = setTimeout(() => {
        onSearch(query);
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [query, onSearch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 border-b ">
      <div className="max-w-1920px mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={140}
              height={40}
              style={{ height: "auto" }}
            />
          </Link>

          <div className="flex-1 mx-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for games"
              className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <p className="text-white">Hello {user.name}!</p>
                <Link href="/profile">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 hover:border-blue-500 transition cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-liner-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600 hover:border-blue-500 transition cursor-pointer">
                      <span className="text-white text-sm font-bold">
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <button className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
