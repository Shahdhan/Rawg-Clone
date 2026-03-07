<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    protected $fillable = ['rawg_id', 'name', 'slug'];

    public function games()
    {
        return $this->belongsToMany(Game::class);
    }
}
