import { create } from 'zustand';
import { CalendarEventDisplay, getCalendarEvents } from '@/app/actions/calendar';
import { format } from 'date-fns';

interface CalendarStore {
    currentDate: Date;
    viewMode: 'SCREENING' | 'WATCHED';
    eventsCache: Record<string, CalendarEventDisplay[]>; // Key: "YYYY-MM"
    isLoading: boolean;

    actions: {
        setCurrentDate: (date: Date) => void;
        setViewMode: (mode: 'SCREENING' | 'WATCHED') => void;
        fetchEvents: (year: number, month: number) => Promise<void>;
        invalidateCache: () => void;
        setDraftSchedule: (draft: Partial<CalendarEventDisplay> | null) => void;
        clearDraftSchedule: () => void;
    };
    draftSchedule: Partial<CalendarEventDisplay> | null;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
    currentDate: new Date(),
    viewMode: 'SCREENING',
    eventsCache: {},
    isLoading: false,
    draftSchedule: null,

    actions: {
        setCurrentDate: (date) => set({ currentDate: date }),
        setViewMode: (mode) => set({ viewMode: mode }),

        fetchEvents: async (year: number, month: number) => {
            // Key format: "2024-11" (month is 0-indexed in JS Date, but let's use 0-indexed for simplicity or standard ISO? 
            // format(new Date(year, month), "yyyy-MM") handles it robustly
            const dateObj = new Date(year, month, 1);
            const cacheKey = format(dateObj, "yyyy-MM");

            const { eventsCache } = get();

            // If cache exists, do nothing (or maybe check timestamp for staleness?)
            // For now, strict caching. Invalidation handles updates.
            if (eventsCache[cacheKey]) {
                return;
            }

            set({ isLoading: true });

            const res = await getCalendarEvents(year, month);

            if (res.success && res.data) {
                set((state) => ({
                    eventsCache: {
                        ...state.eventsCache,
                        [cacheKey]: res.data!
                    },
                    isLoading: false
                }));
            } else {
                set({ isLoading: false });
            }
        },

        invalidateCache: () => {
            set({ eventsCache: {} });
        },

        setDraftSchedule: (draft) => set({ draftSchedule: draft }),
        clearDraftSchedule: () => set({ draftSchedule: null }),
    }
}));

// Helper hook to access state and actions separately if needed, 
// or just export the store hook directly.
export const useCalendarActions = () => useCalendarStore((state) => state.actions);
