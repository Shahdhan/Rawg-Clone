<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function follow(Request $request, $userId)
    {
        $follower = $request->user();

        if ($follower->id == $userId) {
            return response()->json(['message' => 'Cannot follow yourself'], 400);
        }

        Follow::firstOrCreate([
            'follower_id'  => $follower->id,
            'following_id' => $userId,
        ]);

        return response()->json(['message' => 'Followed']);
    }

    public function unfollow(Request $request, $userId)
    {
        Follow::where('follower_id', $request->user()->id)
            ->where('following_id', $userId)
            ->delete();

        return response()->json(['message' => 'Unfollowed']);
    }

    public function search(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen($q) < 1) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$q}%")
            ->select('id', 'name', 'profile_picture')
            ->limit(10)
            ->get();

        return response()->json($users);
    }

    public function publicProfile(Request $request, $userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $followersCount = 0;
        $followingCount = 0;
        $isFollowing    = false;

        try {
            $followersCount = Follow::where('following_id', $userId)->count();
            $followingCount = Follow::where('follower_id', $userId)->count();
            $authUser       = Auth::guard('sanctum')->user();
            if ($authUser) {
                $isFollowing = Follow::where('follower_id', $authUser->id)
                    ->where('following_id', $userId)
                    ->exists();
            }
        } catch (\Throwable $e) {
            // follows table may not exist yet
        }

        return response()->json([
            'id'              => $user->id,
            'name'            => $user->name,
            'bio'             => $user->bio,
            'profile_picture' => $user->profile_picture,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'is_following'    => $isFollowing,
        ]);
    }
}
