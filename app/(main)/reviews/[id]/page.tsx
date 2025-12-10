import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Quote, Star, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TAG_COLORS } from "@/lib/utils";
import prisma from "@/lib/db/client";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";
import { Metadata } from "next";
import { Tag } from "@/lib/types";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const review = await prisma.review.findUnique({
        where: { id },
    });

    if (!review) {
        return {
            title: "Review Not Found",
        };
    }

    return {
        title: `${review.title} Review - 송충이 어워즈`,
        description: review.oneLiner,
    };
}

export default async function ReviewDetailPage({ params }: PageProps) {
    const { id } = await params;
    const session = await getSession();

    const review = await prisma.review.findUnique({
        where: { id },
        include: {
            tags: true,
            author: true,
        },
    });

    if (!review) {
        notFound();
    }

    // Format dates and handle optional fields
    const formattedDate = format(new Date(review.watchedAt), "yyyy-MM-dd");
    const posterSrc = review.posterUrl || "/placeholder-poster.png";

    // Author info from DB
    const authorName = review.author?.name || review.author?.username || "Unknown Author";
    const authorInitial = authorName.charAt(0).toUpperCase();

    // Check if current user is author (for future edit buttons)
    const isOwner = session?.user?.id === review.authorId;

    return (
        <div className="w-full relative -mt-24"> {/* Full width of container */}

            {/* 1. Hero Section (Contains Background + Content) */}
            <div className="relative w-full overflow-hidden">
                {/* Background - Contained within Hero Section */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={posterSrc}
                        alt="Backdrop"
                        fill
                        className="object-cover opacity-40 blur-3xl scale-110"
                        priority
                        sizes="100vw"
                    />
                    {/* Gradient Overlay for smooth transition to bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-slate-950" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-20">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                        {/* Floating Poster */}
                        <div className="shrink-0 w-full max-w-[300px] mx-auto md:mx-0 relative group perspective-1000">
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-2">
                                {review.posterUrl ? (
                                    <Image
                                        src={review.posterUrl}
                                        alt={review.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 300px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-500">
                                        No Poster
                                    </div>
                                )}
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Movie Info */}
                        <div className="flex-1 space-y-8 text-center md:text-left pt-4">
                            <div className="space-y-2">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {review.tags.map((tag: Tag) => {
                                        const color = tag.color || TAG_COLORS[tag.name.length % TAG_COLORS.length];
                                        return (
                                            <Badge
                                                key={tag.id}
                                                className="px-3 py-1 text-sm font-medium text-white border-none shadow-lg backdrop-blur-md"
                                                style={{
                                                    backgroundColor: color,
                                                    boxShadow: `0 4px 12px ${color}40`
                                                }}
                                            >
                                                {tag.name}
                                            </Badge>
                                        )
                                    })}
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground dark:text-white drop-shadow-sm dark:drop-shadow-2xl leading-tight">
                                    {review.title}
                                </h1>

                                {/* Metadata Row */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground dark:text-gray-200">
                                    <div className="flex items-center gap-2 bg-secondary/30 dark:bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-border/10 dark:border-white/10">
                                        <Calendar size={18} className="text-primary dark:text-padot-blue-300" />
                                        <span className="font-medium text-foreground dark:text-gray-200">
                                            {formattedDate.split(" ")[0]} 시청 {/* Ensure simplified date if needed, or keep formattedDate */}
                                            {/* Note: User changed formattedDate display in previous turn manually. I'll stick to variable */}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="text-yellow-400 fill-yellow-400" size={20} />
                                        <span className="text-2xl font-bold text-foreground dark:text-white">{review.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground/60 dark:text-white/50">/ 5.0</span>
                                    </div>

                                    {/* Edit Button */}
                                    {isOwner && (
                                        <Link
                                            href={`/reviews/${id}/edit`}
                                            className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary/50 dark:bg-white/10 dark:hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-border/10 dark:border-white/10 text-foreground dark:text-white font-medium transition-all group"
                                        >
                                            <Pencil size={16} className="text-primary dark:text-padot-blue-300 group-hover:text-primary/80 dark:group-hover:text-padot-blue-200" />
                                            <span>수정하기</span>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="relative py-4">
                                <p className="text-sm font-medium text-muted-foreground dark:text-slate-400 mt-2">
                                    페닷의 한마디
                                </p>
                                <p className="relative text-2xl md:text-2xl font-medium italic text-foreground dark:text-white/90 leading-relaxed tracking-wide">
                                    "{review.oneLiner}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Review Section - Located OUTSIDE the Hero Area */}
            <div className="relative max-w-7xl mx-auto px-6 pb-20">
                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Decorative Line */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-padot-blue-500/50 to-transparent hidden md:block" />

                        <div className="md:pl-12 space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <span className="w-8 h-1 bg-primary rounded-full block" />
                                    상세 리뷰
                                </h3>
                            </div>

                            {/* Render HTML Content from Editor */}
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none leading-loose text-foreground/90 
                                [&>p]:mb-6 [&_p]:min-h-[1.5em] 
                                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:bg-secondary [&>blockquote]:rounded-r-lg
                                [&_strong]:!text-foreground [&_b]:!text-foreground
                                [&_li]:!text-foreground/90
                                [&_li::marker]:!text-foreground/90
                                "
                                dangerouslySetInnerHTML={{ __html: review.content }}
                            />

                            {/* Footer / Signature */}
                            <div className="pt-10 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-4">
                                    <span>작성일: {formattedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
