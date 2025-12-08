export interface Review {
    id: string;
    title: string;
    rating: number;
    tags: string[];
    oneLiner: string; // 한줄평
    posterUrl: string;
    watchedAt: string;
}

export const MOCK_REVIEWS: Review[] = [
    {
        id: "1",
        title: "인터스텔라",
        rating: 5,
        tags: ["명작", "송충이", "2회차 쌉가능"],
        oneLiner: "우주를 건너서라도 너를 만나러 갈게. 사랑은 시공간을 초월하니까.",
        posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniL6E77NI6lCU6MxlNBvIx.jpg",
        watchedAt: "2024-12-01",
    },
    {
        id: "2",
        title: "서울의 봄",
        rating: 4.5,
        tags: ["명작", "혈압주의"],
        oneLiner: "실패하면 반역, 성공하면 혁명 아입니까! 심장이 쫄깃해지는 역사적 순간.",
        posterUrl: "https://image.tmdb.org/t/p/w500/5B6MA7XHDOIKMzjNbCCZzp10kpg.jpg",
        watchedAt: "2024-11-28",
    },
    {
        id: "3",
        title: "성냥팔이 소녀의 재림",
        rating: 0.5,
        tags: ["망작", "똥믈리에"],
        oneLiner: "이것은 영화가 아니다. 전설이다... 나쁜 의미로.",
        posterUrl: "https://image.tmdb.org/t/p/w500/1XpW9x3Y4qJ8j2q3.jpg", // Broken link placeholder logic needed if real
        watchedAt: "2024-10-15",
    },
    {
        id: "4",
        title: "기생충",
        rating: 5,
        tags: ["명작", "가족영화(?)"],
        oneLiner: "너는 다 계획이 있구나. 냄새가 선을 넘네.",
        posterUrl: "https://image.tmdb.org/t/p/w500/3TkKUCsDe3cshw7pH76fNf.jpg", // Invalid path logic needed potentially
        watchedAt: "2024-09-10",
    }
];

export interface CalendarEventMock {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    type: "SCREENING" | "WATCHED";
}

export const MOCK_EVENTS: CalendarEventMock[] = [
    {
        id: "e1",
        title: "인터스텔라 (SOOP 상영)",
        startDate: new Date(2025, 11, 5), // Dec 5
        endDate: new Date(2025, 11, 15), // Dec 15
        type: "SCREENING",
    },
    {
        id: "e2",
        title: "서울의 봄 (SOOP 상영)",
        startDate: new Date(2025, 11, 13), // Dec 13
        endDate: new Date(2025, 11, 25), // Dec 25
        type: "SCREENING",
    },
    {
        id: "e3",
        title: "기생충 (SOOP 상영)",
        startDate: new Date(2025, 11, 2), // Dec 2
        endDate: new Date(2025, 11, 8), // Dec 8
        type: "SCREENING",
    },
    {
        id: "e4",
        title: "인터스텔라 (시청)",
        startDate: new Date(2024, 11, 10),
        endDate: new Date(2024, 11, 10),
        type: "WATCHED",
    }
];
