import { notFound, redirect } from "next/navigation";
import { ReviewForm } from "@/components/reviews/review-form";
import prisma from "@/lib/db/client";
import { getSession } from "@/lib/auth";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
    const { id } = await params;

    // 1. Auth Check
    const session = await getSession();
    if (!session || !session.user) {
        redirect("/login");
    }

    // 2. Fetch Review
    // 2. Fetch Review & Tags in parallel
    const [review, tags] = await Promise.all([
        prisma.review.findUnique({
            where: { id },
            include: { tags: true }
        }),
        prisma.tag.findMany({ select: { id: true, name: true } })
    ]);

    if (!review) {
        notFound();
    }

    // 3. Ownership Check
    if (review.authorId !== session.user.id) {
        // Optionally show 403 or redirect
        redirect(`/reviews/${id}`);
    }

    // 4. Transform to Initial Data
    const initialData = {
        id: review.id,
        title: review.title,
        director: review.director || "",
        posterUrl: review.posterUrl || "",
        rating: review.rating,
        oneLiner: review.oneLiner,
        content: review.content,
        watchedAt: review.watchedAt, // Date type is fine here as we handle it in form
        isMustWatch: review.isMustWatch,
        tags: review.tags.map((t: { name: string }) => t.name),
        tmdbId: review.tmdbId ?? undefined
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <ReviewForm
                    initialData={initialData}
                    availableTags={tags}
                    backLink={`/reviews/${id}`}
                />
            </div>
        </div>
    );
}
