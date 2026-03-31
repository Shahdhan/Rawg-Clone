<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\GameDetail;
use Illuminate\Database\Seeder;
use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;




class GameSeeder extends Seeder
{
        public function run(): void
    {

        $apiKey = config('services.rawg.key') ?? 'a69547cf7125409b8debf7637cff7948';

         $allGames = [];


        for ($page = 1; $page <= 25; $page++) {
        $response = Http::withoutVerifying()->get("https://api.rawg.io/api/games", [
            'key' => $apiKey,
            'page_size' => 40,
            'page' => $page,
        ]);

        if ($response->successful()) {
            $allGames = array_merge($allGames, $response->json()['results']);
            $this->command->info("Fetched page {$page}/25...");
        }
        }

        if ($response->successful()) {
            $games = $response->json()['results'];

            foreach ($allGames as $data) {
                // Fetch individual game detail to get description_raw
                $description = null;
                $detailResponse = Http::withoutVerifying()->get("https://api.rawg.io/api/games/{$data['id']}", [
                    'key' => $apiKey,
                ]);
                if ($detailResponse->successful()) {
                    $description = $detailResponse->json()['description_raw'] ?? null;
                }

                $game = Game::updateOrCreate(
                    ['rawg_id' => $data['id']],
                    [
                        'title' => $data['name'],
                        'slug' => $data['slug'] ?? Str::slug($data['name']),
                        'background_image' => $data['background_image'],
                        'description' => $description,
                        'rating' => $data['rating'],
                        'release_date' => $data['released'],
                    ]
                );

                if (!empty($data['genres'])) {
                    $genreIds = [];
                    foreach ($data['genres'] as $genreData) {
                        $genre = Genre::updateOrCreate(
                            ['rawg_id' => $genreData['id']],
                            [
                                'name' => $genreData['name'],
                                'slug' => $genreData['slug'],
                            ]
                        );
                        $genreIds[] = $genre->id;
                    }
                    $game->genres()->sync($genreIds);
                }

                if (!empty($data['platforms'])) {
                    $platformIds = [];
                    foreach ($data['platforms'] as $platformData) {
                        $platform = Platform::updateOrCreate(
                            ['rawg_id' => $platformData['platform']['id']],
                            [
                                'name' => $platformData['platform']['name'],
                                'slug' => $platformData['platform']['slug'],
                            ]
                        );
                        $platformIds[] = $platform->id;
                    }
                    $game->platforms()->sync($platformIds);
                }


            }
            $this->command->info('Games seeded successfully from RAWG!');
        } else {
            $this->command->error('Failed to fetch data from RAWG API.');
        }
    }
}

