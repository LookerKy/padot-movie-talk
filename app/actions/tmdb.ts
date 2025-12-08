
"use server";

import { searchMovies, getMovieDetails } from "@/lib/tmdb";

export async function searchMoviesAction(query: string) {
    try {
        const results = await searchMovies(query);
        return { success: true, data: results };
    } catch (error) {
        console.error("TMDB Search Error:", error);
        return { success: false, error: "영화 검색 중 오류가 발생했습니다." };
    }
}

export async function getMovieDetailsAction(id: number) {
    try {
        const details = await getMovieDetails(id);
        if (!details) return { success: false, error: "영화를 찾을 수 없습니다." };
        return { success: true, data: details };
    } catch (error) {
        console.error("TMDB Details Error:", error);
        return { success: false, error: "영화 정보를 불러오는 중 오류가 발생했습니다." };
    }
}
