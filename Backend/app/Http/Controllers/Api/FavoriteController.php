<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites =$request->user()->favorites()->with('game')->get();
        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|integer',
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_id'=>$request->user()->id,
            'game_id' =>$request->game_id,
        ]);

        return response()->json([
            'message' => 'Game Added to favorites',
            'favorite' =>$favorite,
        ],201);
    }

    public function destroy(Request $request, $game_id)
    {
        $favorite = Favorite::where('user_id', $request->user()->id)
            ->where('game_id', $game_id)
            ->first();

        if (!$favorite) {
            return response()->json([
                'error' => 'Favorite not found'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Game removed from favorites'
        ]);
    }
}
