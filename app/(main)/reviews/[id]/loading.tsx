import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full relative -mt-24">
            {/* 1. Hero Skeleton */}
            <div className="relative w-full overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-20">
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                        {/* Poster Skeleton */}
                        <div className="shrink-0 w-full max-w-[300px] mx-auto md:mx-0 relative">
                            <Skeleton className="aspect-[2/3] rounded-2xl w-full h-full bg-slate-200 dark:bg-slate-800" />
                        </div>

                        {/* Info Skeleton */}
                        <div className="flex-1 space-y-8 text-center md:text-left pt-4 w-full">
                            <div className="space-y-4">
                                {/* Tags */}
                                <div className="flex gap-2 justify-center md:justify-start">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                {/* Title */}
                                <Skeleton className="h-16 w-3/4 mx-auto md:mx-0" />
                                {/* Metadata */}
                                <div className="flex gap-4 justify-center md:justify-start">
                                    <Skeleton className="h-8 w-32 rounded-full" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                            </div>
                            {/* Quote */}
                            <div className="py-4">
                                <Skeleton className="h-8 w-full max-w-lg mx-auto md:mx-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Skeleton */}
            <div className="relative max-w-7xl mx-auto px-6 pb-20">
                <div className="mt-12 max-w-4xl mx-auto md:pl-12 space-y-10">
                    <Skeleton className="h-10 w-48 mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
