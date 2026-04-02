"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NavbarProps {
  onSearch: (query: string) => void;
  onReset?: () => void;
}

interface UserResult {
  id: number;
  name: string;
  profile_picture: string | null;
}

export default function Navbar({ onSearch, onReset }: NavbarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  // User search dropdown
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (onSearch) {
      const delay = setTimeout(() => { onSearch(query); }, 500);
      return () => clearTimeout(delay);
    }
  }, [query, onSearch]);

  // User search with debounce
  useEffect(() => {
    if (!userQuery.trim()) { setUserResults([]); return; }
    const delay = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(userQuery)}`);
        if (res.ok) setUserResults(await res.json());
      } finally {
        setSearchingUsers(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [userQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserSearch(false);
        setUserQuery("");
        setUserResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const getUserInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <nav className="bg-gray-950/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            onClick={() => { sessionStorage.setItem("gamesPage", "1"); setQuery(""); onReset?.(); }}
            className="text-white text-xl font-bold tracking-widest hover:text-gray-300 transition"
          >
            GAMEHUB
          </Link>

          <div className="w-80 ml-30">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍︎ Search games..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-full px-5 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <>
                {/* User search dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setShowUserSearch((v) => !v)}
                    className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-gray-800"
                    title="Find Users"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {showUserSearch && (
                    <div className="absolute right-0 top-12 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-3 border-b border-gray-800">
                        <input
                          autoFocus
                          type="text"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Search users..."
                          className="w-full bg-gray-800 text-white text-sm px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-gray-500 placeholder-gray-500"
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {searchingUsers && (
                          <p className="text-gray-500 text-xs text-center py-4">Searching...</p>
                        )}
                        {!searchingUsers && userQuery && userResults.length === 0 && (
                          <p className="text-gray-500 text-xs text-center py-4">No users found</p>
                        )}
                        {!searchingUsers && !userQuery && (
                          <p className="text-gray-600 text-xs text-center py-4">Type a name to search</p>
                        )}
                        {userResults.map((u) => (
                          <Link
                            key={u.id}
                            href={`/users/${u.id}`}
                            onClick={() => { setShowUserSearch(false); setUserQuery(""); setUserResults([]); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                          >
                            {u.profile_picture ? (
                              <img src={u.profile_picture} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-700" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-bold">{getUserInitials(u.name)}</span>
                              </div>
                            )}
                            <span className="text-white text-sm">{u.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-gray-400 text-sm">Hi, {user.name.split(" ")[0]}</span>

                <Link href="/profile">
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-gray-600 hover:border-white transition cursor-pointer" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-gray-600 hover:border-white transition cursor-pointer">
                      <span className="text-white text-xs font-bold">
                        {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <button className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-full transition">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-white text-gray-900 hover:bg-gray-200 text-sm font-semibold px-4 py-2 rounded-full transition">
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
