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
    const [rawReviews, totalCount] = await Promise.all([
        prisma.review.findMany({
            include: {
                tags: true,
            },
            orderBy: {
                watchedAt: "desc",
            },
            take: 12, // LIMIT 12
        }),
        prisma.review.count(),
    ]);

    return (
        <ReviewListView
            initialReviews={rawReviews}
            initialTotalCount={totalCount}
            user={session?.user}
        />
    );
}
