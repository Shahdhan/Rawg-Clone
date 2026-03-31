"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Review {
  id: number;
  user_id: number;
  user?: { name: string };
  rating: number;
  comment: string;
}

interface Props {
  gameId: string;
}

export default function ReviewSection({ gameId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUsername(parsed.name);
      setUserId(parsed.id);
    }
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/games/${gameId}/reviews`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      }
    };

    fetchReviews();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          game_id: Number(gameId),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      const newReview = await res.json();
      setReviews([...reviews, newReview]);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      if (!res.ok) throw new Error("Failed to update review");

      const updated = await res.json();
      setReviews(reviews.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
    } catch (err) {
      console.error("Error updating review:", err);
      setError("Failed to update review.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review.");
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {error && (
        <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
            >
              ★
            </button>
          ))}
          <span className="text-gray-400 text-sm ml-2">({rating}/5)</span>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter Your Review"
          className="w-full p-2 bg-gray-800"
          required
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 px-6 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-800 p-4 rounded">
            {editingId === review.id ? (
              // ✅ Edit mode
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-gray-400 text-sm ml-2">
                    ({rating}/5)
                  </span>
                </div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(review.id)}
                    className="bg-green-600 px-4 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-600 px-4 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // ✅ View mode
              <>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{review.user?.name ?? "Unknown"}</h4>
                  {/* ✅ Only show edit/delete to review owner */}
                  {userId === review.user_id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(review.id);
                          setEditRating(review.rating);
                          setEditComment(review.comment);
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= review.rating ? "text-yellow-400" : "text-gray-600"}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-gray-400 text-xs ml-1">
                    ({review.rating}/5)
                  </span>
                </div>
                <p>Rating: {review.rating}/5</p>
                <p className="text-gray-400">{review.comment}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
