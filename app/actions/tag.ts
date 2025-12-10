"use server";

import prisma from "@/lib/db/client";


import { requireAuth, AuthError } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function getTagsAction() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: {
                name: "asc",
            },
        });
        return { success: true, data: tags };
    } catch (error) {
        console.error("Tags Fetch Error:", error);
        return { success: false, error: "태그를 불러오는 중 오류가 발생했습니다." };
    }
}

export async function deleteTagAction(tagId: string) {
    try {
        await requireAuth();
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, error: error.message };
        }
        throw error;
    }

    try {
        // Check if tag exists first to avoid P2025
        const tag = await prisma.tag.findUnique({
            where: { id: tagId }
        });

        if (!tag) {
            return { success: false, error: "태그를 찾을 수 없습니다." };
        }

        await prisma.tag.delete({
            where: { id: tagId },
        });

        // Revalidate relevant paths
        revalidatePath("/reviews/new");
        revalidatePath("/"); // Home might show tags?

        return { success: true };
    } catch (error) {
        return { success: false, error: "태그 삭제 중 오류가 발생했습니다." };
    }
}

export async function createTagAction(tagName: string) {
    try {
        await requireAuth();
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: false, error: error.message };
        }
        throw error;
    }

    try {
        const existingTag = await prisma.tag.findUnique({
            where: { name: tagName }
        });

        if (existingTag) {
            return { success: true, tag: existingTag };
        }

        // Helper to get random color (duplicated from review.ts, should ideally be shared)
        // For simplicity, importing TAG_COLORS from utils is fine, but getRandomTagColor logic stays here
        const { TAG_COLORS } = await import("@/lib/utils");
        const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

        const newTag = await prisma.tag.create({
            data: {
                name: tagName,
                color: color
            }
        });

        revalidatePath("/reviews/new"); // Update tag lists
        return { success: true, tag: newTag };

    } catch (error) {
        console.error("Create Tag Error:", error);
        return { success: false, error: "태그 생성 중 오류가 발생했습니다." };
    }
}
