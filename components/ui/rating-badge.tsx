import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
    rating: number;
    className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
    return (
        <div className={cn("flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md shadow-sm", className)}>
            <Star className="text-yellow-400 fill-yellow-400" size={12} />
            <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
        </div>
    );
}
