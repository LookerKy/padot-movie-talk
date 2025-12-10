"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Modal } from "@/components/ui/modal";
import { deleteCalendarEvent } from "@/app/actions/calendar";
import { CalendarEventDisplay } from "@/app/actions/calendar";
import { Loader2, Trash2, Edit2, Calendar, Clock, Film } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEventDisplay | null;
    isAdmin: boolean;
    onEdit?: (event: CalendarEventDisplay) => void;
    onDeleteSuccess?: (id: string) => void;
}

export function EventDetailModal({ isOpen, onClose, event, isAdmin, onEdit, onDeleteSuccess }: EventDetailModalProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

    if (!event) return null;

    const handleDeleteClick = () => {
        setIsDeleteConfirming(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteConfirming(false);
    };

    const executeDelete = async () => {
        setIsDeleting(true);
        const res = await deleteCalendarEvent(event.id);

        if (res.success) {
            onDeleteSuccess?.(event.id);
            onClose();
        } else {
            alert(res.error || "삭제 실패");
            setIsDeleting(false);
            setIsDeleteConfirming(false);
        }
    };

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // Formatting helper
    const formatDate = (date: Date) => format(date, "PPP (EEE)", { locale: ko });
    const formatTime = (date: Date) => format(date, "a h:mm", { locale: ko });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="일정 상세"
            className="max-w-md"
        >
            <div className="space-y-6 pt-2">
                {/* Header Info */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Film className="text-primary" size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-bold text-foreground leading-tight mb-1">
                            {event.title}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                            {event.type === "CINETY" ? "시네티 상영" : "기타 일정"}
                        </span>
                    </div>
                </div>

                {/* Time Info */}
                <div className="bg-muted/50 p-4 rounded-xl border border-border">
                    <div className="flex items-start gap-3">
                        <Clock size={18} className="text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                                {format(startDate, "PPP (EEE) a h:mm", { locale: ko })}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground pl-2 border-l-2 border-border">
                                ~ {format(endDate, "PPP (EEE) a h:mm", { locale: ko })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons (Admin Only) */}
                {isAdmin && (
                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        {isDeleteConfirming ? (
                            <div className="flex items-center gap-3 w-full justify-between animate-in fade-in slide-in-from-right-2 duration-200">
                                <span className="text-sm font-medium text-destructive">
                                    정말 삭제하시겠습니까?
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelDelete}
                                        disabled={isDeleting}
                                        className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={executeDelete}
                                        disabled={isDeleting}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        {isDeleting && <Loader2 size={12} className="animate-spin" />}
                                        확인
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    삭제
                                </button>
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(event);
                                            onClose();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        수정
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
