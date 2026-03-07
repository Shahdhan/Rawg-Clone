<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
