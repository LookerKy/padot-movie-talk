import { ReviewListView } from "@/components/reviews/review-list-view";
import prisma from "@/lib/db/client";

// Revalidate every 60 seconds (SSG-like behavior with ISR)
export const revalidate = 60;

import { getSession } from "@/lib/auth";

export default async function Home() {
    const session = await getSession();

    // Fetch all reviews, ordered by watched date (latest first)
    // NOTE: For Hybrid Scaling, we might want to optimize this to only fetch 'count' first if > Threshold.
    // For now, as agreed, we fetch all.
    // Fetch first page of reviews (Pagination Optimization)
    // We only fetch 12 items initially to reduce memory and payload size.
    // Further items are loaded via infinite scroll (server actions).
    // Fetch all reviews (lite version) for Client-Side Pagination & Instant Filtering
    // We exclude 'content' (body text) to keep payload small even with 1000 items.
    const [rawReviews, totalCount] = await Promise.all([
        prisma.review.findMany({
            select: {
                id: true,
                title: true,
                director: true,
                posterUrl: true,
                tmdbId: true,
                rating: true,
                oneLiner: true, // Critical for hover details
                watchedAt: true,
                isMustWatch: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
                tags: true, // Required by ReviewWithTags
                // Exclude 'content' to save bandwidth
            },
            orderBy: {
                watchedAt: "desc",
            },
            take: 1000, // Large limit to enable client-mode for most users
        }),
        prisma.review.count(),
    ]);

    // Map to satisfy Review type (add empty content)
    const reviews = rawReviews.map(r => ({
        ...r,
        content: "",
    }));

    return (
        <ReviewListView
            initialReviews={reviews}
            initialTotalCount={totalCount}
            user={session?.user}
        />
    );
}
