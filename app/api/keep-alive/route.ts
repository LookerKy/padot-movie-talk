import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";

export async function GET() {
    try {
        // Run a lightweight query to keep Supabase active
        // Just fetching one tag is enough to wake up the DB
        await prisma.tag.findFirst({
            select: { id: true },
        });

        return NextResponse.json({ status: "alive", message: "Supabase connection active" });
    } catch (error) {
        console.error("Keep-alive ping failed:", error);
        return NextResponse.json({ status: "error", message: "Ping failed" }, { status: 500 });
    }
}
