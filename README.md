# 🎮 Game Discovery Platform

A full-stack game discovery platform built with Laravel and Next.js, powered by the RAWG Video Games API.

---

## Tech Stack

**Backend:** Laravel 11, MySQL, Laravel Sanctum  
**Frontend:** Next.js 15, TypeScript, Tailwind CSS, TanStack Query  
**API:** RAWG Video Games Database

---

## Features

- Browse 600+ games fetched from the RAWG API
- Filter games by genre and platform
- Search games by title
- Sort by title, rating, or release date
- Pagination
- User authentication (register, login, logout)
- Add / remove games from favorites
- Write, edit, and delete reviews
- User profile with picture upload

---

## Database Relationships

- **One-To-One:** Game → GameDetail
- **One-To-Many:** Game → Reviews, User → Reviews, User → Favorites
- **Many-To-Many:** Games ↔ Genres, Games ↔ Platforms

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL

---

### Backend Setup

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:

```env
DB_DATABASE=game_platform
DB_USERNAME=root
DB_PASSWORD=your_password
```

Run migrations and seed the database:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve
```

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/games | List all games (filter, search, paginate) | No |
| GET | /api/games/{id} | Get game details | No |
| GET | /api/games/{id}/reviews | Get reviews for a game | No |
| POST | /api/register | Register a new user | No |
| POST | /api/login | Login | No |
| POST | /api/logout | Logout | Yes |
| GET | /api/favorites | Get user favorites | Yes |
| POST | /api/favorites | Add to favorites | Yes |
| DELETE | /api/favorites/{game_id} | Remove from favorites | Yes |
| POST | /api/reviews | Create a review | Yes |
| PUT | /api/reviews/{id} | Update a review | Yes |
| DELETE | /api/reviews/{id} | Delete a review | Yes |
| PUT | /api/profile | Update profile | Yes |
| POST | /api/profile/picture | Upload profile picture | Yes |

---

## Project Structure

```
Backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── GameController.php
│   │   ├── ReviewController.php
│   │   ├── FavoriteController.php
│   │   └── ProfileController.php
│   └── Models/
│       ├── Game.php
│       ├── GameDetail.php
│       ├── Genre.php
│       ├── Platform.php
│       ├── Favorite.php
│       └── User.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── GameSeeder.php
└── routes/api.php

frontend/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── GameCard.tsx
│   │   ├── OrderFilter.tsx
│   │   └── ReviewSection.tsx
│   ├── lib/api.ts
│   ├── games/[id]/page.tsx
│   ├── profile/page.tsx
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   └── page.tsx
```

---

## Environment Variables

### Backend (.env)
```env
APP_NAME=GamePlatform
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=game_platform
RAWG_API_KEY=your_rawg_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
