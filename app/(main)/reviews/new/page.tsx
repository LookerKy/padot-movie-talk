"use client";

import { useState } from "react";
import { MovieSearch } from "@/components/reviews/movie-search";
import { ReviewForm } from "@/components/reviews/review-form";
import { TMDBMovieSearchResult } from "@/lib/tmdb";

export default function NewReviewPage() {
    const [selectedMovie, setSelectedMovie] = useState<TMDBMovieSearchResult | null>(null);

    return (
        <div className="container mx-auto px-4 py-20 max-w-3xl">
            {!selectedMovie ? (
                <MovieSearch onSelect={setSelectedMovie} />
            ) : (
                <ReviewForm
                    movie={selectedMovie}
                    onCancel={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
}
