<?php

namespace App\Http\Controllers\Api;


use App\Actions\RecommendGamesAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;



class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $user     = $request->user();
        $platform = $request->query('platform');
        $genre    = $request->query('genre');
        $recommendations = (new RecommendGamesAction)->execute($user, $platform, $genre);
        return response()->json($recommendations);
    }
}