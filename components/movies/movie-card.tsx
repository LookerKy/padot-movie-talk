import Link from "next/link";
import { TAG_COLORS } from "@/lib/utils";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { RatingBadge } from "@/components/ui/rating-badge";
import { Badge } from "@/components/ui/badge";
import { Review } from "@/lib/types";
import { format } from "date-fns";

interface MovieCardProps {
    review: Review;
    priority?: boolean;
}

export function MovieCard({ review, priority = false }: MovieCardProps) {
    // const posterSrc = review.posterUrl || "/placeholder-poster.png";
    const formattedDate = format(new Date(review.watchedAt), "yyyy-MM-dd");

    return (
        <Link href={`/reviews/${review.id}`} className="block h-full" prefetch={false}>
            <GlassCard className="group relative overflow-hidden p-0 h-full flex flex-col hover:border-padot-blue-300 dark:hover:border-padot-blue-500/50">
                {/* Poster Image Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                    {review.posterUrl ? (
                        <Image
                            src={review.posterUrl}
                            alt={review.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            priority={priority}
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500 font-medium">
                            No Poster
                        </div>
                    )}

                    {/* Main Overlay Gradient for readability (Bottom) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    {/* Hover One-liner Overlay (Glass Effect) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm p-6 z-10">
                        <p className="text-white text-center font-medium leading-relaxed break-keep drop-shadow-md">
                            "{review.oneLiner}"
                        </p>
                    </div>

                    {/* Dotchelin Badge (Top Left) */}
                    {review.isMustWatch && (
                        <div className="absolute top-2 left-2 z-20 w-8 h-8 filter drop-shadow-lg animate-in fade-in zoom-in duration-300">
                            <Image
                                src="/dot-badge-clean2.webp"
                                alt="Dotchelin"
                                fill
                                sizes="32px"
                                className="object-contain"

                            />
                        </div>
                    )}

                    {/* Star Rating (Top Right) */}
                    {/* Rating Badge (Top Right) */}
                    <div className="absolute top-2 right-2 z-20">
                        <RatingBadge rating={review.rating} />
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex flex-col gap-2 flex-grow">
                    <div className="flex flex-col gap-1.5">
                        <h3 className="text-lg font-bold truncate text-foreground group-hover:text-primary transition-colors">
                            {review.title}
                        </h3>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {review.tags.slice(0, 3).map((tag: any) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="text-white dark:text-white"
                                    style={{ backgroundColor: tag.color || TAG_COLORS[tag.name.length % TAG_COLORS.length] }}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-xs text-muted-foreground font-medium">
                            시청일: {formattedDate}
                        </span>
                    </div>
                </div>
            </GlassCard>
        </Link>
    );
}
