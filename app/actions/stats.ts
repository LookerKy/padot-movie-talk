"use server";

import prisma from "@/lib/db/client";
import { requireAuth, AuthError } from "@/lib/auth-helpers";

export async function getGlobalReviewStatsAction() {
    try {
        // No auth required for global stats
        // const session = await requireAuth(); 

        // 1. Total Count (Global)
        const totalCount = await prisma.review.count();

        // 2. Rating Distribution (Global)
        const allReviews = await prisma.review.findMany({
            select: { rating: true, watchedAt: true, isMustWatch: true, tags: { select: { name: true } } }
        });

        const ratingDist: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        // const monthlyCount: Record<string, number> = {}; // Removed based on feedback
        const tagCounts: Record<string, number> = {};
        let mustWatchCount = 0;

        allReviews.forEach((r: { rating: number; isMustWatch: boolean; tags: { name: string }[] }) => {
            // Rating Dist (Floor)
            const floorRating = Math.floor(r.rating);
            ratingDist[floorRating] = (ratingDist[floorRating] || 0) + 1;

            // Must Watch
            if (r.isMustWatch) mustWatchCount++;

            // Tags
            r.tags.forEach((t: { name: string }) => {
                tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
            });
        });

        // Process Top Tags
        const topTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15) // Increased limit
            .map(([name, count]) => ({ name, count }));

        return {
            success: true,
            data: {
                totalCount,
                mustWatchCount,
                ratingDist,
                topTags,
                // monthlyStats // Removed
            }
        };

    } catch (error) {
        console.error("Stats Error:", error);
        return { success: false, error: "통계 데이터를 불러오는 중 오류가 발생했습니다." };
    }
}
