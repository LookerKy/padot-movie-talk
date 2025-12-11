"use client";

import { useState, useCallback } from "react";
import { searchMovies } from "@/app/actions/tmdb";
import { checkReviewExists } from "@/app/actions/review";
import { TMDBMovieSearchResult } from "@/lib/tmdb";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, Search, Calendar } from "lucide-react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";



interface MovieSearchProps {
    onSelect: (movie: TMDBMovieSearchResult) => void;
    onManualRegister?: () => void;
}

export function MovieSearch({ onSelect, onManualRegister }: MovieSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<TMDBMovieSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Duplicate Warning Modal State
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [duplicateMovieTitle, setDuplicateMovieTitle] = useState("");

    const handleSelectMovie = async (movie: TMDBMovieSearchResult) => {
        const check = await checkReviewExists(movie.id);
        if (check.exists) {
            setDuplicateMovieTitle(movie.title);
            setIsDuplicateModalOpen(true);
            return;
        }
        onSelect(movie);
    };

    const handleSearch = async (term: string) => {
        if (!term.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const results = await searchMovies(term);
            setResults(results);
        } catch (error) {
            console.error("검색 실패:", error);
            setResults([]);
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };



    // Better hook usage or just simple timer in change
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (timer) clearTimeout(timer);

        if (val.trim()) {
            const newTimer = setTimeout(() => handleSearch(val), 500);
            setTimer(newTimer);
        } else {
            setResults([]);
            setHasSearched(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    어떤 영화를 보셨나요?
                </h2>
                <p className="text-muted-foreground">리뷰를 남길 영화를 검색해주세요.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="영화 제목 검색..."
                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
                    autoFocus
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                )}
            </div>

            <div className="grid gap-4">
                {results.length > 0 ? (
                    results.map((movie) => (
                        <GlassCard
                            key={movie.id}
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleSelectMovie(movie)}
                        >
                            <div className="relative w-16 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                                {movie.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                        alt={movie.title}
                                        fill
                                        sizes="100px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-foreground truncate">{movie.title}</h3>
                                {movie.release_date && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Calendar size={14} />
                                        {movie.release_date.split("-")[0]}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{movie.overview}</p>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    hasSearched && query && !loading && (
                        <div className="text-center py-10 space-y-4">
                            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                            <button
                                onClick={onManualRegister}
                                className="text-primary hover:text-primary/80 underline underline-offset-4 text-sm transition-colors"
                            >
                                직접 등록하러 가기
                            </button>
                        </div>
                    )
                )}
            </div>


            <Modal
                isOpen={isDuplicateModalOpen}
                onClose={() => setIsDuplicateModalOpen(false)}
                title="이미 등록된 영화입니다"
                description={`'${duplicateMovieTitle}' 영화는 이미 리뷰를 작성하셨습니다.`}
            >
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => setIsDuplicateModalOpen(false)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </Modal>
        </div >
    );
}
