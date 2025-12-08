import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            include: {
                tags: true,
            },
            orderBy: {
                watchedAt: "desc", // Order by watched date usually makes more sense for this app
            },
        });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            director,
            posterUrl,
            rating,
            oneLiner,
            content,
            tags,
            watchedAt,
            isMustWatch
        } = body;

        // Basic validation
        if (!title || !content || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Handle tags: tags is expected to be an array of strings e.g. ["Drama", "Sci-Fi"]
        // We use connectOrCreate to reuse existing tags or create new ones
        const tagConnectOrCreate = tags?.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName },
        })) || [];

        const review = await prisma.review.create({
            data: {
                title,
                director,
                posterUrl,
                rating: parseFloat(rating),
                oneLiner,
                content,
                watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
                isMustWatch: isMustWatch || false,
                author: {
                    connect: { id: session.user.id }
                },
                tags: {
                    connectOrCreate: tagConnectOrCreate,
                },
            },
            include: {
                tags: true,
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
