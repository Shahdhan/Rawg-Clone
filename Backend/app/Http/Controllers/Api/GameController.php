<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $query = Game::with(['genres']);


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
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhereHas('genres', fn($g) => $g->where('name', 'like', '%' . $search . '%'));
            });
        }


        if ($request->query('ordering')) {
            $ordering = $request->query('ordering');

            if ($ordering === 'relevant') {
                $query->orderByRaw('(SELECT COUNT(*) FROM favorites WHERE favorites.game_id = games.id) DESC')
                      ->orderBy('rating', 'desc');
            } else {
                $direction = str_starts_with($ordering, '-') ? 'desc' : 'asc';
                $column = ltrim($ordering, '-');

                $validColumns = ['title', 'rating', 'release_date'];
                if (in_array($column, $validColumns)) {
                    $query->orderBy($column, $direction);
                    if ($column !== 'rating') {
                        $query->orderBy('rating', 'desc');
                    }
                }
            }
        } else {
            $query->orderBy('rating', 'desc');
        }


        $cacheKey = 'games_' . md5(json_encode($request->query()));
        $games = Cache::remember($cacheKey, 300, fn() => $query->paginate(20));

        return response()->json($games);
    }

    public function similar($id)
    {
        $game = Game::with('genres')->find($id);
        if (!$game) {
            return response()->json([]);
        }

        $genreIds = $game->genres->pluck('id');

        $similar = Game::with(['genres', 'platforms'])
            ->whereHas('genres', fn($q) => $q->whereIn('genres.id', $genreIds))
            ->where('id', '!=', $id)
            ->inRandomOrder()
            ->limit(20)
            ->get();

        return response()->json($similar);
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