<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::with(['genres', 'platforms']);


        if ($request->query('genre')) {
            $query->whereHas('genres', function ($q) use ($request) {
                $q->where('rawg_id', $request->query('genre'));
            });
        }

    
        if ($request->query('platform')) {
            $query->whereHas('platforms', function ($q) use ($request) {
                $q->where('rawg_id', $request->query('platform'));
            });
        }

    
        if ($request->query('search')) {
            $query->where('title', 'like', '%' . $request->query('search') . '%');
        }


        if ($request->query('ordering')) {
            $ordering = $request->query('ordering');
            $direction = str_starts_with($ordering, '-') ? 'desc' : 'asc';
            $column = ltrim($ordering, '-');

            $validColumns = ['title', 'rating', 'release_date'];
            if (in_array($column, $validColumns)) {
                $query->orderBy($column, $direction);
            }
        }


        $games = $query->paginate(40);

        return response()->json($games);
    }

    public function show($id)
    {
        $game = Game::with(['detail', 'genres', 'platforms'])->find($id);

        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        return response()->json($game);
    }
}