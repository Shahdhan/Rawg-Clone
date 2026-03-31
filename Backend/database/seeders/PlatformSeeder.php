<?php

namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platforms = [
            ['name' => 'PC',                'slug' => 'pc'],
            ['name' => 'PlayStation 5',     'slug' => 'playstation5'],
            ['name' => 'PlayStation 4',     'slug' => 'playstation4'],
            ['name' => 'PlayStation 3',     'slug' => 'playstation3'],
            ['name' => 'Xbox Series X/S',   'slug' => 'xbox-series-x'],
            ['name' => 'Xbox One',          'slug' => 'xbox-one'],
            ['name' => 'Xbox 360',          'slug' => 'xbox360'],
            ['name' => 'Nintendo Switch',   'slug' => 'nintendo-switch'],
            ['name' => 'Nintendo 3DS',      'slug' => 'nintendo-3ds'],
            ['name' => 'iOS',               'slug' => 'ios'],
            ['name' => 'Android',           'slug' => 'android'],
            ['name' => 'macOS',             'slug' => 'macos'],
            ['name' => 'Linux',             'slug' => 'linux'],
            ['name' => 'Web',               'slug' => 'web'],
        ];

        foreach($platforms as $platform){
            Platform::create($platform);
        }
    }
}
