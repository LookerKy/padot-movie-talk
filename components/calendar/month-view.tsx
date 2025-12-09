"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, setMonth, setYear, startOfDay, endOfDay, areIntervalsOverlapping } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Film, Eye, ChevronDown, Loader2, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { CalendarEventDisplay } from "@/app/actions/calendar";
import { AddScheduleModal } from "./add-schedule-modal";
import { EventDetailModal } from "./event-detail-modal";
import { DailyWatchModal } from "./daily-watch-modal";
import { useCalendarStore } from "@/store/use-calendar-store";

interface MonthViewProps {
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
    };
}

export function MonthView({ user }: MonthViewProps) {
    // Zustand Store
    const currentDate = useCalendarStore((state) => state.currentDate);
    const viewMode = useCalendarStore((state) => state.viewMode);
    const eventsCache = useCalendarStore((state) => state.eventsCache);
    const isLoading = useCalendarStore((state) => state.isLoading);

    const { setCurrentDate, setViewMode, fetchEvents, invalidateCache } = useCalendarStore((state) => state.actions);

    // Get events for current month from cache
    // Key format must match store logic: "yyyy-MM"
    const currentMonthKey = format(currentDate, "yyyy-MM");
    const events = eventsCache[currentMonthKey] || [];

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
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchEvents(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate, fetchEvents]);

    // Generate Year Options (2025 - 2030)
    const years = Array.from({ length: 6 }, (_, i) => 2025 + i);
    const months = Array.from({ length: 12 }, (_, i) => i);

    // --- Event Logic ---
    // --- Event Logic ---
    const { visibleEvents, sortedEvents, eventsWithRows } = useMemo(() => {
        // 1. Filter events for this view
        const _visibleEvents = events.filter(event =>
            (new Date(event.startDate) <= endDate && new Date(event.endDate) >= startDate)
        );

        // 2. Sort events
        const _sortedEvents = [..._visibleEvents].sort((a, b) => {
            const startA = new Date(a.startDate).getTime();
            const startB = new Date(b.startDate).getTime();
            if (startA !== startB) {
                return startA - startB;
            }
            const durationA = new Date(a.endDate).getTime() - startA;
            const durationB = new Date(b.endDate).getTime() - startB;
            return durationB - durationA;
        });

        // 3. Assign Rows (Packing) - Only for SCREENING mode
        const _eventsWithRows: (CalendarEventDisplay & { rowIndex: number })[] = [];
        const rowEndDates: number[] = [];

        if (viewMode === "SCREENING") {
            _sortedEvents.forEach(event => {
                if (event.type === "WATCHED") return;

                let rowIndex = 0;
                const eventStart = startOfDay(new Date(event.startDate)).getTime();
                const eventEnd = endOfDay(new Date(event.endDate)).getTime();

                while (true) {
                    const lastEndTime = rowEndDates[rowIndex] || 0;
                    if (eventStart > lastEndTime) {
                        rowEndDates[rowIndex] = eventEnd;
                        _eventsWithRows.push({ ...event, rowIndex });
                        break;
                    }
                    rowIndex++;
                }
            });
        }

        return {
            visibleEvents: _visibleEvents,
            sortedEvents: _sortedEvents,
            eventsWithRows: _eventsWithRows
        };
    }, [events, startDate, endDate, viewMode]);

    const handleDateClick = (day: Date) => {
        if (viewMode === "WATCHED") {
            setDailyWatchDate(day);
            setIsDailyWatchOpen(true);
            return;
        }

        if (user?.role === "ADMIN" && viewMode === "SCREENING") {
            setSelectedDate(day);
            setEditModeData(undefined); // Clear edit data just in case
            setIsAddScheduleOpen(true);
        }
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

    // 4. Render Helper
    const renderDayEvents = (day: Date) => {
        // Mode: SCREENING
        if (viewMode === "SCREENING") {
            const dayEvents = eventsWithRows.filter(event => {
                const eventInterval = { start: new Date(event.startDate), end: new Date(event.endDate) };
                const dayInterval = { start: startOfDay(day), end: endOfDay(day) };

                return areIntervalsOverlapping(dayInterval, eventInterval);
            });

            const slots = [];
            const MAX_SLOTS = 6; // Increased from 3 due to thinner bars. 140px height can fit header + 6 * 18px ~ 130px.

            // Check if we need overflow logic
            // We use packing rowIndex. If any event has rowIndex >= MAX_SLOTS - 1, we must show "+N" in the last slot.
            // Actually, simple count check for THIS DAY is easier for the "+N".
            // But visually, we want to respect the rows.
            // Strategy: Render 0..MAX-2 fully.
            // Slot MAX-1: If there are events in row >= MAX-1, render "+N". Else render row MAX-1.

            const totalDayEvents = dayEvents.length;
            // Find max row index on this day
            const maxRowIndexOnDay = Math.max(...dayEvents.map(e => e.rowIndex), -1);
            const needsOverflow = maxRowIndexOnDay >= MAX_SLOTS;

            // We iterate slots
            for (let i = 0; i < MAX_SLOTS; i++) {
                // Formatting for thinner bars
                const barHeight = "h-[18px]";
                const textSize = "text-[10px]";

                // LAST SLOT LOGIC
                if (i === MAX_SLOTS - 1) {
                    // Check if there are events at this row or deeper
                    const hiddenCount = dayEvents.filter(e => e.rowIndex >= i).length;
                    if (hiddenCount > 0) {
                        slots.push(
                            <div
                                key={`slot-${i}-overflow`}
                                className={`${barHeight} mb-[1px] text-xs flex items-center px-1 text-gray-500 hover:text-padot-blue-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded cursor-pointer transition-colors`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDailyWatchDate(day);
                                    setIsDailyWatchOpen(true);
                                }}
                            >
                                <Plus size={10} className="mr-0.5" />
                                <span>{hiddenCount}개 더보기</span>
                            </div>
                        );
                        break; // Stop rendering
                    }
                }

                const event = dayEvents.find(e => e.rowIndex === i);

                if (event) {
                    const eventStart = new Date(event.startDate);
                    const eventEnd = new Date(event.endDate);
                    const isStart = isSameDay(day, eventStart);
                    const isEnd = isSameDay(day, eventEnd);
                    const isSunday = day.getDay() === 0;
                    const isSaturday = day.getDay() === 6;

                    // Generate consistent color based on event ID
                    let hash = 0;
                    for (let j = 0; j < event.id.length; j++) {
                        hash = event.id.charCodeAt(j) + ((hash << 5) - hash);
                    }
                    const colorIndex = Math.abs(hash) % 8;

                    // Specific color for CINETY events (Admin added)
                    const isCinety = event.type === "CINETY";

                    const colors = [
                        "bg-[#FFB3BA] text-gray-900 border border-red-200",
                        "bg-[#BAFFC9] text-gray-900 border border-green-200",
                        "bg-[#BAE1FF] text-gray-900 border border-blue-200",
                        "bg-[#FFFFBA] text-gray-900 border border-yellow-200",
                        "bg-[#FFDFBA] text-gray-900 border border-orange-200",
                        "bg-[#E0BBE4] text-gray-900 border border-purple-200",
                        "bg-[#957DAD] text-gray-900 border border-indigo-200",
                        "bg-[#D291BC] text-gray-900 border border-pink-200",
                        "bg-teal-100 text-gray-900 border border-teal-200",
                        "bg-cyan-100 text-gray-900 border border-cyan-200",
                        "bg-lime-100 text-gray-900 border border-lime-200",
                        "bg-rose-100 text-gray-900 border border-rose-200",
                    ];

                    const baseColor = colors[colorIndex % colors.length];

                    slots.push(
                        <div
                            key={`slot-${i}-${event.id}`}
                            onClick={(e) => handleEventClick(e, event)}
                            className={cn(
                                `${barHeight} mb-[1px] ${textSize} flex items-center px-1 truncate relative font-medium transition-all hover:brightness-95 hover:scale-[1.01] cursor-pointer`,
                                baseColor,
                                "shadow-sm",
                                // Rounding Logic - Smaller radius for thinner bars
                                isStart && "rounded-l-sm ml-[1px]",
                                isEnd && "rounded-r-sm mr-[1px]",

                                // Continuity Logic
                                !isStart && "rounded-l-none -ml-1 pl-2 border-l-0",
                                !isEnd && "rounded-r-none -mr-1 pr-2 border-r-0",

                                // Week Boundaries
                                !isStart && isSunday && "rounded-l-sm ml-[1px]",
                                !isEnd && isSaturday && "rounded-r-sm mr-[1px]",

                                "z-10"
                            )}
                        >
                            {isStart && (
                                <span className={cn(
                                    "drop-shadow-sm truncate w-full font-bold",
                                    isCinety ? "text-gray-900 font-extrabold" : "text-inherit"
                                )}>{event.title}</span>
                            )}
                        </div>
                    );
                } else {
                    // Empty slot placeholder
                    slots.push(<div key={`slot-${i}-empty`} className={`${barHeight} mb-[1px]`} />);
                }
            }
            return <div className="flex flex-col mt-1 relative">{slots}</div>;
        }

        // Mode: WATCHED
        if (viewMode === "WATCHED") {
            const watchedEvents = visibleEvents.filter(event =>
                event.type === "WATCHED" && isSameDay(day, new Date(event.startDate))
            );

            // Limit to 2 items
            const visibleWatched = watchedEvents.slice(0, 2);
            const hasMore = watchedEvents.length > 2;

            return (
                <div className="flex flex-col gap-0.5 mt-2">
                    {visibleWatched.map(event => (
                        <div key={event.id} className="px-1 py-0.5 text-left truncate flex items-center">
                            <span className="text-[11px] font-medium text-padot-blue-600 dark:text-padot-blue-300 truncate hover:underline">
                                <span className="mr-1 opacity-70">•</span>
                                {event.title}
                            </span>
                        </div>
                    ))}
                    {hasMore && (
                        <div className="px-1 text-[10px] text-gray-400">...</div>
                    )}
                </div>
            );
        }
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

    const handleEventDeleted = (id: string) => {
        setIsEventDetailOpen(false);
        invalidateCache();
        fetchEvents(currentDate.getFullYear(), currentDate.getMonth());
    };

    const handleEventDetailClose = () => {
        setIsEventDetailOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 p-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm relative">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2 px-2">
                        {/* Year Select */}
                        <div className="relative group">
                            <select
                                value={currentDate.getFullYear()}
                                onChange={handleYearChange}
                                className="appearance-none bg-transparent font-bold text-lg text-gray-800 dark:text-gray-100 pr-6 cursor-pointer focus:outline-none"
                            >
                                {years.map(year => (
                                    <option key={year} value={year} className="bg-white dark:bg-gray-900">{year}년</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Month Select */}
                        <div className="relative group">
                            <select
                                value={currentDate.getMonth()}
                                onChange={handleMonthChange}
                                className="appearance-none bg-transparent font-bold text-lg text-gray-800 dark:text-gray-100 pr-6 cursor-pointer focus:outline-none"
                            >
                                {months.map(month => (
                                    <option key={month} value={month} className="bg-white dark:bg-gray-900">{month + 1}월</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <button onClick={nextMonth} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
                        <ChevronRight size={18} />
                    </button>

                    {isLoading && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-padot-blue-500" />
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {/* Admin 'Add Schedule' Button */}
                    {user?.role === "ADMIN" && (
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-white/5">
                            <button
                                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-700 text-padot-blue-600 dark:text-white shadow-sm hover:brightness-95"
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

                    {/* View Mode Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-white/5">
                        <button
                            onClick={() => setViewMode("SCREENING")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                viewMode === "SCREENING"
                                    ? "bg-white dark:bg-gray-700 text-padot-blue-600 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <Film size={14} />
                            상영 일정
                        </button>
                        <button
                            onClick={() => setViewMode("WATCHED")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                viewMode === "WATCHED"
                                    ? "bg-white dark:bg-gray-700 text-padot-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <Eye size={14} />
                            시청 기록
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
                <div className="grid grid-cols-7 text-center border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    {["일", "월", "화", "수", "목", "금", "토"].map(day => (
                        <div key={day} className="py-3 font-semibold text-gray-500 text-sm">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)]">
                    {calendarDays.map((day, idx) => (
                        <div
                            key={day.toISOString()}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "border-b border-r border-gray-100 dark:border-white/5 p-1 transition-colors relative group",
                                // Only hover effect if Admin
                                user?.role === "ADMIN" && "hover:bg-padot-blue-50/30 dark:hover:bg-white/5 cursor-pointer",
                                !isSameMonth(day, monthStart) && "bg-gray-50/30 dark:bg-black/20 text-gray-400"
                            )}
                        >
                            <div className="flex justify-between items-start px-1">
                                <span className={cn(
                                    "text-sm font-medium inline-flex w-7 h-7 items-center justify-center rounded-full z-20 relative",
                                    isSameDay(day, new Date())
                                        ? "bg-padot-blue-500 text-white"
                                        : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            {/* Event Container */}
                            <div className="mt-1">
                                {renderDayEvents(day)}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

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
                        ? format(dailyWatchDate, `M월 d일 ${viewMode === "SCREENING" ? "상영 일정" : "시청 기록"}`)
                        : undefined
                }
                events={
                    dailyWatchDate
                        ? (eventsCache[format(currentDate, "yyyy-MM")] || []).filter(
                            e => {
                                // Filter logic:
                                // If WATCHED: match type WATCHED & date
                                // If SCREENING: match SCREENING/CINETY & interval overlap
                                if (viewMode === "WATCHED") {
                                    return e.type === "WATCHED" && isSameDay(dailyWatchDate, new Date(e.startDate));
                                } else {
                                    const eventInterval = { start: new Date(e.startDate), end: new Date(e.endDate) };
                                    const dayInterval = { start: startOfDay(dailyWatchDate), end: endOfDay(dailyWatchDate) };
                                    return e.type !== "WATCHED" && areIntervalsOverlapping(dayInterval, eventInterval);
                                }
                            }
                        )
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
