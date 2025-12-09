
"use server";

import { reviewSchema, ReviewFormValues } from "@/lib/validations/review";
import prisma from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TAG_COLORS } from "@/lib/utils";
import { getSession } from "@/lib/auth";

// Helper to get random color
function getRandomTagColor() {
    const index = Math.floor(Math.random() * TAG_COLORS.length);
    return TAG_COLORS[index];
}



// Check if a review already exists for a given TMDB ID
export async function checkReviewExists(tmdbId: number) {
    try {
        const existing = await prisma.review.findFirst({
            where: { tmdbId },
            select: { id: true, title: true }
        });
        return { exists: !!existing, review: existing };
    } catch (error) {
        console.error("Failed to check review existence:", error);
        return { exists: false };
    }
}

// Improved version to handle redirect correctly
export async function submitReview(data: ReviewFormValues) {
    const result = reviewSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "입력 값이 올바르지 않습니다.", issues: result.error.flatten() };
    }

    const { tags, ...rest } = result.data;
    const { tmdbId } = rest;

    // Server-side duplicate check
    if (tmdbId) {
        const existingCheck = await checkReviewExists(tmdbId);
        if (existingCheck.exists) {
            return { success: false, error: "이미 등록된 영화입니다." };
        }
    }

    // Auth Check
    const session = await getSession();
    if (!session || !session.user) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    let reviewId: string;

    try {
        const review = await prisma.review.create({
            data: {
                title: rest.title,
                rating: rest.rating,
                oneLiner: rest.oneLiner,
                content: rest.content,
                watchedAt: rest.watchedAt,
                isMustWatch: rest.isMustWatch,
                tmdbId: rest.tmdbId ?? null,
                posterUrl: rest.posterUrl ?? null,
                director: rest.director ?? null,
                author: {
                    connect: { id: session.user.id }
                },
                tags: {
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag },
                        create: {
                            name: tag,
                            color: getRandomTagColor()
                        },
                    })),
                },
            },
        });
        reviewId = review.id;
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "서버 에러가 발생했습니다." };
    }

    revalidatePath("/reviews");
    return { success: true, reviewId };
}

export async function updateReview(reviewId: string, data: ReviewFormValues) {
    const result = reviewSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "입력 값이 올바르지 않습니다.", issues: result.error.flatten() };
    }

    const { tags, ...rest } = result.data;

    // Auth & Ownership Check
    const session = await getSession();
    if (!session || !session.user) {
        return { success: false, error: "로그인이 필요합니다." };
    }

    try {
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { authorId: true }
        });

        if (!existingReview) {
            return { success: false, error: "리뷰를 찾을 수 없습니다." };
        }

        if (existingReview.authorId !== session.user.id) {
            return { success: false, error: "수정 권한이 없습니다." };
        }

        await prisma.review.update({
            where: { id: reviewId },
            data: {
                ...rest,
                director: rest.director || "",
                tags: {
                    set: [], // Clear existing relations
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag },
                        create: {
                            name: tag,
                            color: getRandomTagColor()
                        },
                    })),
                },
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: "서버 에러가 발생했습니다." };
    }

    revalidatePath("/reviews");
    revalidatePath(`/reviews/${reviewId}`);
    return { success: true, reviewId };
}

interface GetReviewsOptions {
    page?: number;
    limit?: number;
    minRating?: number | null;
    tagIds?: string[];
    isMustWatch?: boolean | null;
}

export async function getReviewsAction({ page = 1, limit = 12, minRating = null, tagIds = [], isMustWatch = null }: GetReviewsOptions) {
    try {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (minRating) {
            where.rating = {
                gte: minRating
            };
        }

        if (tagIds && tagIds.length > 0) {
            where.tags = {
                some: {
                    id: { in: tagIds }
                }
            };
        }

        if (isMustWatch) {
            where.isMustWatch = true;
        }

        const [reviews, totalCount] = await prisma.$transaction([
            prisma.review.findMany({
                where,
                include: {
                    tags: true,
                },
                orderBy: {
                    watchedAt: "desc"
                },
                skip,
                take: limit,
            }),
            prisma.review.count({ where })
        ]);

        const hasMore = totalCount > skip + limit;

        return { success: true, reviews, hasMore, totalCount };
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return { success: false, error: "리뷰를 불러오는 데 실패했습니다.", reviews: [], hasMore: false, totalCount: 0 };
    }
}

export async function getTagsAction() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: {
                name: "asc"
            }
        });
        return { success: true, tags };
    } catch (error) {
        console.error("Failed to fetch tags:", error);
        return { success: false, error: "태그를 불러오는 데 실패했습니다.", tags: [] };
    }
}
