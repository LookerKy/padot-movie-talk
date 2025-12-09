import { z } from "zod";

export const calendarEventSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요"),
    startDate: z.string(),
    endDate: z.string(),
});

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>;
