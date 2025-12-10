"use client";

import { X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "확인",
    cancelText = "취소",
    isDestructive = false,
    isLoading = false
}: ConfirmModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
            isOpen ? "opacity-100" : "opacity-0"
        )}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal Content */}
            <div className={cn(
                "relative bg-zinc-900/90 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all duration-300",
                isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
            )}>
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className={cn(
                        "p-3 rounded-full",
                        isDestructive ? "bg-red-500/10 text-red-500" : "bg-padot-blue-500/10 text-padot-blue-500"
                    )}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-gray-400 whitespace-pre-line">{description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors font-medium border border-white/5"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 px-4 py-2 rounded-xl font-medium transition-colors border",
                                isDestructive
                                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                                    : "bg-padot-blue-500/10 hover:bg-padot-blue-500/20 text-padot-blue-500 border-padot-blue-500/20"
                            )}
                        >
                            {isLoading ? "처리 중..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
