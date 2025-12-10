import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface StarRatingProps {
    rating: number; // 0.0 to 5.0
    maxRating?: number;
    size?: number;
    className?: string;
    readonly?: boolean;
    onChange?: (rating: number) => void;
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 16,
    className,
    readonly = true,
    onChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const displayRating = hoverRating !== null ? hoverRating : rating;

    // Calculate percentage for the filled overlay
    const percentage = Math.min(100, Math.max(0, (displayRating / maxRating) * 100));

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (readonly || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Calculate raw rating based on mouse position
        let rawRating = (x / width) * maxRating;

        // Snap to nearest 0.5
        const snappedRating = Math.ceil(rawRating * 2) / 2;

        // Clamp between 0.5 and maxRating
        const finalRating = Math.min(maxRating, Math.max(0.5, snappedRating));

        setHoverRating(finalRating);
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(null);
        }
    };

    const handleClick = () => {
        if (!readonly && onChange && hoverRating !== null) {
            onChange(hoverRating);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative inline-flex items-center cursor-pointer", readonly && "cursor-default", className)}
            style={{ width: maxRating * (size + 4), height: size }} // Approximate width based on gap
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Combined Layer: Background + Foreground (Per Star) */}
            <div className="flex gap-1 relative z-0">
                {Array.from({ length: maxRating }).map((_, i) => {
                    // Calculate fill percentage for this specific star
                    // e.g. rating 3.5:
                    // i=0: (3.5 - 0) * 100 = 350 -> 100%
                    // i=1: (3.5 - 1) * 100 = 250 -> 100%
                    // i=2: (3.5 - 2) * 100 = 150 -> 100%
                    // i=3: (3.5 - 3) * 100 = 50 -> 50%
                    // i=4: (3.5 - 4) * 100 = -50 -> 0%
                    const fillPercentage = Math.min(100, Math.max(0, (displayRating - i) * 100));

                    return (
                        <div key={`star-container-${i}`} className="relative" style={{ width: size, height: size }}>
                            {/* Background Star (Empty) */}
                            <Star
                                size={size}
                                className="text-gray-600 dark:text-gray-600 absolute inset-0"
                                fill="transparent"
                                strokeWidth={1.5}
                            />

                            {/* Foreground Star (Filled) - Clipped */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    size={size}
                                    className="text-yellow-400 border-none icon-filled"
                                    fill="currentColor"
                                    strokeWidth={0}
                                />
                            </div>

                            {/* Optional Stroke for Filled (to match border style) */}
                            <div
                                className="absolute inset-0 overflow-hidden pointer-events-none"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    size={size}
                                    className="text-yellow-500/50"
                                    fill="transparent"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
