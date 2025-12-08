export interface Tag {
    id: string;
    name: string;
    color?: string | null;
}

export interface Review {
    id: string;
    title: string;
    rating: number;
    tags: Tag[];
    oneLiner: string;
    posterUrl: string | null;
    watchedAt: Date;
    content?: string;
    director?: string | null;
    tmdbId?: number | null;
    isMustWatch?: boolean;
}
