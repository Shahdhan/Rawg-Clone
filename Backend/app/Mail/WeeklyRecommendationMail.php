<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Actions\RecommendGamesAction;

class WeeklyRecommendationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $recommendations;
    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->recommendations = (new RecommendGamesAction)->execute($user);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎮 Your Weekly Game Recommendations',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.weekly-recommendations',
        );
    }
}