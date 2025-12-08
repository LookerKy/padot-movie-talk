
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Medium size for posters

if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY is not set in environment variables.");
}

export type TMDBMovieSearchResult = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
};

export type TMDBMovieDetails = {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    credits: {
        crew: {
            job: string;
            name: string;
        }[];
    };
};

export async function searchMovies(query: string): Promise<TMDBMovieSearchResult[]> {
    if (!query) return [];

    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=ko-KR&api_key=${TMDB_API_KEY}`);

    if (!res.ok) {
        throw new Error(`TMDB API Error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.results || [];
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails | null> {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?append_to_response=credits&language=ko-KR&api_key=${TMDB_API_KEY}`);

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`TMDB API Error: ${res.statusText}`);
    }

    return res.json();
}

export function getPosterUrl(path: string | null) {
    if (!path) return "/placeholder-poster.png"; // You might want a better placeholder
    return `${TMDB_IMAGE_BASE_URL}${path}`;
}

export function getDirectorName(details: TMDBMovieDetails): string {
    const director = details.credits?.crew?.find(person => person.job === "Director");
    return director ? director.name : "Unknown Director";
}
