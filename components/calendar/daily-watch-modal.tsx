"use client";

import { Modal } from "@/components/ui/modal";
import { CalendarEventDisplay } from "@/app/actions/calendar";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, Film } from "lucide-react";

interface DailyWatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    events: CalendarEventDisplay[];
    title?: string;
    emptyMessage?: string;
}

export function DailyWatchModal({ isOpen, onClose, date, events, title, emptyMessage = "시청기록이 없습니다." }: DailyWatchModalProps) {
    if (!isOpen) return null;

    const formatDate = (date: Date) => format(date, "M월 d일 (EEE)", { locale: ko });
    const modalTitle = title || `${formatDate(date)} 시청 기록`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            className="max-w-md"
        >
            <div className="pt-2 space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {events.map((event) => (
                            <div
                                key={`${event.type}-${event.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-padot-blue-50/50 dark:bg-padot-blue-900/10 border border-padot-blue-100 dark:border-padot-blue-900/30"
                            >
                                <div className="p-2 bg-padot-blue-100 dark:bg-padot-blue-900/30 rounded-full text-padot-blue-600 dark:text-padot-blue-400">
                                    {event.type === "WATCHED" ? <Eye size={18} /> : <Film size={18} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {event.title}
                                    </div>
                                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        {event.type === "WATCHED"
                                            ? "닷네티의 날"
                                            : isSameDay(new Date(event.startDate), new Date(event.endDate))
                                                ? "상영일정"
                                                : `${format(new Date(event.startDate), "M.d")} - ${format(new Date(event.endDate), "M.d")}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </Modal>
    );
}
