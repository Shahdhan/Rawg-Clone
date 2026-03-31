"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Review {
  id: number;
  game_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  game?: { title: string };
}

// ✅ NEW: Favorite interface
interface Favorite {
  id: number;
  game_id: number;
  game?: {
    id: number;
    title: string;
    background_image: string;
    rating: number;
  };
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", bio: "" });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/signin");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUnsubscribed(parsedUser.unsubscribed ?? false);
      setEditForm({
        name: parsedUser.name,
        email: parsedUser.email,
        bio: parsedUser.bio ?? "",
      });
      fetchUserReviews(parsedUser.id, token);
      fetchFavorites(token);
      fetchFollowStats(token);
    }
  }, [router]);

  const fetchUserReviews = async (userId: number, token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites", error);
    }
  };

  const fetchFollowStats = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/profile/stats`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (res.ok) setFollowStats(await res.json());
    } catch {}
  };

  // ✅ NEW: Remove from favorites
  const handleRemoveFavorite = async (gameId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/favorites/${gameId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.game_id !== gameId));
      }
    } catch (error) {
      console.error("Error removing favorite", error);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPicturePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPicture = async () => {
    if (!picturePreview) return;
    setUploadingPicture(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ profile_picture: picturePreview }),
      });
      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          profile_picture: data.user.profile_picture,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setPicturePreview("");
      }
    } catch (error) {
      alert("Error Uploading Image");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsEditing(false);
        alert("Profile updated!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleSubscriptionToggle = async () => {
    const endpoint = unsubscribed ? "subscribe" : "unsubscribe";
    const res = await fetch(`${API_URL}/api/${endpoint}/${user.id}`);
    if (res.ok) {
      const newState = !unsubscribed;
      setUnsubscribed(newState);
      const updatedUser = { ...user, unsubscribed: newState };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar onSearch={() => {}} />
        <Loading />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onSearch={() => {}} />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <span>←</span> Back
        </Link>
        {/* Profile Card */}
        <div className="bg-gray-900 rounded-2xl p-8">
          {/* Top row */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubscriptionToggle}
                className={`text-xs px-3 py-1.5 rounded-full transition border ${
                  unsubscribed
                    ? "border-green-600 text-green-400 hover:bg-green-900/30"
                    : "border-gray-600 text-gray-400 hover:bg-gray-800"
                }`}
              >
                {unsubscribed ? "Subscribe" : "Unsubscribe"}
              </button>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-full border border-red-700 text-red-400 hover:bg-red-900/30 transition"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex gap-8 items-start">
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="relative">
                {user.profile_picture || picturePreview ? (
                  <img
                    src={picturePreview || user.profile_picture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-700">
                    <span className="text-white text-3xl font-bold">
                      {getUserInitials(user.name)}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-1.5 rounded-full cursor-pointer transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="hidden"
                />
              </div>
              {picturePreview && (
                <div className="flex flex-col gap-1 w-24">
                  <button
                    onClick={handleUploadPicture}
                    disabled={uploadingPicture}
                    className="text-xs bg-green-700 hover:bg-green-600 text-white py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {uploadingPicture ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setPicturePreview("")}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Info / Edit form */}
            <div className="flex-1">
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Name
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {user.name}
                    </p>
                    <div className="flex gap-5 mt-2">
                      <span className="text-sm text-gray-300"><span className="font-bold text-white">{followStats.followers_count}</span> <span className="text-gray-500">Followers</span></span>
                      <span className="text-sm text-gray-300"><span className="font-bold text-white">{followStats.following_count}</span> <span className="text-gray-500">Following</span></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Email
                    </p>
                    <p className="text-gray-300">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                      Bio
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {user.bio || (
                        <span className="text-gray-600 italic">No bio yet</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-1.5 rounded-full transition"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      maxLength={300}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none resize-none text-sm"
                      placeholder="Tell others about yourself..."
                    />
                    <p className="text-gray-600 text-xs text-right mt-0.5">
                      {editForm.bio.length}/300
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="text-sm bg-white text-gray-900 font-semibold px-5 py-2 rounded-full hover:bg-gray-200 transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-sm text-gray-400 hover:text-white border border-gray-700 px-5 py-2 rounded-full transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-5">Favorites</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">
              No favorites yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 bg-gray-800 rounded-xl p-3"
                >
                  {fav.game?.background_image && (
                    <img
                      src={fav.game.background_image}
                      alt={fav.game.title}
                      className="w-16 h-11 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/games/${fav.game_id}`}>
                      <p className="text-white text-sm font-medium truncate hover:text-gray-300 transition">
                        {fav.game?.title}
                      </p>
                    </Link>
                    {fav.game?.rating && (
                      <p className="text-yellow-400 text-xs">
                        ★ {fav.game.rating}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(fav.game_id)}
                    className="text-gray-600 hover:text-red-400 transition text-lg shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-5">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">
              No reviews yet.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold truncate">
                      {review.game?.title ?? "Unknown Game"}
                    </span>
                    <span className="text-gray-600 text-xs shrink-0 ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-600"}`}>★</span>
                    ))}
                    <span className="text-gray-500 text-xs ml-1">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
