
import { z } from "zod";

export const reviewSchema = z.object({
    tmdbId: z.number().int().optional(),
    title: z.string().min(1, "영화 제목은 필수입니다."),
    director: z.string().optional(),
    posterUrl: z.string().url("유효한 URL이어야 합니다.").optional().or(z.literal("")),
    rating: z.number().min(0).max(5).step(0.5),
    oneLiner: z.string().min(1, "한줄평을 입력해주세요.").max(100, "100자 이내로 작성해주세요."),
    content: z.string().min(10, "리뷰 내용은 최소 10자 이상이어야 합니다."),
    watchedAt: z.coerce.date(),
    isMustWatch: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
