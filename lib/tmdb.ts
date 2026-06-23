
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

// Server actions moved to app/actions/tmdb.ts

export function getPosterUrl(path?: string | null) {
    if (!path) return "";
    return `https://image.tmdb.org/t/p/w500${path}`;
}

export function getDirectorName(details: TMDBMovieDetails): string {
    const director = details.credits?.crew?.find(person => person.job === "Director");
    return director ? director.name : "Unknown Director";
}
