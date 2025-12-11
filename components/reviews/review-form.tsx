
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
import { Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReviewStore } from "@/store/use-review-store";
import { useCalendarStore } from "@/store/use-calendar-store";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
    movie?: TMDBMovieSearchResult;
    initialData?: ReviewFormValues & { id: string };
    onCancel?: () => void;
    backLink?: string;
    availableTags?: { id: string; name: string; color?: string | null }[];
    isManualMode?: boolean;
}

const DEFAULT_TAGS: { id: string; name: string; color?: string | null }[] = [];

export function ReviewForm({ movie, initialData, onCancel, backLink, availableTags: initialAvailableTags = DEFAULT_TAGS, isManualMode = false }: ReviewFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color?: string | null }[]>(initialAvailableTags);
    // Split input state
    const [intVal, setIntVal] = useState("0");
    const [decVal, setDecVal] = useState("0");
    const intRef = useRef<HTMLInputElement>(null);
    const decRef = useRef<HTMLInputElement>(null);

    // Zustand Store
    const { setDraft, removeDraft } = useReviewStore((state) => state.actions);

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

    // Sync rating input with form value (e.g. when clicking stars)
    // Sync rating input with form value (e.g. when clicking stars)
    const ratingValue = watch("rating");
    useEffect(() => {
        // Sync local spread inputs when form rating changes externally
        if (typeof ratingValue === 'number') {
            const [i, d] = ratingValue.toFixed(1).split('.');
            if (intVal !== i) setIntVal(i);
            if (decVal !== d) setDecVal(d);
        }
    }, [ratingValue]); // Remove intVal/decVal dependancy to avoid loops if we add them to dep array, but simple useEffect is safe.

    // Fetch details (Director) and Tags on mount
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            const shouldFetchDirector = !isEditMode && movie?.id;
            const shouldFetchTags = initialAvailableTags.length === 0;

            if (!shouldFetchDirector && !shouldFetchTags) {
                // If props provided ensure state matches
                if (initialAvailableTags.length > 0) {
                    setAvailableTags(initialAvailableTags);
                }
                return;
            }

            try {
                const [movieData, tagRes] = await Promise.all([
                    shouldFetchDirector ? getMovieDetails(movie!.id) : Promise.resolve(null),
                    shouldFetchTags ? getTagsAction() : Promise.resolve(null)
                ]);

                if (!isMounted) return;

                // Batch Updates
                if (tagRes && tagRes.success && tagRes.data) {
                    setAvailableTags(tagRes.data);
                } else if (!shouldFetchTags) {
                    setAvailableTags(initialAvailableTags);
                }

                if (movieData) {
                    const director = movieData.credits?.crew?.find((p: any) => p.job === "Director");
                    if (director) {
                        setValue("director", director.name);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [movie?.id, setValue, isEditMode, initialAvailableTags]);

    const handleTagDelete = (deletedTagId: string) => {
        setAvailableTags(prev => prev.filter(tag => tag.id !== deletedTagId));
    };

    const handleTagCreate = (newTag: { id: string; name: string; color?: string | null }) => {
        setAvailableTags(prev => [...prev, newTag]);
    };

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
            useCalendarStore.getState().actions.invalidateCache();
            // If edit, redirect to detail page (res.reviewId might not be returned in update, but we have initialData.id)
            const targetId = isEditMode ? initialData?.id : res.reviewId;

            setTimeout(() => {
                if (!isEditMode && movie?.id) {
                    removeDraft(movie.id);
                }
                router.push(`/reviews/${targetId}`);
            }, 0);
        }
    };

    const isTitleEditable = isManualMode;

    return (
        <div className="relative">
            {/* Cinematic Backdrop - Fixed & Pointer Events None */}
            {displayPoster && (
                <div className="fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none opacity-0">
                    {/* 
                        Keeping the structure but hidden/removed as Zen Mode is gone. 
                        If we want to remove the backdrop entirely, we can just delete this block. 
                        For now, removing the block entirely is cleaner as per request. 
                     */}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="pb-20 max-w-4xl mx-auto space-y-8 w-full">

                {/* Header: Selected Movie Info & Director */}
                <div className="flex gap-8 items-end mb-8">
                    <div className="relative flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10 group w-32 h-48">
                        {displayPoster ? (
                            <Image
                                src={displayPoster}
                                alt={displayTitle}
                                fill
                                sizes="128px"
                                priority
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-500 flex-col gap-2 p-2 text-center">
                                <span>No Poster</span>
                            </div>
                        )}
                    </div>
                    {/* Fixed: Conditional flex-1 to allow centering in ZenMode */}
                    <div className="space-y-4 pb-2 flex-1">
                        <div>
                            {isTitleEditable ? (
                                <input
                                    {...register("title")}
                                    placeholder="작품명을 입력하세요"
                                    className="w-full bg-transparent border-b !border-gray-400 dark:!border-border py-2 text-4xl font-bold text-foreground mb-2 tracking-tight focus:outline-none focus:!border-primary placeholder:text-muted-foreground"
                                />
                            ) : (
                                <h2 className="text-4xl font-bold text-foreground mb-2 tracking-tight">{displayTitle}</h2>
                            )}

                            <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                {releaseYear && !isManualMode && (
                                    <>
                                        <span>{releaseYear}</span>
                                        <span className="w-1 h-1 rounded-full bg-black dark:bg-gray-600" />
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-padot-blue-500 hover:text-padot-blue-600 dark:text-padot-blue-400 dark:hover:text-padot-blue-300 underline underline-offset-4 transition-colors"
                                >
                                    {isEditMode ? "취소하고 돌아가기" : "다른 영화 검색하기"}
                                </button>
                            </div>
                            {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        {/* Director Field */}
                        <div className="max-w-xs">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5 block">Director</label>
                            <input
                                {...register("director")}
                                readOnly={!isManualMode}
                                placeholder={isManualMode ? "감독 이름을 입력하세요(선택)" : ""}
                                className={`w-full bg-transparent border-b !border-gray-400 dark:!border-border py-2 text-foreground/90 text-lg font-medium focus:outline-none transition-colors uppercase ${isManualMode
                                    ? "cursor-text focus:!border-primary placeholder:text-muted-foreground"
                                    : "cursor-default border-transparent !border-transparent"
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-12 border-t border-gray-200 dark:border-border pt-12 max-w-4xl">
                    {/* Rating & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-base font-semibold text-muted-foreground">나의 평점</label>
                            <div className="flex items-center gap-4">
                                {/* Fixed width container based input for score */}
                                {/* Fixed width container based input for score */}
                                <div className="flex items-baseline text-4xl font-bold text-foreground tabular-nums tracking-tighter">
                                    <input
                                        ref={intRef}
                                        type="text"
                                        inputMode="decimal"
                                        value={intVal}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            let val = e.target.value;

                                            // Smart Overwrite Logic:
                                            // If length > 1, assume user typed a new digit to replace the old one
                                            // e.g. "3" -> typed "4" -> "34" or "43" -> we want "4"
                                            if (val.length > 1) {
                                                // If we can identify the new char, use it.
                                                // Fallback: take the last character typed (usually at end)
                                                // But simpler: just take the LAST character if it's a digit
                                                const lastChar = val.slice(-1);
                                                if (/^[0-5]$/.test(lastChar)) {
                                                    val = lastChar;
                                                } else {
                                                    // If last char invalid, maybe first char?
                                                    // Let's just try to parse the 'new' digit via standard behavior
                                                    // Actually, straightforward 'replace' might be safer?
                                                    // val.replace(intVal, '') ???
                                                    // IF intVal is '3' and input is '33', replace gives '3'.
                                                    // IF intVal is '3' and input is '34', replace gives '4'.
                                                    // IF intVal is '3' and input is '43', replace gives '4'.
                                                    const replaced = val.replace(intVal, '');
                                                    if (/^[0-5]$/.test(replaced)) val = replaced;
                                                    else val = val.slice(-1); // Fallback
                                                }
                                            }

                                            if (!/^[0-5]?$/.test(val)) return;

                                            if (val.length === 1) {
                                                setIntVal(val);

                                                // Logic: If 5, Decimal must be 0
                                                // Otherwise KEEP existing decimal
                                                let newDec = decVal;
                                                if (val === '5') {
                                                    newDec = '0';
                                                    setDecVal('0');
                                                }

                                                // Update Form
                                                const num = parseFloat(`${val}.${newDec}`);
                                                if (!isNaN(num)) setValue("rating", num);

                                                // Auto-focus decimal
                                                decRef.current?.focus();
                                            } else {
                                                setIntVal("");
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowRight') {
                                                e.preventDefault();
                                                decRef.current?.focus();
                                            }
                                        }}
                                        className="w-[1ch] text-right bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground caret-primary selection:bg-primary/20"
                                        placeholder="0"
                                    />
                                    <span className="text-muted-foreground/50 mx-[1px]">.</span>
                                    <input
                                        ref={decRef}
                                        type="text"
                                        inputMode="decimal"
                                        value={decVal}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => {
                                            let val = e.target.value;

                                            // Smart Overwrite Logic for Decimal
                                            if (val.length > 1) {
                                                const replaced = val.replace(decVal, '');
                                                if (/^[0-9]$/.test(replaced)) val = replaced;
                                                else val = val.slice(-1);
                                            }

                                            if (!/^[0-9]?$/.test(val)) return;

                                            if (val.length === 1) {
                                                if (intVal === '5' && val !== '0') return;

                                                setDecVal(val);

                                                const num = parseFloat(`${intVal || 0}.${val}`);
                                                if (!isNaN(num)) setValue("rating", num);
                                            } else {
                                                setDecVal("");
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            // Backspace on empty or containing value? 
                                            // User request: "Erase decimal -> go to int"
                                            // If I backspace on "5", it becomes "". Then next backspace goes to int?
                                            // Or backspace on "5" directly goes to int?
                                            // Standard: Backspace deletes char. empty -> backspace -> move focus.
                                            if (e.key === 'Backspace' && decVal === '') {
                                                e.preventDefault();
                                                intRef.current?.focus();
                                            }
                                            if (e.key === 'ArrowLeft') {
                                                e.preventDefault();
                                                intRef.current?.focus();
                                            }
                                        }}
                                        className="w-[1ch] text-left bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground caret-primary selection:bg-primary/20"
                                        placeholder="0"
                                    />
                                </div>
                                <StarRating
                                    rating={watch("rating")}
                                    onChange={(val) => setValue("rating", val)}
                                    readonly={false}
                                    size={32}
                                    className="gap-1 relative z-0"
                                />
                            </div>
                            {errors.rating && <p className="text-red-500 dark:text-red-400 text-sm">{errors.rating.message}</p>}
                        </div>

                        <div className="space-y-4">
                            <label className="text-base font-semibold text-muted-foreground">시청 날짜</label>
                            <input
                                type="date"
                                {...register("watchedAt", { valueAsDate: true })}
                                className="w-full bg-transparent border-b !border-gray-400 dark:!border-border py-3 text-xl text-foreground focus:outline-none focus:!border-primary transition-colors [color-scheme:light] dark:[color-scheme:dark] font-medium"
                            />
                            {errors.watchedAt && <p className="text-red-500 dark:text-red-400 text-sm">{errors.watchedAt.message}</p>}
                        </div>
                    </div>

                    {/* One Liner */}
                    <div className="space-y-4">
                        <label className="text-base font-semibold text-muted-foreground">한줄평</label>
                        <input
                            {...register("oneLiner")}
                            className="w-full bg-transparent border-b !border-gray-400 dark:!border-border py-3 text-xl text-foreground focus:outline-none focus:!border-primary transition-colors placeholder:text-muted-foreground font-light"
                        />
                        {errors.oneLiner && <p className="text-red-400 text-sm">{errors.oneLiner.message}</p>}
                    </div>

                    {/* Tags (New Linear-style Picker) */}
                    <div className="space-y-1">
                        <div className="py-1">
                            <label className="text-base font-semibold text-muted-foreground">태그</label>
                        </div>
                        <TagPicker
                            selectedTags={watch("tags")}
                            onTagsChange={(tags) => setValue("tags", tags)}
                            availableTags={availableTags}
                            onTagDelete={handleTagDelete}
                            onTagCreate={handleTagCreate}
                        />
                    </div>

                    {/* Content - Tiptap */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-semibold text-muted-foreground">상세 리뷰</label>
                        </div>
                        <ReviewEditor
                            content={watch("content")}
                            onChange={(val) => setValue("content", val)}
                            placeholder="자유롭게 감상평을 작성해주세요."
                        />
                        {errors.content && <p className="text-red-400 text-sm">{errors.content.message}</p>}
                    </div>

                    {/* Dotchelin Badge Toggle */}
                    <div className={cn(
                        "flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500",
                        watch("isMustWatch")
                            ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30"
                            : "glass-card hover:bg-muted/50"
                    )}>
                        <div className="relative w-9 h-9 flex-shrink-0">
                            <Image
                                src="/dot-badge-clean2.webp"
                                alt="Dotchelin"
                                fill
                                sizes="36px"
                                className={`object-contain transition-all duration-500 ${watch("isMustWatch") ? "scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "opacity-30 grayscale"}`}
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="isMustWatch" className="block text-foreground font-bold text-xl cursor-pointer select-none mb-1">
                                닷슐랭 인증
                            </label>
                            <p className="text-sm text-muted-foreground">페닷이 인증하는 맛있는 송충이 인증 마크</p>
                        </div>

                        {/* iOS style toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="isMustWatch"
                                {...register("isMustWatch")}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
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
                            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-foreground text-background px-8 py-3 rounded-full font-bold hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
