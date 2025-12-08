import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReviewFormValues } from '@/lib/validations/review';

type ReviewDraft = Partial<ReviewFormValues>;

interface ReviewStore {
    drafts: Record<number, ReviewDraft>;
    setDraft: (tmdbId: number, data: ReviewDraft) => void;
    removeDraft: (tmdbId: number) => void;
    clearAllDrafts: () => void;
}

export const useReviewStore = create<ReviewStore>()(
    persist(
        (set) => ({
            drafts: {},
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
        }),
        {
            name: 'review-drafts', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
