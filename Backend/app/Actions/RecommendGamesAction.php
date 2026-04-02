<?php

namespace App\Actions;

use App\Models\Favorite;
use App\Models\Game;


class RecommendGamesAction
{
    public function execute($user, $platform = null, $genre = null): array
    {
        // Get all favorites with game genres loaded once
        $allFavorites = Favorite::where('user_id', $user->id)->with('game.genres')->get();

        // Rank genres by how many favorites belong to each
        $favoriteGenreIds = $allFavorites
            ->flatMap(fn($f) => $f->game->genres->pluck('id'))
            ->countBy()
            ->sortDesc();

        $favoritedGameIds = $allFavorites->pluck('game_id');
        $totalScore       = $favoriteGenreIds->sum();

        // If genre filter is active, use it; otherwise use top genre from favorites
        $targetGenreId = $genre ?: ($favoriteGenreIds->isEmpty() ? null : $favoriteGenreIds->keys()->first());

        // No favorites and no genre filter — return most popular (filtered by platform)
        if ($favoriteGenreIds->isEmpty() && !$genre) {
            $games = Game::with('genres')
                ->when($platform, fn($q) => $q->whereHas('platforms', fn($pq) => $pq->where('platforms.id', $platform)))
                ->orderBy('rating', 'desc')
                ->limit(10)
                ->get();

            return $games->map(fn($game) => [
                'game'        => $game,
                'explanation' => 'Popular Games You Might Enjoy',
                'match'       => null,
            ])->toArray();
        }

        // Find a favorited game that belongs to the target genre (for explanation text)
        $topFavGame = $allFavorites->first(
            fn($f) => $f->game->genres->pluck('id')->contains($targetGenreId)
        );

        $games = Game::with('genres')
            ->when($platform, fn($q) => $q->whereHas('platforms', fn($pq) => $pq->where('platforms.id', $platform)))
            ->when($targetGenreId, fn($q) => $q->whereHas('genres', fn($gq) => $gq->where('genres.id', $targetGenreId)))
            ->whereNotIn('id', $favoritedGameIds)
            ->orderBy('rating', 'desc')
            ->limit(10)
            ->get();

        // Fallback if nothing found — popular games filtered by platform only
        if ($games->isEmpty()) {
            $games = Game::with('genres')
                ->when($platform, fn($q) => $q->whereHas('platforms', fn($pq) => $pq->where('platforms.id', $platform)))
                ->orderBy('rating', 'desc')
                ->limit(10)
                ->get();

            return $games->map(fn($game) => [
                'game'        => $game,
                'explanation' => 'Popular Games You Might Enjoy',
                'match'       => null,
            ])->toArray();
        }

        $explanationGame = $topFavGame?->game->title ?? 'your favorites';
        $hasFavorites    = $favoriteGenreIds->isNotEmpty();

        return $games->map(function ($game) use ($favoriteGenreIds, $totalScore, $explanationGame, $hasFavorites) {
            $gameScore = $game->genres->pluck('id')->sum(fn($id) => $favoriteGenreIds->get($id, 0));
            $match     = ($hasFavorites && $totalScore > 0) ? (int) round(($gameScore / $totalScore) * 100) : null;

            return [
                'game'        => $game,
                'explanation' => $hasFavorites ? "Because you love {$explanationGame}" : 'Popular Games You Might Enjoy',
                'match'       => $match,
            ];
        })->toArray();
    }
}
