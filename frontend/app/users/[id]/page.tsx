"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Loading from "@/app/components/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);

    const userData = localStorage.getItem("user");
    if (userData) setCurrentUserId(JSON.parse(userData).id);

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_URL}/api/users/${id}/public`, { headers })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setProfile(data); setIsFollowing(data.is_following); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setFollowLoading(true);
    const method = isFollowing ? "DELETE" : "POST";
    const res = await fetch(`${API_URL}/api/users/${id}/follow`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setIsFollowing(!isFollowing);
      setProfile((p: any) => ({
        ...p,
        followers_count: p.followers_count + (isFollowing ? -1 : 1),
      }));
    }
    setFollowLoading(false);
  };

  const getUserInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) return <div className="min-h-screen bg-gray-950"><Navbar onSearch={() => {}} /><Loading /></div>;
  if (error) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onSearch={() => {}} />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">User not found.</p>
      </div>
    </div>
  );

  if (!profile) return null;

  const isOwnProfile = currentUserId === profile.id;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onSearch={() => {}} />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition mb-6">
          ← Back
        </Link>

        <div className="bg-gray-900 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-700 shrink-0">
                <span className="text-white text-3xl font-bold">{getUserInitials(profile.name)}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-white text-2xl font-bold">{profile.name}</h1>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`text-sm px-5 py-2 rounded-full font-semibold transition disabled:opacity-50 ${
                      isFollowing
                        ? "border border-gray-600 text-gray-400 hover:border-red-600 hover:text-red-400"
                        : "bg-white text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
                {isOwnProfile && (
                  <Link href="/profile" className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 rounded-full transition">
                    Edit Profile
                  </Link>
                )}
              </div>

              {profile.bio && <p className="text-gray-400 text-sm mb-4">{profile.bio}</p>}

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{profile.followers_count}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{profile.following_count}</p>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
