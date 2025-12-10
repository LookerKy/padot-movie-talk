"use client";

import { useEffect, useState } from "react";
import { getGlobalReviewStatsAction } from "@/app/actions/stats";
import { Loader2 } from "lucide-react";
import { FaChartLine, FaStar, FaTrophy, FaHashtag } from "react-icons/fa";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface StatsData {
    totalCount: number;
    mustWatchCount: number;
    ratingDist: Record<number, number>;
    topTags: { name: string; count: number }[];
}

export function StatsView() {
    const [data, setData] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await getGlobalReviewStatsAction();
                if (res.success && res.data) {
                    setData(res.data);
                } else {
                    setError(res.error || "Failed to load stats");
                }
            } catch (err) {
                setError("An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-padot-blue-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-3xl border border-red-500/20">
                {error || "데이터를 불러올 수 없습니다."}
            </div>
        );
    }

    // Determine max values for bars
    const maxRatingCount = Math.max(...Object.values(data.ratingDist));

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto">
            {/* Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-padot-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div>
                        <span className="text-gray-400 font-medium block mb-2">누적 아카이브</span>
                        <span className="text-5xl font-black text-white">{data.totalCount}
                            <span className="text-2xl text-gray-500 font-medium ml-2">편</span>
                        </span>
                    </div>
                    <div className="absolute -bottom-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-white/20 rounded-full blur-2xl w-48 h-48 pointer-events-none" />
                    <FaChartLine size={64} className="absolute bottom-4 right-4 text-white/10 group-hover:text-white/20 transition-colors" />
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div>
                        <span className="text-gray-400 font-medium block mb-2">닷슐랭 명예의 전당</span>
                        <span className="text-5xl font-black text-white">{data.mustWatchCount}
                            <span className="text-2xl text-gray-500 font-medium ml-2">선정</span>
                        </span>
                    </div>
                    <div className="absolute bottom-4 right-4 w-20 h-20 opacity-40 group-hover:opacity-60 transition-opacity">
                        <Image
                            src="/dot-badge-clean2.png"
                            alt="Dotchelin Badge"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
                    <div>
                        <span className="text-gray-400 font-medium block mb-2">전체 평균 평점</span>
                        <span className="text-5xl font-black text-white">
                            {(Object.entries(data.ratingDist).reduce((acc, [r, c]) => acc + Number(r) * c, 0) / (data.totalCount || 1)).toFixed(1)}
                            <span className="text-2xl text-gray-500 font-medium ml-2">점</span>
                        </span>
                    </div>
                    <FaStar size={64} className="absolute bottom-4 right-4 text-white/10 group-hover:text-white/20 transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Distribution (Wider) */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <FaStar className="text-yellow-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">평점 분포도</h3>
                    </div>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center gap-4 group">
                                <span className="w-8 text-lg font-bold text-gray-400 group-hover:text-white transition-colors">{rating}점</span>
                                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 ease-out",
                                            rating >= 4 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/30"
                                        )}
                                        style={{ width: `${((data.ratingDist[rating] || 0) / (maxRatingCount || 1)) * 100}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right font-medium text-gray-500 group-hover:text-white transition-colors">{data.ratingDist[rating] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Tags (Narrower) */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-padot-blue-500/20 rounded-lg">
                            <FaHashtag className="text-padot-blue-400 w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">인기 키워드</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.topTags.map((tag, idx) => (
                            <div key={tag.name} className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                                idx < 3 ? "bg-white/10 hover:bg-white/20 border border-white/10" : "bg-black/20 text-gray-400 hover:text-white"
                            )}>
                                <span className="text-sm font-medium">{tag.name}</span>
                                <span className="text-xs opacity-50">{tag.count}</span>
                            </div>
                        ))}
                        {data.topTags.length === 0 && (
                            <p className="text-gray-500 text-sm">데이터가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

