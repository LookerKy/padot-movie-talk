import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReviewFormValues } from '@/lib/validations/review';

type ReviewDraft = Partial<ReviewFormValues>;

interface ReviewStore {
    drafts: Record<number, ReviewDraft>;
    isZenMode: boolean;
    actions: {
        setDraft: (tmdbId: number, data: ReviewDraft) => void;
        removeDraft: (tmdbId: number) => void;
        clearAllDrafts: () => void;
        setZenMode: (isZenMode: boolean) => void;
    };
}

export const useReviewStore = create<ReviewStore>()(
    persist(
        (set) => ({
            drafts: {},
            isZenMode: false,
            actions: {
                setDraft: (tmdbId, data) =>
                    set((state) => ({
                        drafts: {
                            ...state.drafts,
                            [tmdbId]: { ...(state.drafts[tmdbId] || {}), ...data },
                        },
                    })),
                removeDraft: (tmdbId) =>
                    set((state) => {
                        const newDrafts = { ...state.drafts };
                        delete newDrafts[tmdbId];
                        return { drafts: newDrafts };
                    }),
                clearAllDrafts: () => set({ drafts: {} }),
                setZenMode: (isZenMode) => set({ isZenMode }),
            },
        }),
        {
            name: 'review-drafts',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ drafts: state.drafts }), // Only persist drafts
        }
    )
);

export const useReviewActions = () => useReviewStore((state) => state.actions);
