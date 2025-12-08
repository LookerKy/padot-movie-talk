"use server";

import prisma from "@/lib/db/client";

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
