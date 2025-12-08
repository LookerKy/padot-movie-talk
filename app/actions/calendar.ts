"use server";

import prisma from "@/lib/db/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export type CalendarEventType = "SCREENING" | "WATCHED" | "CINETY";

export interface CalendarEventDisplay {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: CalendarEventType;
}

export async function getCalendarEvents(year: number, month: number) {
    // Construct date range for the month view (including previous/next month overlap)
    const monthStart = new Date(year, month, 1);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    try {
        // 1. Fetch Screening Events from CalendarEvent table
        // We want events that overlap with the view range
        const screenings = await prisma.calendarEvent.findMany({
            where: {
                OR: [
                    { startDate: { lte: endDate }, endDate: { gte: startDate } }
                ]
            }
        });

        // 2. Fetch Watched Events from Review table
        const reviews = await prisma.review.findMany({
            where: {
                watchedAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            select: {
                id: true,
                title: true,
                watchedAt: true,
            }
        });

        // 3. Transform to unified format
        const events: CalendarEventDisplay[] = [];

        screenings.forEach((s: typeof screenings[0]) => {
            events.push({
                id: s.id,
                title: s.title,
                startDate: s.startDate,
                endDate: s.endDate,
                type: s.type as CalendarEventType
            });
        });

        reviews.forEach((r: typeof reviews[0]) => {
            events.push({
                id: r.id,
                title: r.title,
                startDate: r.watchedAt,
                endDate: r.watchedAt, // Single day event
                type: "WATCHED"
            });
        });


        return { success: true, data: events };

    } catch (error) {
        console.error("Failed to fetch calendar events:", error);
        return { success: false, error: "Failed to load events" };
    }
}

const createEventSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    startDate: z.string(),
    endDate: z.string(),
});

import { getSession } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function createCalendarEvent(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "권한이 없습니다." };
    }

    const title = formData.get("title");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    const result = createEventSchema.safeParse({ title, startDate, endDate });

    if (!result.success) {
        return { error: "입력 값이 올바르지 않습니다." };
    }

    try {
        await prisma.calendarEvent.create({
            data: {
                title: result.data.title,
                startDate: new Date(result.data.startDate),
                endDate: new Date(result.data.endDate),
                type: "CINETY", // Distinct type for Admin Manual Events
            },
        });

        revalidatePath("/calendar");
        return { success: true, message: "일정이 등록되었습니다." };
    } catch (error) {
        console.error("Create event error:", error);
        return { error: "일정 등록 중 오류가 발생했습니다." };
    }
}

export async function deleteCalendarEvent(id: string) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "권한이 없습니다." };
    }

    try {
        await prisma.calendarEvent.delete({
            where: { id }
        });
        revalidatePath("/calendar");
        return { success: true, message: "일정이 삭제되었습니다." };
    } catch (error) {
        console.error("Delete event error:", error);
        return { error: "일정 삭제 중 오류가 발생했습니다." };
    }
}

export async function updateCalendarEvent(id: string, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "권한이 없습니다." };
    }

    const title = formData.get("title");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    // Re-use schema or partial validation
    const result = createEventSchema.safeParse({ title, startDate, endDate });

    if (!result.success) {
        return { error: "입력 값이 올바르지 않습니다." };
    }

    try {
        await prisma.calendarEvent.update({
            where: { id },
            data: {
                title: result.data.title,
                startDate: new Date(result.data.startDate),
                endDate: new Date(result.data.endDate),
            }
        });
        revalidatePath("/calendar");
        return { success: true, message: "일정이 수정되었습니다." };
    } catch (error) {
        console.error("Update event error:", error);
        return { error: "일정 수정 중 오류가 발생했습니다." };
    }
}
