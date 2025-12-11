import { create } from 'zustand';
import { Review } from '@/lib/types';
import { getReviewsAction } from '@/app/actions/review';

interface FilterState {
    minRating: number | null;
    tagIds: string[];
    isMustWatch: boolean;
    viewMode: 'grid' | 'list';
}

interface ReviewListState {
    // Filters
    filters: FilterState;

    // Data
    reviews: Review[];
    allReviews: Review[]; // Client-side cache (Master Data)
    filteredReviews: Review[]; // Client-side cache (Filtered Data for Pagination)

    // Pagination
    page: number;
    hasMore: boolean;
    isLoading: boolean;

    // Actions
    setFilter: (key: keyof FilterState, value: any) => void;
    loadMore: () => Promise<void>;
    reset: () => void;
    initialize: (initialReviews: Review[], totalCount: number) => void;
    refresh: () => Promise<void>;
}

export const useReviewListStore = create<ReviewListState>((set, get) => ({
    filters: {
        minRating: null,
        tagIds: [],
        isMustWatch: false,
        viewMode: 'grid',
    },
    reviews: [],
    allReviews: [],
    filteredReviews: [],
    page: 1,
    hasMore: true,
    isLoading: false,

    setFilter: (key, value) => {
        set((state) => ({
            filters: { ...state.filters, [key]: value }
        }));

        const { allReviews, filters } = get();

        // Client Mode: Filter in-memory & Paginate
        if (allReviews.length > 0) {
            set({ isLoading: true });

            setTimeout(() => {
                let filtered = [...allReviews];

                if (filters.minRating) {
                    filtered = filtered.filter(r => r.rating >= filters.minRating!);
                }
                if (filters.tagIds.length > 0) {
                    filtered = filtered.filter(r => r.tags.some(t => filters.tagIds.includes(t.id)));
                }
                if (filters.isMustWatch) {
                    filtered = filtered.filter(r => r.isMustWatch);
                }

                // Slice first batch (Client-Side Pagination)
                const limit = 12;
                const firstBatch = filtered.slice(0, limit);

                set({
                    filteredReviews: filtered, // Store full filtered list
                    reviews: firstBatch, // Render only first batch
                    hasMore: filtered.length > limit,
                    isLoading: false,
                    page: 1
                });
            }, 0);
            return;
        }

        // Server Mode (Fallback)
        get().isLoading = true;
        set({ reviews: [], page: 1, hasMore: true, isLoading: true });

        getReviewsAction({
            page: 1,
            limit: 12,
            minRating: filters.minRating,
            tagIds: filters.tagIds,
            isMustWatch: filters.isMustWatch
        }).then((res) => {
            if (res.success && res.reviews) {
                set({
                    reviews: res.reviews,
                    hasMore: res.hasMore,
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        });
    },

    loadMore: async () => {
        const { page, hasMore, isLoading, filters, allReviews, filteredReviews } = get();
        if (isLoading || !hasMore) return;

        set({ isLoading: true });

        // Client Mode Pagination
        if (allReviews.length > 0) {
            const limit = 12;
            const nextPage = page + 1;
            const start = page * limit;
            const end = start + limit;

            const nextBatch = filteredReviews.slice(start, end);

            // Artificial delay for "loading feel" if desired? No, keep it instant.
            set((state) => ({
                reviews: [...state.reviews, ...nextBatch],
                hasMore: end < filteredReviews.length,
                page: nextPage,
                isLoading: false
            }));
            return;
        }

        // Server Mode Pagination
        const nextPage = page + 1;
        const res = await getReviewsAction({
            page: nextPage,
            limit: 12,
            minRating: filters.minRating,
            tagIds: filters.tagIds,
            isMustWatch: filters.isMustWatch
        });

        if (res.success && res.reviews) {
            set((state) => ({
                reviews: [...state.reviews, ...res.reviews],
                hasMore: res.hasMore,
                page: nextPage,
                isLoading: false
            }));
        } else {
            set({ isLoading: false });
        }
    },

    reset: () => {
        const { allReviews } = get();

        set({
            filters: {
                minRating: null,
                tagIds: [],
                isMustWatch: false,
                viewMode: 'grid',
            }
        });

        // Client Mode Reset
        if (allReviews.length > 0) {
            const limit = 12;
            const firstBatch = allReviews.slice(0, limit);

            set({
                filteredReviews: allReviews, // Reset to full list
                reviews: firstBatch,
                hasMore: allReviews.length > limit,
                isLoading: false,
                page: 1
            });
        } else {
            // Server Mode Reset
            get().refresh();
        }
    },

    refresh: async () => {
        // ... (Keep existing refresh logic, maybe improve for client mode later)
        const { filters } = get();
        set({ isLoading: true, page: 1 });

        const res = await getReviewsAction({
            page: 1,
            limit: 12,
            minRating: filters.minRating,
            tagIds: filters.tagIds,
            isMustWatch: filters.isMustWatch
        });

        if (res.success && res.reviews) {
            set({
                reviews: res.reviews,
                hasMore: res.hasMore,
                isLoading: false
            });
        } else {
            set({ isLoading: false });
        }
    },

    // Initialize with server data
    initialize: (initialReviews, totalCount) => {
        const { reviews, filters } = get();

        // Safety check to avoid overwriting state during navigation if already set
        if (reviews.length > 0 && (filters.minRating || filters.tagIds.length > 0)) return;

        const isClientModeCandidate = initialReviews.length === totalCount;

        if (isClientModeCandidate) {
            // Client Mode: Slice initial batch immediately
            const limit = 12;
            const firstBatch = initialReviews.slice(0, limit);

            set((state) => ({
                allReviews: initialReviews,
                filteredReviews: initialReviews, // Initially no filters
                reviews: firstBatch,
                hasMore: initialReviews.length > limit,
                page: 1,
                // Reset filters but keep viewMode
                filters: {
                    ...state.filters,
                    minRating: null,
                    tagIds: [],
                    isMustWatch: false,
                }
            }));
        } else {
            // Server Mode or First Page
            // ALWAYS update with fresh server data on mount/initialize
            // Use totalCount to accurately determine if there are more pages server-side
            set((state) => ({
                reviews: initialReviews,
                allReviews: [], // Ensure client cache is empty (Server Mode)
                filteredReviews: [],
                hasMore: totalCount > initialReviews.length,
                page: 1,
                // Reset filters but keep viewMode
                filters: {
                    ...state.filters,
                    minRating: null,
                    tagIds: [],
                    isMustWatch: false,
                }
            }));
        }
    }
}));

