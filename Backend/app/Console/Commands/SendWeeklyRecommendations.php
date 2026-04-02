<?php

namespace App\Console\Commands;

use App\Mail\WeeklyRecommendationMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendWeeklyRecommendations extends Command
{
    protected $signature = 'recommendations:send-weekly';
    protected $description = 'Send weekly game recommendations to all users';

    public function handle()
    {
        $users = User::where('unsubscribed', false)
            ->whereNotNull('email')
            ->get();

        foreach ($users as $user) {
            Mail::to($user->email)->send(new WeeklyRecommendationMail($user));
            $this->info("Sent to {$user->email}");
            sleep(2);
        }

        $this->info('Weekly recommendations sent successfully!');
    }
}