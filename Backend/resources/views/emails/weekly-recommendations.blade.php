<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #030712;
            color: #ffffff;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            padding: 30px 0;
        }

        .header h1 {
            color: #ffffff;
            font-size: 28px;
        }

        .game-card {
            background-color: #1f2937;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
        }

        .game-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }

        .game-info {
            padding: 16px;
        }

        .game-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .game-rating {
            color: #facc15;
            margin-bottom: 8px;
        }

        .game-explanation {
            color: #9ca3af;
            font-style: italic;
            font-size: 14px;
        }

        .unsubscribe {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 12px;
        }

        .unsubscribe a {
            color: #6b7280;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Your Weekly Game Recommendations</h1>
            <p>Hey {{ $user->name }}, here are your personalized picks this week!</p>
        </div>

        @foreach($recommendations as $rec)
            <div class="game-card">
                @if($rec['game']['background_image'])
                    <img src="{{ $rec['game']['background_image'] }}" alt="{{ $rec['game']['title'] }}" class="game-image">
                @endif
                <div class="game-info">
                    <div class="game-title">{{ $rec['game']['title'] }}</div>
                    <div class="game-rating">⭐ {{ $rec['game']['rating'] }}/10</div>
                    <div class="game-explanation">{{ $rec['explanation'] }}</div>
                </div>
            </div>
        @endforeach

        <div class="unsubscribe">
            <p>Don't want these emails? <a href="{{ url('/api/unsubscribe/' . $user->id) }}">Unsubscribe</a></p>
        </div>
    </div>
</body>

</html>