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
import { motion, AnimatePresence } from "framer-motion";

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


    // State to track how many items are visible per rating group
    const [visibleCounts, setVisibleCounts] = useState<Record<number, number>>({});
    const INITIAL_VISIBLE_COUNT = 6;
    const LOAD_MORE_INCREMENT = 12;

    const handleShowMore = (rating: number) => {
        setVisibleCounts(prev => ({
            ...prev,
            [rating]: (prev[rating] || INITIAL_VISIBLE_COUNT) + LOAD_MORE_INCREMENT
        }));
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 max-w-6xl mx-auto">
            {/* Header & Controls Section */}
            <div className="flex flex-col gap-6">

                {/* Title & Action Row */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-500 via-purple-500 to-pink-500 dark:from-padot-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm tracking-wide">
                            송충이 어워즈
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2 font-medium">
                            페닷의 송충이 영화 리뷰 아카이브
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">

                    </div>
                </div>

                {/* Filter Toolbar Row - Separated from Content for better visual hierarchy */}
                <div className="sticky top-4 z-40 bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm p-2 will-change-transform">
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
                                        <MovieCard review={review} priority={index < 4} />
                                    </div>
                                );
                            } else {
                                return <MovieCard key={review.id} review={review} priority={index < 4} />;
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
                            const visibleCount = visibleCounts[rating] || INITIAL_VISIBLE_COUNT;
                            const visibleReviews = groupReviews.slice(0, visibleCount);
                            const hasMoreInGroup = groupReviews.length > visibleCount;

                            return (
                                <div key={rating} className="space-y-3 bg-card/30 rounded-2xl p-2 transition-colors hover:bg-card/50">
                                    {/* Rating Header */}
                                    <button
                                        onClick={() => toggleRatingGroup(rating)}
                                        className="flex items-center gap-4 w-full text-left group select-none p-2 rounded-xl transition duration-300 hover:bg-white/5 active:scale-[0.99]"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className={cn(
                                                                i < rating ? "fill-yellow-400 text-yellow-400" : "fill-muted/20 text-muted-foreground/20"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md border border-border/50">
                                                    {groupReviews.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1" />

                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center bg-secondary/30 text-muted-foreground transition duration-300 group-hover:bg-secondary/60 group-hover:text-foreground",
                                                isExpanded && "rotate-180 bg-primary/10 text-primary group-hover:bg-primary/20"
                                            )}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Items */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{
                                                    height: "auto",
                                                    opacity: 1,
                                                    transition: {
                                                        height: {
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 30,
                                                            mass: 1
                                                        },
                                                        opacity: { duration: 0.2, delay: 0.1 }
                                                    }
                                                }}
                                                exit={{
                                                    height: 0,
                                                    opacity: 0,
                                                    transition: {
                                                        height: {
                                                            type: "tween",
                                                            duration: 0.3,
                                                            ease: "easeInOut"
                                                        },
                                                        opacity: { duration: 0.2 }
                                                    }
                                                }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid gap-3 pt-2 pb-4 px-2">
                                                    {visibleReviews.map((review: Review) => (
                                                        <MovieListItem key={review.id} review={review} />
                                                    ))}
                                                </div>

                                                {/* Show More Button */}
                                                {hasMoreInGroup && (
                                                    <div className="flex justify-center pb-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShowMore(rating);
                                                            }}
                                                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-secondary/50"
                                                        >
                                                            더 보기 ({groupReviews.length - visibleCount})
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && reviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                            조건에 맞는 리뷰가 없습니다
                        </h3>
                        <p className="text-muted-foreground">
                            필터를 변경하거나 새로운 리뷰를 등록해보세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
