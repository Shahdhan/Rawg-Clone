const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Game {
  id: number;
  slug: string;
  title: string;
  release_date: string;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic?: number;
  playtime: number;
  platforms?: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  genres?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  esrb_rating?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GamesResponse {
  data: Game[];
  last_page: number;
  total: number;
}

export async function fetchGames(filters?: {
  ordering?: string;
  platform?: string;
  genre?: string;
  search?: string;
  page?: number;
}): Promise<{ data: Game[]; lastPage: number; total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));

    const queryString = params.toString();
    const url = `${API_URL}/api/games${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    return {
      data: data.data || [],
      lastPage: data.last_page || 1,
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { data: [], lastPage: 1, total: 0 };
  }
}

export async function fetchGame(id: string): Promise<Game | null> {
  try {
    const response = await fetch(`${API_URL}/api/games/${id}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return response.json();
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}