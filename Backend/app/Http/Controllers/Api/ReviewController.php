<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($gameId)
    {
        $reviews = Review::where('game_id', $gameId)->with('user')->get();
        return response()->json($reviews);
    }



    public function store(Request $request){
        $validated= $request->validate([
            'game_id' => 'required|exists:games,id',
            'rating' => 'required|integer|min:1|max:10',
            "comment" => 'required|string',
        ]);

        $review = $request->user()->reviews()->create($validated);

        return response()->json($review,201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'rating' => 'integer|min:1|max:10',
            'comment' => 'string',
        ]);


        $review->update($request->only(['rating','comment']));
        return response()->json($review);
    }


    public function destroy($id)
    {
        

        $review = Review::findOrFail($id);

        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review-> delete();

        return response()->json(['message' => 'Review delete']);
    }
}
