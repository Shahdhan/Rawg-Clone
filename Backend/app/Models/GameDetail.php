<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameDetail extends Model
{
    protected $fillable = [
        'game_id', 
        'summary', 
        'system_requirements', 
        'recommended_requirements'
    ];
    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
