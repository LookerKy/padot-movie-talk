"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { MovieCard } from "@/components/movies/movie-card";
import { MovieListItem } from "@/components/movies/movie-list-item";
import { useReviewListStore } from "@/store/use-review-list-store";
import dynamic from "next/dynamic";
import { List, PlusCircle, Trophy, Star, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Review } from "@/lib/types";
import Link from "next/link";

const FilterToolbar = dynamic(
    () => import("@/components/reviews/filter-toolbar").then((mod) => mod.FilterToolbar),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 h-10">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="h-9 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                    <div className="h-9 w-20 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                    <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
                </div>
                <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
            </div>
        ),
    }
);

interface ReviewListViewProps {
    initialReviews: Review[];
    // Hybrid Filtering: Need totalCount to decide mode
    initialTotalCount?: number;
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
    };
}

export function ReviewListView({ initialReviews, initialTotalCount = 0, user }: ReviewListViewProps) {
    const {
        reviews,
        filters,
        hasMore,
        isLoading,
        loadMore,
        setFilter,
        reset,
        initialize
    } = useReviewListStore();

    const [availableTags, setAvailableTags] = useState<any[]>([]);

    // Collapsible state for rating groups in List View
    // Default all expanded. keys: "5", "4", etc.
    const [expandedRatings, setExpandedRatings] = useState<Record<number, boolean>>({
        5: true, 4: true, 3: true, 2: true, 1: true, 0: true
    });

    const toggleRatingGroup = (rating: number) => {
        setExpandedRatings(prev => ({ ...prev, [rating]: !prev[rating] }));
    };

    // Initialize with server data on first mount (if store empty)
    useEffect(() => {
        initialize(initialReviews, initialTotalCount || initialReviews.length);
    }, [initialReviews, initialTotalCount, initialize]);

    useEffect(() => {
        // Fetch tags for filter
        import("@/app/actions/review").then(({ getTagsAction }) => {
            getTagsAction().then(res => {
                if (res.success && res.tags) {
                    setAvailableTags(res.tags);
                }
            });
        });
    }, []);

    // Observer ref
    const observer = useRef<IntersectionObserver | null>(null);
    const lastReviewElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, loadMore]);

    // Group reviews by rating for List View
    const reviewsByRating = useMemo(() => {
        const groups: Record<number, Review[]> = {};
        reviews.forEach(review => {
            const r = Math.floor(review.rating); // Group by floor rating? or exact? Usually ranges like 4.0-4.9 -> 4
            // Let's assume we group by integer part of rating for simplicity and broader groups
            const key = Math.floor(review.rating);
            if (!groups[key]) groups[key] = [];
            groups[key].push(review);
        });
        return groups;
    }, [reviews]);

    // Sorted keys descending (5 -> 1)
    const sortedRatingKeys = Object.keys(reviewsByRating).map(Number).sort((a, b) => b - a);


    return (
        <div className="space-y-12 animate-fade-in pb-20 max-w-6xl mx-auto">
            {/* Header & Controls Section */}
            <div className="flex flex-col gap-6">

                {/* Title & Action Row */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-500 via-purple-500 to-pink-500 dark:from-padot-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm tracking-wide font-cookie">
                            송충이 어워즈
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                            페닷의 송충이 영화 리뷰 아카이브
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">

                    </div>
                </div>

                {/* Filter Toolbar Row - Separated from Content for better visual hierarchy */}
                <div className="sticky top-4 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-2 transition-all duration-300">
                    <FilterToolbar
                        tags={availableTags}
                        currentMinRating={filters.minRating}
                        currentTagIds={filters.tagIds}
                        isMustWatch={filters.isMustWatch}
                        viewMode={filters.viewMode}
                        onRatingChange={(rating) => setFilter("minRating", rating)}
                        onTagChange={(tagIds) => setFilter("tagIds", tagIds)}
                        onBadgeChange={(isMustWatch) => setFilter("isMustWatch", isMustWatch)}
                        onViewModeChange={(mode) => setFilter("viewMode", mode)}
                        onReset={reset}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* Grid View */}
                {filters.viewMode === "grid" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {reviews.map((review, index) => {
                            if (reviews.length === index + 1) {
                                return (
                                    <div ref={lastReviewElementRef} key={review.id}>
                                        <MovieCard review={review} />
                                    </div>
                                );
                            } else {
                                return <MovieCard key={review.id} review={review} />;
                            }
                        })}
                    </div>
                )}

                {/* List View (Grouped) */}
                {filters.viewMode === "list" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {sortedRatingKeys.map((rating) => {
                            const groupReviews = reviewsByRating[rating];
                            const isExpanded = expandedRatings[rating];

                            return (
                                <div key={rating} className="space-y-3">
                                    {/* Rating Header */}
                                    <button
                                        onClick={() => toggleRatingGroup(rating)}
                                        className="flex items-center gap-3 w-full text-left group select-none"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-padot-blue-500/10 text-padot-blue-600 dark:text-padot-blue-400 font-bold text-lg">
                                            {rating}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-cookie">
                                                {rating}점 영화들
                                            </h3>
                                            <span className="text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                {groupReviews.length}
                                            </span>
                                        </div>
                                        <div className={`h-px flex-1 bg-slate-200 dark:bg-slate-800 transition-colors group-hover:bg-padot-blue-200 dark:group-hover:bg-padot-blue-900`} />
                                        <div className="text-slate-400 transition-transform duration-300 transform group-hover:text-padot-blue-500" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Items */}
                                    <div
                                        className={`grid gap-3 overflow-hidden transition-all duration-300 ease-in-out p-2 -m-2 ${isExpanded ? 'opacity-100 mb-8' : 'opacity-0 h-0 m-0'}`}
                                    >
                                        {groupReviews.map((review: Review, index: number) => {
                                            // Handling last element ref logic within groups is tricky because visually last might be different.
                                            // Simple approach: attach ref to the absolute last element of the entire list.
                                            const isGlobalLast = reviews[reviews.length - 1].id === review.id;

                                            if (isGlobalLast) {
                                                return (
                                                    <div ref={lastReviewElementRef} key={review.id}>
                                                        <MovieListItem review={review} />
                                                    </div>
                                                )
                                            }
                                            return <MovieListItem key={review.id} review={review} />
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-padot-blue-500" size={40} />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            조건에 맞는 리뷰가 없습니다
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            필터를 변경하거나 새로운 리뷰를 등록해보세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
