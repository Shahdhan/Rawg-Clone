<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;


//API endpoint #1
Route::get('/test', function(){
    return response()->json([
        'message' => 'Hello from laravel',
        'status' => 'success',
    ]);
});



//Games
Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{id}', [GameController::class, 'show']);

Route::get('/games/{gameId}/reviews', [ReviewController::class, 'index']);



//Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',[AuthController::class, 'login']);


//Routes that can be accessed after login

Route::middleware('auth:sanctum')->group(function(){
    Route::post('logout',[AuthController::class, 'logout']);



    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/picture', [ProfileController::class, 'updatePicture']);
    Route::get('/users/{userId}/reviews', [ProfileController::class, 'getUserReviews']);


    Route::post('/reviews',[ReviewController::class, 'store']);
    Route::put('/reviews/{id}',[ReviewController::class, 'update']);
    Route::delete('/reviews/{id}',[ReviewController::class, 'destroy']);
    
    
    Route::get('/favorites',[FavoriteController::class, 'index']);
    Route::post('/favorites',[FavoriteController::class, 'store']);
    Route::delete('/favorites/{game_id}',[FavoriteController::class, 'destroy']);


});
