"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export function Modal({ isOpen, onClose, children, title, description, className }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div
                className={cn(
                    "relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-background p-6 shadow-2xl transition-all border border-border",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        {title && <h3 className="text-xl font-bold leading-6 text-foreground">{title}</h3>}
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-accent transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
