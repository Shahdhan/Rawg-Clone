"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Review {
  id: number;
  game_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  game?: { name: string };
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
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/signin");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditForm({ name: parsedUser.name, email: parsedUser.email });
      fetchUserReviews(parsedUser.id, token);
      fetchFavorites(token); // ✅ NEW
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

  // ✅ NEW: Fetch favorites
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
        <div className="flex items-center justify-center py-20">
          <p className="text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onSearch={() => {}} />

      <div className="max-w-4xl mx-auto p-8">
        {/* Profile Section */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                {user.profile_picture || picturePreview ? (
                  <img
                    src={picturePreview || user.profile_picture}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-700">
                    <span className="text-white text-4xl font-bold">
                      {getUserInitials(user.name)}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleUploadPicture}
                    disabled={uploadingPicture}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {uploadingPicture ? "Uploading..." : "Save Picture"}
                  </button>
                  <button
                    onClick={() => setPicturePreview("")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Name</label>
                    <p className="text-white text-xl font-semibold">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white text-xl">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition mt-4"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ✅ NEW: Favorites Section */}
        <div className="bg-gray-900 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Favorites</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              You haven't added any favorites yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-gray-800 rounded-lg overflow-hidden flex items-center gap-4 p-3"
                >
                  {fav.game?.background_image && (
                    <img
                      src={fav.game.background_image}
                      alt={fav.game.title}
                      className="w-20 h-14 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Link href={`/games/${fav.game_id}`}>
                      <p className="text-white font-semibold hover:text-blue-400 transition">
                        {fav.game?.title}
                      </p>
                    </Link>
                    {fav.game?.rating && (
                      <p className="text-yellow-400 text-sm">
                        ★ {fav.game.rating}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(fav.game_id)}
                    className="text-red-400 hover:text-red-300 text-sm px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              You haven't written any reviews yet.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-800 p-6 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-yellow-400 font-semibold">
                      ★ {review.rating}/10
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
