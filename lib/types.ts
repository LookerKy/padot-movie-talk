import { Review as PrismaReview, Tag as PrismaTag } from "@prisma/client";

export type Tag = PrismaTag;

export type ReviewWithTags = PrismaReview & {
    tags: Tag[];
};

export type ReviewListItem = Pick<
    PrismaReview,
    "id" | "title" | "rating" | "posterUrl" | "oneLiner" | "watchedAt" | "isMustWatch"
> & {
    tags: Tag[];
};

// Re-export Review for backward compatibility if needed, but ReviewWithTags is preferred.
export type Review = ReviewWithTags;
