"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { createCalendarEvent } from "@/app/actions/calendar";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";

import { CalendarEventDisplay, updateCalendarEvent } from "@/app/actions/calendar";
import { useCalendarStore } from "@/store/use-calendar-store";


interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialDate?: Date;
    initialData?: CalendarEventDisplay; // For editing
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + ":00");

export function AddScheduleModal({ isOpen, onClose, onSuccess, initialDate, initialData }: AddScheduleModalProps) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Global Store Actions for Draft
    const { setDraftSchedule, clearDraftSchedule } = useCalendarStore((state) => state.actions);
    const draftSchedule = useCalendarStore((state) => state.draftSchedule);

    // Initial default values
    // Priority: initialData (Edit) > draftSchedule (if not edit) > initialDate (New from Click) > Today
    const getEffectiveInitialDate = () => {
        if (initialData) return new Date(initialData.startDate);
        if (draftSchedule?.startDate) return new Date(draftSchedule.startDate);
        return initialDate || new Date();
    };

    const effectiveDate = getEffectiveInitialDate();

    // Helpers to extract time HH:00 from date
    const getHourString = (d: Date) => {
        return d.getHours().toString().padStart(2, "0") + ":00";
    };

    const defaultDate = effectiveDate.getFullYear() + "-" + (effectiveDate.getMonth() + 1).toString().padStart(2, "0") + "-" + effectiveDate.getDate().toString().padStart(2, "0");

    // Default End Date is 14 days (2 weeks) after effective start date
    const defaultEndDateObj = new Date(effectiveDate);
    defaultEndDateObj.setDate(defaultEndDateObj.getDate() + 14);
    const defaultEndDateStr = defaultEndDateObj.getFullYear() + "-" + (defaultEndDateObj.getMonth() + 1).toString().padStart(2, "0") + "-" + defaultEndDateObj.getDate().toString().padStart(2, "0");

    const defaultStartTime = initialData
        ? getHourString(new Date(initialData.startDate))
        : (draftSchedule?.startDate ? getHourString(new Date(draftSchedule.startDate)) : "20:00");

    const defaultEndTime = initialData
        ? getHourString(new Date(initialData.endDate))
        : (draftSchedule?.endDate ? getHourString(new Date(draftSchedule.endDate)) : "15:00");

    const defaultTitle = initialData?.title || draftSchedule?.title || "";

    const isEditMode = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Combine Date and Time manual inputs into ISO strings for the server
        const sDate = formData.get("startDate_d") as string;
        const sTime = formData.get("startDate_t") as string;
        const eDate = formData.get("endDate_d") as string;
        const eTime = formData.get("endDate_t") as string;

        if (!sDate || !sTime || !eDate || !eTime) {
            setError("날짜와 시간을 모두 선택해주세요.");
            setLoading(false);
            return;
        }

        // Create ISO strings
        // e.g. 2024-12-07T14:00:00.000Z (local time handled by browser date constrcutor usually, but let's conform to existing action expected format)
        // The server action expects "startDate" and "endDate" in the formData OR we can append them.
        // Let's create a new FormData or append to existing one.

        const finalStartDate = `${sDate}T${sTime}`; // e.g. 2024-12-07T14:00
        const finalEndDate = `${eDate}T${eTime}`;

        // VALIDATION: Start < End
        if (new Date(finalStartDate) >= new Date(finalEndDate)) {
            setError("종료 시간은 시작 시간보다 뒤여야 합니다.");
            setLoading(false);
            return;
        }

        formData.set("startDate", finalStartDate);
        formData.set("endDate", finalEndDate);

        // Remove helper fields
        formData.delete("startDate_d");
        formData.delete("startDate_t");
        formData.delete("endDate_d");
        formData.delete("endDate_t");

        let res;
        if (isEditMode && initialData) {
            res = await updateCalendarEvent(initialData.id, formData);
        } else {
            res = await createCalendarEvent(null, formData);
        }

        setLoading(false);

        if (res?.error) {
            setError(res.error);
        } else {
            clearDraftSchedule();
            if (onSuccess) {
                onSuccess();
            } else {
                // Assuming onSuccess is passed as a prop if needed, otherwise onClose
                // This part was not in the original code, but often a pattern.
                // If onSuccess is not defined, it will just call onClose.
                // If there's a specific onSuccess prop, it should be handled here.
                // For now, keeping it as it was, just calling onClose.
                onClose();
            }
        }
    };

    const handleCancel = () => {
        // Lightweight "Save Draft" by reading the form ref directly if possible
        if (!isEditMode) {
            const formElement = document.getElementById("add-schedule-form") as HTMLFormElement;
            if (formElement) {
                const formData = new FormData(formElement);
                const title = formData.get("title") as string;
                const sDate = formData.get("startDate_d") as string;
                const sTime = formData.get("startDate_t") as string;
                const eDate = formData.get("endDate_d") as string;
                const eTime = formData.get("endDate_t") as string;

                if (title || sDate) {
                    setDraftSchedule({
                        title,
                        startDate: new Date(`${sDate}T${sTime}`),
                        endDate: new Date(`${eDate}T${eTime}`),
                    } as any);
                }
            }
        }

        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "시네티 일정 수정" : "시네티 일정 추가"}
            description={isEditMode ? "등록된 일정을 수정합니다." : "캘린더에 표시될 상영 일정을 추가합니다."}
            className="max-w-xl"
        >
            <form id="add-schedule-form" onSubmit={handleSubmit} className="space-y-6 pt-2">
                <div className="space-y-2">
                    <label htmlFor="schedule-title" className="text-sm font-semibold text-foreground">
                        제목
                    </label>
                    <input
                        id="schedule-title"
                        name="title"
                        required
                        defaultValue={defaultTitle}
                        className="w-full rounded-lg bg-secondary border border-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium placeholder:font-light text-foreground"
                        placeholder="예) 인셉션 상영회"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-2">
                        <label htmlFor="schedule-start-date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CalendarIcon size={14} className="text-primary" />
                            시작 시간
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="schedule-start-date"
                                type="date"
                                name="startDate_d"
                                required
                                defaultValue={defaultDate}
                                className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <div className="relative w-28">
                                <select
                                    id="schedule-start-time"
                                    name="startDate_t"
                                    aria-label="시작 시간 선택"
                                    className="w-full appearance-none rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    defaultValue={defaultStartTime}
                                >
                                    {HOURS.map(h => (
                                        <option key={`start-${h}`} value={h}>{h}</option>
                                    ))}
                                </select>
                                <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label htmlFor="schedule-end-date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CalendarIcon size={14} className="text-destructive" />
                            종료 시간
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="schedule-end-date"
                                type="date"
                                name="endDate_d"
                                required
                                defaultValue={isEditMode && initialData ? new Date(initialData.endDate).toISOString().split("T")[0] : defaultEndDateStr}
                                className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            />
                            <div className="relative w-28">
                                <select
                                    id="schedule-end-time"
                                    name="endDate_t"
                                    aria-label="종료 시간 선택"
                                    className="w-full appearance-none rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    defaultValue={defaultEndTime}
                                >
                                    {HOURS.map(h => (
                                        <option key={`end-${h}`} value={h}>{h}</option>
                                    ))}
                                </select>
                                <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-sm text-destructive font-medium animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-padot-blue-500 to-indigo-600 hover:from-padot-blue-600 hover:to-indigo-700 rounded-lg transition-all shadow-lg hover:shadow-padot-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {isEditMode ? "수정 완료" : "일정 등록"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
