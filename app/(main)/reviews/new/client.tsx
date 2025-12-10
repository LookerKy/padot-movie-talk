"use client";

import { useState } from "react";
import { MovieSearch } from "@/components/reviews/movie-search";
import { ReviewForm } from "@/components/reviews/review-form";
import { TMDBMovieSearchResult } from "@/lib/tmdb";

interface NewReviewClientProps {
    availableTags: { id: string; name: string }[];
}

export function NewReviewClient({ availableTags }: NewReviewClientProps) {
    const [selectedMovie, setSelectedMovie] = useState<TMDBMovieSearchResult | null>(null);
    const [isManualMode, setIsManualMode] = useState(false);

    return (
        <div className="container mx-auto px-4 py-20 max-w-3xl">
            {!selectedMovie && !isManualMode ? (
                <MovieSearch
                    onSelect={setSelectedMovie}
                    onManualRegister={() => setIsManualMode(true)}
                />
            ) : (
                <ReviewForm
                    movie={selectedMovie || undefined}
                    isManualMode={isManualMode}
                    availableTags={availableTags}
                    onCancel={() => {
                        setSelectedMovie(null);
                        setIsManualMode(false);
                    }}
                />
            )}
        </div>
    );
}
