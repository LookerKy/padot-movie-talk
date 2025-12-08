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
    const rawReviews = await prisma.review.findMany({
        include: {
            tags: true,
        },
        orderBy: {
            watchedAt: "desc",
        },
    });

    return (
        <ReviewListView
            initialReviews={rawReviews}
            initialTotalCount={rawReviews.length}
            user={session?.user}
        />
    );
}
