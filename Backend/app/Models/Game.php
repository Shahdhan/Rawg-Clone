<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Genre;
use App\Models\Platform;

class Game extends Model
{
    protected $fillable = [
        'rawg_id', 
        'title', 
        'slug', 
        'background_image', 
        'description',
        'rating', 
        'release_date'
    ];

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class);
    }
    public function detail()
    {
        return $this->hasOne(GameDetail::class);
    }
    public function favoritedBy() 
    {
        return $this->belongsToMany(User::class, 'game_user');
    }
}