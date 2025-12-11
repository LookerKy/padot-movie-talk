import Link from "next/link";
import { TAG_COLORS } from "@/lib/utils";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/lib/types";
import { format } from "date-fns";

interface MovieListItemProps {
    review: Review;
}

export function MovieListItem({ review }: MovieListItemProps) {
    const formattedDate = format(new Date(review.watchedAt), "yyyy-MM-dd");
    // const posterSrc = review.posterUrl || "/placeholder-poster.png";

    return (
        <Link href={`/reviews/${review.id}`} className="block">
            <GlassCard className="group relative flex items-center gap-6 p-4 overflow-hidden transition-transform duration-300 hover:scale-[1.01]" hoverEffect={false}>

                {/* 1. Hover Background (Poster Blur) */}
                <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark overlay for readability */}
                    {review.posterUrl ? (
                        <Image
                            src={review.posterUrl}
                            alt=""
                            fill
                            sizes="100px" // Only used for hover blur, small size is fine
                            className="object-cover filter blur-xl scale-110"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-900" />
                    )}
                </div>

                {/* 2. Hover Content (One-liner) */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-10 pointer-events-none">
                    <p className="text-white text-lg font-medium text-center leading-relaxed drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        "{review.oneLiner}"
                    </p>
                </div>

                {/* 3. Normal List Content (Fades out on hover) */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center relative z-10 group-hover:opacity-0 transition-opacity duration-200">
                    {/* Title */}
                    <div className="col-span-12 md:col-span-5 relative">
                        <h3 className="text-lg font-bold text-foreground truncate">
                            {review.title}
                        </h3>
                    </div>

                    {/* Rating */}
                    <div className="col-span-4 md:col-span-3">
                        <StarRating rating={review.rating} size={16} />
                    </div>

                    {/* Tags */}
                    <div className="col-span-4 md:col-span-3 flex gap-2">
                        {review.tags.slice(0, 2).map((tag: any) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-white border-none shadow-sm backdrop-blur-md px-2 py-0.5"
                                style={{
                                    backgroundColor: tag.color || TAG_COLORS[tag.name.length % TAG_COLORS.length]
                                }}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Date */}
                    <div className="col-span-4 md:col-span-1 text-right text-xs text-muted-foreground">
                        {formattedDate}
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
