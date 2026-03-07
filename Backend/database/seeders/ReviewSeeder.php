<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Game;
use App\Models\User;
use App\Models\Review;


class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first(); // or create a user manually
        $game = Game::first();

        Review::create([
            'user_id' => $user->id,
            'game_id' => $game->id,
            'rating' => 5,
            'comment' => 'Amazing game!',
            ]);
    }
}
