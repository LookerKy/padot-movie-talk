"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, setMonth, setYear, startOfDay, endOfDay, areIntervalsOverlapping } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2, Plus } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CalendarEventDisplay } from "@/app/actions/calendar";
import { AddScheduleModal } from "./add-schedule-modal";
import { EventDetailModal } from "./event-detail-modal";
import { DailyWatchModal } from "./daily-watch-modal";
import { useCalendarStore } from "@/store/use-calendar-store";
import type { SessionUser } from "@/lib/auth";

interface MonthViewProps {
    user?: SessionUser;
}

const SCREENING_TAG_LIMIT = 3;
const WATCHED_TAG_LIMIT = 2;

const eventTagPalettes = [
    {
        chip: "border-sky-200/80 bg-sky-50/80 text-sky-950 shadow-sky-500/5 hover:bg-sky-100 dark:border-sky-300/20 dark:bg-sky-300/10 dark:text-sky-50 dark:hover:bg-sky-300/15",
        accent: "bg-sky-400 dark:bg-sky-300",
    },
    {
        chip: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950 shadow-emerald-500/5 hover:bg-emerald-100 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-50 dark:hover:bg-emerald-300/15",
        accent: "bg-emerald-400 dark:bg-emerald-300",
    },
    {
        chip: "border-amber-200/80 bg-amber-50/80 text-amber-950 shadow-amber-500/5 hover:bg-amber-100 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-50 dark:hover:bg-amber-300/15",
        accent: "bg-amber-400 dark:bg-amber-300",
    },
    {
        chip: "border-violet-200/80 bg-violet-50/80 text-violet-950 shadow-violet-500/5 hover:bg-violet-100 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-50 dark:hover:bg-violet-300/15",
        accent: "bg-violet-400 dark:bg-violet-300",
    },
    {
        chip: "border-cyan-200/80 bg-cyan-50/80 text-cyan-950 shadow-cyan-500/5 hover:bg-cyan-100 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15",
        accent: "bg-cyan-400 dark:bg-cyan-300",
    },
    {
        chip: "border-lime-200/80 bg-lime-50/80 text-lime-950 shadow-lime-500/5 hover:bg-lime-100 dark:border-lime-300/20 dark:bg-lime-300/10 dark:text-lime-50 dark:hover:bg-lime-300/15",
        accent: "bg-lime-400 dark:bg-lime-300",
    },
    {
        chip: "border-teal-200/80 bg-teal-50/80 text-teal-950 shadow-teal-500/5 hover:bg-teal-100 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-50 dark:hover:bg-teal-300/15",
        accent: "bg-teal-400 dark:bg-teal-300",
    },
    {
        chip: "border-indigo-200/80 bg-indigo-50/80 text-indigo-950 shadow-indigo-500/5 hover:bg-indigo-100 dark:border-indigo-300/20 dark:bg-indigo-300/10 dark:text-indigo-50 dark:hover:bg-indigo-300/15",
        accent: "bg-indigo-400 dark:bg-indigo-300",
    },
    {
        chip: "border-orange-200/80 bg-orange-50/80 text-orange-950 shadow-orange-500/5 hover:bg-orange-100 dark:border-orange-300/20 dark:bg-orange-300/10 dark:text-orange-50 dark:hover:bg-orange-300/15",
        accent: "bg-orange-300 dark:bg-orange-200",
    },
];

const sectionStyles = {
    screening: {
        accent: "bg-sky-500 dark:bg-sky-300",
        label: "text-sky-800 dark:text-sky-100",
        count: "border-sky-200/70 bg-sky-50 text-sky-800 dark:border-sky-300/20 dark:bg-sky-300/10 dark:text-sky-100",
    },
    watched: {
        accent: "bg-violet-400 dark:bg-violet-300",
        label: "text-violet-800 dark:text-violet-100",
        count: "border-violet-200/70 bg-violet-50 text-violet-800 dark:border-violet-300/20 dark:bg-violet-300/10 dark:text-violet-100",
    },
} as const;

function getEventPalette(id: string) {
    let hash = 0;

    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return eventTagPalettes[Math.abs(hash) % eventTagPalettes.length];
}

function sortCalendarEvents(a: CalendarEventDisplay, b: CalendarEventDisplay) {
    const startA = new Date(a.startDate).getTime();
    const startB = new Date(b.startDate).getTime();

    if (startA !== startB) {
        return startA - startB;
    }

    const durationA = new Date(a.endDate).getTime() - startA;
    const durationB = new Date(b.endDate).getTime() - startB;

    if (durationA !== durationB) {
        return durationB - durationA;
    }

    return a.title.localeCompare(b.title, "ko");
}

export function MonthView({ user }: MonthViewProps) {
    // Zustand Store
    const currentDate = useCalendarStore((state) => state.currentDate);
    const eventsCache = useCalendarStore((state) => state.eventsCache);
    const isLoading = useCalendarStore((state) => state.isLoading);

    const { setCurrentDate, fetchEvents, invalidateCache } = useCalendarStore((state) => state.actions);

    // Get events for current month from cache
    // Key format must match store logic: "yyyy-MM"
    const currentMonthKey = format(currentDate, "yyyy-MM");
    const events = eventsCache[currentMonthKey] ?? [];

    // Local Modal States (UI only)
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventDisplay | null>(null);

    const [isDailyWatchOpen, setIsDailyWatchOpen] = useState(false);
    const [dailyWatchDate, setDailyWatchDate] = useState<Date | undefined>(undefined);

    const [editModeData, setEditModeData] = useState<CalendarEventDisplay | undefined>(undefined);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    // --- Navigation Handlers ---
    const handleYearSelect = (value: string) => {
        setCurrentDate(setYear(currentDate, Number(value)));
    };

    const handleMonthSelect = (value: string) => {
        setCurrentDate(setMonth(currentDate, Number(value)));
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchEvents(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate, fetchEvents]);

    // Generate Year Options (2025 - 2030)
    const years = Array.from({ length: 6 }, (_, i) => 2025 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    const visibleEvents = events
        .filter(event => new Date(event.startDate) <= endDate && new Date(event.endDate) >= startDate)
        .sort(sortCalendarEvents);

    const handleDateClick = (day: Date) => {
        if (user?.role === "ADMIN") {
            setSelectedDate(day);
            setEditModeData(undefined);
            setIsAddScheduleOpen(true);
            return;
        }

        setDailyWatchDate(day);
        setIsDailyWatchOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: CalendarEventDisplay) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setIsEventDetailOpen(true);
    };

    const handleEditEvent = (event: CalendarEventDisplay) => {
        setEditModeData(event);
        setIsAddScheduleOpen(true);
    };

    const getDayEvents = (day: Date) => {
        const dayInterval = { start: startOfDay(day), end: endOfDay(day) };

        return {
            screeningEvents: visibleEvents.filter(event => {
                if (event.type === "WATCHED") return false;

                const eventInterval = {
                    start: startOfDay(new Date(event.startDate)),
                    end: endOfDay(new Date(event.endDate)),
                };

                return areIntervalsOverlapping(dayInterval, eventInterval);
            }),
            watchedEvents: visibleEvents.filter(event =>
                event.type === "WATCHED" && isSameDay(day, new Date(event.startDate))
            ),
        };
    };

    const openDaySummary = (e: React.MouseEvent, day: Date) => {
        e.stopPropagation();
        setDailyWatchDate(day);
        setIsDailyWatchOpen(true);
    };

    const getEventDateLabel = (event: CalendarEventDisplay) => {
        if (event.type === "WATCHED") {
            return `${format(new Date(event.startDate), "M월 d일")} 닷네티의 날`;
        }

        return `${format(new Date(event.startDate), "M월 d일")} - ${format(new Date(event.endDate), "M월 d일")}`;
    };

    const renderEventTag = (event: CalendarEventDisplay, day: Date, variant: "screening" | "watched") => {
        const isScreening = variant === "screening";
        const palette = getEventPalette(`${variant}-${event.id}`);

        return (
            <Tooltip key={`${variant}-${event.id}`}>
                <TooltipTrigger
                    type="button"
                    onClick={(e) => {
                        if (isScreening) {
                            handleEventClick(e, event);
                            return;
                        }

                        openDaySummary(e, day);
                    }}
                    className={cn(
                        badgeVariants({ variant: "outline" }),
                        "h-5 max-w-full min-w-0 justify-start gap-1.5 rounded-md px-1.5 py-0 text-[10px] font-bold leading-none shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                        "focus-visible:ring-2 focus-visible:ring-ring/40",
                        palette.chip
                    )}
                >
                    <span className={cn("size-1.5 shrink-0 rounded-full", palette.accent)} />
                    <span className="min-w-0 truncate">{event.title}</span>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{event.title}</span>
                        <span className="text-[11px] opacity-80">{getEventDateLabel(event)}</span>
                    </div>
                </TooltipContent>
            </Tooltip>
        );
    };

    const renderEventSection = (
        day: Date,
        label: string,
        events: CalendarEventDisplay[],
        limit: number,
        variant: "screening" | "watched"
    ) => {
        if (events.length === 0) return null;

        const visibleDayEvents = events.slice(0, limit);
        const hiddenCount = events.length - visibleDayEvents.length;
        const sectionStyle = sectionStyles[variant];

        return (
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-1">
                    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-[10px] font-black tracking-wide", sectionStyle.label)}>
                        <span className={cn("h-3 w-0.5 shrink-0 rounded-full", sectionStyle.accent)} />
                        <span className="truncate">{label}</span>
                    </span>
                    <span
                        className={cn(
                            badgeVariants({ variant: "outline" }),
                            "h-4 shrink-0 rounded px-1.5 py-0 text-[9px] font-bold leading-none",
                            sectionStyle.count
                        )}
                    >
                        {events.length}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {visibleDayEvents.map(event => renderEventTag(event, day, variant))}
                    {hiddenCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger
                                type="button"
                                onClick={(e) => openDaySummary(e, day)}
                                className={cn(
                                    badgeVariants({ variant: "outline" }),
                                    "h-5 rounded-md border-dashed bg-background/60 px-1.5 py-0 text-[10px] font-bold leading-none text-muted-foreground hover:border-primary/50 hover:text-primary dark:bg-white/5"
                                )}
                            >
                                +{hiddenCount}
                            </TooltipTrigger>
                            <TooltipContent sideOffset={6}>
                                {label} {hiddenCount}개 더 보기
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        );
    };

    const renderDayEvents = (day: Date) => {
        const { screeningEvents, watchedEvents } = getDayEvents(day);

        if (screeningEvents.length === 0 && watchedEvents.length === 0) {
            return null;
        }

        return (
            <div className="mt-2 flex flex-col gap-2">
                {renderEventSection(
                    day,
                    "상영일정",
                    screeningEvents,
                    SCREENING_TAG_LIMIT,
                    "screening"
                )}
                {renderEventSection(
                    day,
                    "닷네티의 날",
                    watchedEvents,
                    WATCHED_TAG_LIMIT,
                    "watched"
                )}
            </div>
        );
    };

    // Handlers for Cache Invalidation
    // Handlers
    const handleCloseAddModal = () => {
        setIsAddScheduleOpen(false);
        // Do NOT refetch here anymore. Handled by onSuccess.
    };

    const handleSuccessAddModal = () => {
        setIsAddScheduleOpen(false);
        invalidateCache();
        fetchEvents(currentDate.getFullYear(), currentDate.getMonth());
    };

    const handleEventDeleted = () => {
        setIsEventDetailOpen(false);
        invalidateCache();
        fetchEvents(currentDate.getFullYear(), currentDate.getMonth());
    };

    const handleEventDetailClose = () => {
        setIsEventDetailOpen(false);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Date Navigation */}
                {/* Date Navigation */}
                <div className="relative flex items-center gap-1 rounded-2xl border border-border bg-background p-1 shadow-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={prevMonth}
                        aria-label="이전 달"
                        className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft size={17} />
                    </Button>

                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 min-w-[94px] rounded-xl border-border bg-background px-3 text-base font-black text-foreground shadow-none hover:bg-accent"
                                >
                                    {currentDate.getFullYear()}년
                                    <ChevronDown size={14} className="ml-1.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                className="calendar-select-menu min-w-[132px] rounded-xl"
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    년도 선택
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                    value={String(currentDate.getFullYear())}
                                    onValueChange={handleYearSelect}
                                >
                                    <DropdownMenuGroup>
                                        {years.map(year => (
                                            <DropdownMenuRadioItem
                                                key={year}
                                                value={String(year)}
                                                className="cursor-pointer rounded-lg font-medium"
                                            >
                                                {year}년
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-9 min-w-[72px] rounded-xl border-border bg-background px-3 text-base font-black text-foreground shadow-none hover:bg-accent"
                                >
                                    {currentDate.getMonth() + 1}월
                                    <ChevronDown size={14} className="ml-1.5 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="center"
                                className="calendar-select-menu min-w-[116px] rounded-xl"
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    월 선택
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                    value={String(currentDate.getMonth())}
                                    onValueChange={handleMonthSelect}
                                >
                                    <DropdownMenuGroup>
                                        {months.map(month => (
                                            <DropdownMenuRadioItem
                                                key={month}
                                                value={String(month)}
                                                className="cursor-pointer rounded-lg font-medium"
                                            >
                                                {month + 1}월
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={nextMonth}
                        aria-label="다음 달"
                        className="size-9 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                        <ChevronRight size={17} />
                    </Button>

                    {isLoading && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-primary" />
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {/* Admin 'Add Schedule' Button */}
                    {user?.role === "ADMIN" && (
                        <div className="flex p-1 bg-muted rounded-lg border border-border">
                            <button
                                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 bg-background text-primary shadow-sm hover:brightness-95"
                                onClick={() => {
                                    setSelectedDate(new Date());
                                    setEditModeData(undefined);
                                    setIsAddScheduleOpen(true);
                                }}
                            >
                                <Plus size={14} />
                                시네티 일정 추가
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                        <span className={cn("inline-flex items-center gap-1.5", sectionStyles.screening.label)}>
                            <span className={cn("h-3 w-0.5 rounded-full", sectionStyles.screening.accent)} />
                            상영일정
                        </span>
                        <span className="h-3 w-px bg-border" />
                        <span className={cn("inline-flex items-center gap-1.5", sectionStyles.watched.label)}>
                            <span className={cn("h-3 w-0.5 rounded-full", sectionStyles.watched.accent)} />
                            닷네티의 날
                        </span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="glass gap-0 overflow-hidden p-0 py-0 shadow-sm" data-size="sm">
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center">
                        {["일", "월", "화", "수", "목", "금", "토"].map(day => (
                            <div key={day} className="py-3 text-sm font-semibold text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-[minmax(158px,auto)]">
                        {calendarDays.map((day) => (
                            <div
                                key={day.toISOString()}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    "relative border-b border-r border-border/50 p-2 transition-colors",
                                    user?.role === "ADMIN" && "cursor-pointer hover:bg-accent/50",
                                    !isSameMonth(day, monthStart) && "bg-muted/10 text-muted-foreground/50"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <span className={cn(
                                        "relative inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                                        isSameDay(day, new Date())
                                            ? "bg-primary text-primary-foreground"
                                            : "text-foreground"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                </div>

                                {renderDayEvents(day)}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <AddScheduleModal
                key={selectedDate?.toISOString() + (editModeData?.id || "") + isAddScheduleOpen}
                isOpen={isAddScheduleOpen}
                onClose={handleCloseAddModal}
                onSuccess={handleSuccessAddModal}
                initialDate={selectedDate}
                initialData={editModeData}
            />

            <DailyWatchModal
                isOpen={isDailyWatchOpen}
                onClose={() => setIsDailyWatchOpen(false)}
                date={dailyWatchDate || new Date()}
                title={
                    dailyWatchDate
                        ? format(dailyWatchDate, "M월 d일 일정")
                        : undefined
                }
                emptyMessage="등록된 일정이 없습니다."
                events={
                    dailyWatchDate
                        ? [
                            ...getDayEvents(dailyWatchDate).screeningEvents,
                            ...getDayEvents(dailyWatchDate).watchedEvents,
                        ]
                        : []
                }
            />

            <EventDetailModal
                key={selectedEvent?.id}
                isOpen={isEventDetailOpen}
                onClose={handleEventDetailClose}
                event={selectedEvent}
                isAdmin={user?.role === "ADMIN"}
                onEdit={handleEditEvent}
                onDeleteSuccess={handleEventDeleted}
            />
        </div>
    );
}
