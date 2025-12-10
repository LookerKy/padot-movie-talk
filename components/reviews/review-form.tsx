
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewFormValues } from "@/lib/validations/review";
import { submitReview, updateReview } from "@/app/actions/review";
import { getMovieDetails } from "@/app/actions/tmdb";
import { getTagsAction } from "@/app/actions/tag";
import { TMDBMovieSearchResult, getPosterUrl } from "@/lib/tmdb";
import { StarRating } from "@/components/ui/star-rating";
import { TagPicker } from "@/components/reviews/tag-picker";
import { ReviewEditor } from "@/components/editor/review-editor";
import { Loader2, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReviewStore } from "@/store/use-review-store";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
    movie?: TMDBMovieSearchResult;
    initialData?: ReviewFormValues & { id: string };
    onCancel?: () => void;
    backLink?: string;
    availableTags?: { id: string; name: string }[];
    isManualMode?: boolean;
}

export function ReviewForm({ movie, initialData, onCancel, backLink, availableTags: initialAvailableTags = [], isManualMode = false }: ReviewFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<{ id: string; name: string }[]>([]);

    // Zustand Store
    const isZenMode = useReviewStore((state) => state.isZenMode);
    const { setDraft, removeDraft, setZenMode } = useReviewStore((state) => state.actions);

    // Reset Zen Mode on unmount
    useEffect(() => {
        return () => setZenMode(false);
    }, [setZenMode]);

    const isEditMode = !!initialData;

    // Derived display info
    const displayTitle = movie?.title || initialData?.title || "";
    const displayPoster = movie?.poster_path
        ? getPosterUrl(movie.poster_path)
        : initialData?.posterUrl || "";
    const releaseYear = movie?.release_date?.split("-")[0] || "";

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else if (backLink) {
            router.push(backLink);
        } else {
            router.back();
        }
    };

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema) as any,
        defaultValues: initialData ? {
            ...initialData,
            watchedAt: new Date(initialData.watchedAt).toISOString().split("T")[0] as any,
        } : {
            title: movie?.title || "",
            tmdbId: movie?.id || 0,
            posterUrl: movie?.poster_path ? getPosterUrl(movie.poster_path) : "",
            director: "",
            rating: 0,
            oneLiner: "",
            content: "",
            watchedAt: new Date().toISOString().split("T")[0] as any,
            isMustWatch: false,
            tags: [],
        },
    });

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

    // 0. Restore Draft (Once on mount)
    useEffect(() => {
        if (!isEditMode && movie?.id) {
            const draft = useReviewStore.getState().drafts[movie.id];
            if (draft) {
                // Ensure watchedAt is formatted as YYYY-MM-DD for the input
                const { watchedAt, ...restDraft } = draft;
                let formattedWatchedAt = watchedAt;

                if (watchedAt) {
                    const dateObj = new Date(watchedAt);
                    if (!isNaN(dateObj.getTime())) {
                        formattedWatchedAt = dateObj.toISOString().split("T")[0] as any;
                    }
                }

                reset({
                    title: movie.title || "",
                    tmdbId: movie.id || 0,
                    posterUrl: movie.poster_path ? getPosterUrl(movie.poster_path) : "",
                    director: "",
                    rating: 0,
                    oneLiner: "",
                    content: "",
                    watchedAt: formattedWatchedAt || new Date().toISOString().split("T")[0] as any,
                    isMustWatch: false,
                    tags: [],
                    ...restDraft
                });
            }
        }
    }, [movie, isEditMode, reset]);

    // 0.5 Auto-Save Draft
    // 0.5 Auto-Save Draft (Optimized with useRef & Longer Debounce)
    const draftTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isEditMode || !movie?.id) return;

        const subscription = watch((value) => {
            // Clear existing timer if values change before timeout
            if (draftTimerRef.current) {
                clearTimeout(draftTimerRef.current);
            }

            // Set new timer
            draftTimerRef.current = setTimeout(() => {
                if (movie.id) {
                    setDraft(movie.id, value as any);
                }
            }, 2000); // Increased from 1000ms to 2000ms to reduce store updates
        });

        return () => {
            subscription.unsubscribe();
            if (draftTimerRef.current) {
                clearTimeout(draftTimerRef.current);
            }
        };
    }, [watch, isEditMode, movie?.id, setDraft]);

    // Fetch details (Director) and Tags on mount
    useEffect(() => {
        async function fetchData() {
            // 1. Fetch Director (Only in Create Mode using Movie ID)
            if (!isEditMode && movie?.id) {
                try {
                    const data = await getMovieDetails(movie.id);
                    if (data) {
                        const director = data.credits?.crew?.find((p: any) => p.job === "Director");
                        if (director) {
                            setValue("director", director.name);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch director:", error);
                }
            }

            // 2. Fetch Tags (Only if not provided as prop)
            if (initialAvailableTags.length === 0) {
                const tagRes = await getTagsAction();
                if (tagRes.success && tagRes.data) {
                    setAvailableTags(tagRes.data);
                }
            }
        }
        fetchData();
    }, [movie?.id, setValue, isEditMode, initialAvailableTags.length]);

    const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
        setIsSubmitting(true);
        setServerError(null);

        let res;

        if (isEditMode && initialData) {
            res = await updateReview(initialData.id, data);
        } else {
            res = await submitReview(data);
        }

        if (res && !res.success) {
            setServerError(res.error || "알 수 없는 에러가 발생했습니다.");
            setIsSubmitting(false);
        } else if (res && res.success) {
            // Success! 
            // If edit, redirect to detail page (res.reviewId might not be returned in update, but we have initialData.id)
            const targetId = isEditMode ? initialData?.id : res.reviewId;

            setTimeout(() => {
                if (!isEditMode && movie?.id) {
                    removeDraft(movie.id);
                }
                router.push(`/reviews/${targetId}`);
                router.refresh();
            }, 0);
        }
    };

    const isTitleEditable = isManualMode;

    return (
        <div className="relative">
            {/* Zen Mode Toggle (Floating) - Moved outside form to avoid transform stacking context issues */}
            <div className={cn("fixed z-[101]", isZenMode ? "top-8 right-8" : "top-24 right-8")}>
                <button
                    type="button"
                    onClick={() => setZenMode(!isZenMode)}
                    className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hover:scale-110"
                    title={isZenMode ? "일반 모드로 복귀" : "작성 집중 모드 (Zen Mode)"}
                >
                    {isZenMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
            </div>

            {/* Cinematic Backdrop - Fixed & Pointer Events None */}
            {displayPoster && (
                <div className={cn(
                    "fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none",
                    isZenMode ? "opacity-30 blur-sm" : "opacity-0"
                )}>
                    <Image
                        src={displayPoster}
                        alt="Background"
                        fill
                        className="object-cover blur-3xl scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={cn(
                "space-y-8 transition-all duration-700 ease-in-out w-full",
                isZenMode
                    ? "fixed inset-0 z-[100] bg-black/40 backdrop-blur-md overflow-y-auto px-8 py-24 m-0 max-w-none w-screen h-screen"
                    : "pb-20 max-w-4xl mx-auto"
            )}>

                {/* Header: Selected Movie Info & Director */}
                <div className={cn("flex gap-8 items-end transition-all duration-700", isZenMode ? "justify-center opacity-30 hover:opacity-100 mb-16" : "mb-8")}>
                    <div className={cn("relative flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 group transition-all duration-500", isZenMode ? "w-16 h-24" : "w-32 h-48")}>
                        {displayPoster ? (
                            <Image
                                src={displayPoster}
                                alt={displayTitle}
                                fill
                                sizes="128px"
                                priority
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-500 flex-col gap-2 p-2 text-center">
                                <span>No Poster</span>
                            </div>
                        )}
                    </div>
                    {/* Fixed: Conditional flex-1 to allow centering in ZenMode */}
                    <div className={cn("space-y-4 pb-2 transition-all duration-500", isZenMode ? "w-auto min-w-[300px]" : "flex-1")}>
                        <div>
                            {isTitleEditable ? (
                                <input
                                    {...register("title")}
                                    placeholder="작품명을 입력하세요"
                                    className="w-full bg-transparent border-b border-white/20 py-2 text-4xl font-bold text-white mb-2 tracking-tight focus:outline-none focus:border-white/50 placeholder-gray-600"
                                />
                            ) : (
                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{displayTitle}</h2>
                            )}

                            <div className="flex items-center gap-3 text-gray-400 text-sm">
                                {releaseYear && !isManualMode && (
                                    <>
                                        <span>{releaseYear}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-padot-blue-400 hover:text-padot-blue-300 underline underline-offset-4 transition-colors"
                                >
                                    {isEditMode ? "취소하고 돌아가기" : "다른 영화 검색하기"}
                                </button>
                            </div>
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        {/* Director Field */}
                        <div className={cn("max-w-xs", isZenMode ? "" : "")}>
                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5 block">Director</label>
                            <input
                                {...register("director")}
                                readOnly={!isManualMode}
                                placeholder={isManualMode ? "감독 이름을 입력하세요(선택)" : ""}
                                className={`w-full bg-transparent border-b border-white/20 py-2 text-white/90 text-lg font-medium focus:outline-none transition-colors uppercase ${isManualMode
                                    ? "cursor-text focus:border-white/50 placeholder-gray-600"
                                    : "cursor-default border-transparent"
                                    } ${isZenMode ? "" : ""}`}
                            />
                        </div>
                    </div>
                </div>

                <div className={cn("space-y-12 transition-all duration-700 border-t border-white/5 pt-12", isZenMode ? "w-full max-w-6xl mx-auto" : "max-w-4xl")}>
                    {/* Rating & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-base font-semibold text-gray-300">나의 평점</label>
                            <div className="flex items-center gap-4">
                                {/* Fixed width container for score to prevent shifting */}
                                <span className="text-4xl font-bold text-white tabular-nums w-[3ch] text-right">
                                    {(watch("rating") || 0).toFixed(1)}
                                </span>
                                <StarRating
                                    rating={watch("rating")}
                                    onChange={(val) => setValue("rating", val)}
                                    readonly={false}
                                    size={isZenMode ? 32 : 32}
                                    className="gap-1"
                                />
                            </div>
                            {errors.rating && <p className="text-red-400 text-sm">{errors.rating.message}</p>}
                        </div>

                        <div className="space-y-4">
                            <label className="text-base font-semibold text-gray-300">시청 날짜</label>
                            <input
                                type="date"
                                {...register("watchedAt", { valueAsDate: true })}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white focus:outline-none focus:border-white/40 transition-colors [color-scheme:dark] font-medium"
                            />
                            {errors.watchedAt && <p className="text-red-400 text-sm">{errors.watchedAt.message}</p>}
                        </div>
                    </div>

                    {/* One Liner */}
                    <div className="space-y-4">
                        <label className="text-base font-semibold text-gray-300">한줄평</label>
                        <input
                            {...register("oneLiner")}
                            className="w-full bg-transparent border-b border-white/10 py-3 text-xl text-white focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-700 font-light"
                        />
                        {errors.oneLiner && <p className="text-red-400 text-sm">{errors.oneLiner.message}</p>}
                    </div>

                    {/* Tags (New Linear-style Picker) */}
                    <div className="space-y-1">
                        <div className="py-1">
                            <label className="text-base font-semibold text-gray-300">태그</label>
                        </div>
                        <TagPicker
                            selectedTags={watch("tags")}
                            onTagsChange={(tags) => setValue("tags", tags)}
                            availableTags={availableTags}
                        />
                    </div>

                    {/* Content - Tiptap */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-semibold text-gray-300">상세 리뷰</label>
                        </div>
                        <ReviewEditor
                            content={watch("content")}
                            onChange={(val) => setValue("content", val)}
                            placeholder="자유롭게 감상평을 작성해주세요."
                        />
                        {errors.content && <p className="text-red-400 text-sm">{errors.content.message}</p>}
                    </div>

                    {/* Dotchelin Badge Toggle */}
                    <div className={
                        `flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500 ${watch("isMustWatch")
                            ? "bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30"
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`
                    }>
                        <div className="relative w-9 h-9 flex-shrink-0">
                            <Image
                                src="/dot-badge-clean2.png"
                                alt="Dotchelin"
                                fill
                                className={`object-contain transition-all duration-500 ${watch("isMustWatch") ? "scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "opacity-30 grayscale"}`}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="isMustWatch" className="block text-white font-bold text-xl cursor-pointer select-none mb-1">
                                닷슐랭 인증
                            </label>
                            <p className="text-sm text-gray-400">페닷이 인증하는 맛있는 송충이 인증 마크</p>
                        </div>

                        {/* iOS style toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="isMustWatch"
                                {...register("isMustWatch")}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="pt-8 flex items-center justify-end gap-4">
                        {serverError && (
                            <p className="text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {serverError}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    저장 중
                                </>
                            ) : (
                                isEditMode ? "수정 완료" : "리뷰 등록"
                            )}
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
}
