import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
    rating: number; // 0.5 to 5.0
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

    const displayRating = hoverRating !== null ? hoverRating : rating;

    const handleRatingClick = (value: number) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(null);
        }
    };

    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
        const isFull = i <= displayRating;
        const isHalf = !isFull && i - 0.5 <= displayRating;

        // Interactive logic for half stars usually requires more complex DOM or just per-star granularity.
        // For simplicity, let's treat "click on star i" as selecting i.
        // If we want half stars, we need left/right split.
        // Let's implement left/right split for precision.

        stars.push(
            <div
                key={i}
                className={cn("relative inline-block", !readonly && "cursor-pointer")}
                onMouseLeave={handleMouseLeave}
            >
                {/* Background Star */}
                <Star
                    size={size}
                    className="text-gray-300 dark:text-gray-600"
                    fill="transparent"
                />

                {/* Left Half Hitbox & Render */}
                <div
                    className="absolute top-0 left-0 h-full w-1/2 overflow-hidden z-10"
                    onMouseEnter={() => handleMouseEnter(i - 0.5)}
                    onClick={() => handleRatingClick(i - 0.5)}
                >
                    {(isFull || isHalf) && (
                        <Star
                            size={size}
                            className="text-yellow-400 block"
                            fill="currentColor"
                        />
                    )}
                </div>

                {/* Right Half Hitbox & Render */}
                <div
                    className="absolute top-0 right-0 h-full w-1/2 overflow-hidden z-20"
                    onMouseEnter={() => handleMouseEnter(i)}
                    onClick={() => handleRatingClick(i)}
                >
                    {isFull && (
                        <div className="absolute top-0 right-0 h-full w-full overflow-hidden" style={{ transform: "translateX(100%)", /* This hack effectively shows the right half by clipping based on parent */ }}>
                            {/* Wait, the "Right Half" div is effectively the right side of the container. 
                                 Rendering the full star inside it but aligning it? 
                                 
                                 Actually, standard approach:
                                 Full star render (if full).
                                 
                                 Let's simplify:
                                 Render the "Filled Star" overlay based on props.
                                 Have 2 hitboxes (divs) over it for interaction.
                              */}
                        </div>
                    )}
                    {/* Simplified Render Logic Overlay based on State */}
                </div>

                {/* Filled Star Overlay (Visuals) */}
                <div className="absolute top-0 left-0 pointer-events-none w-full h-full">
                    {(isFull || isHalf) && (
                        <div className="overflow-hidden" style={{ width: isFull ? "100%" : "50%" }}>
                            <Star
                                size={size}
                                className="text-yellow-400"
                                fill="currentColor"
                            />
                        </div>
                    )}
                </div>

                {/* Hitboxes for Interaction */}
                {!readonly && (
                    <>
                        <div
                            className="absolute top-0 left-0 w-1/2 h-full z-10"
                            onMouseEnter={() => handleMouseEnter(i - 0.5)}
                            onClick={() => handleRatingClick(i - 0.5)}
                        />
                        <div
                            className="absolute top-0 right-0 w-1/2 h-full z-10"
                            onMouseEnter={() => handleMouseEnter(i)}
                            onClick={() => handleRatingClick(i)}
                        />
                    </>
                )}
            </div>
        );
    }

    return <div className={cn("flex gap-0.5", className)}>{stars}</div>;
}
