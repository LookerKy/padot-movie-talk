import { NextRequest, NextResponse } from "next/server";
import { decrypt, refreshSession } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith("/reviews/new") || path.match(/^\/reviews\/[^/]+\/edit$/);

    // --- 1. Authentication Check & Refresh Logic ---
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    let isAuthenticated = false;
    let newTokens: { accessToken: string; refreshToken: string } | null = null;

    // Check Access Token
    if (accessToken) {
        const payload = await decrypt(accessToken);
        if (payload) {
            isAuthenticated = true;
        }
    }

    // Check Refresh Token (if Access Token invalid/missing)
    if (!isAuthenticated && refreshToken) {
        const result = await refreshSession(refreshToken);
        if (result) {
            isAuthenticated = true;
            newTokens = {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            };
        }
    }

    // --- 2. Protected Route Guard ---
    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // --- 3. Response Handling ---
    // If not redirecting, proceed.
    // If we have new tokens from a refresh, set them on the response.
    const response = NextResponse.next();

    if (newTokens) {
        response.cookies.set({
            name: "accessToken",
            value: newTokens.accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        response.cookies.set({
            name: "refreshToken",
            value: newTokens.refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
    }

    // If verification failed (no valid tokens) but not on a protected route, 
    // we might want to clear invalid cookies? 
    // Usually good practice to keep state clean.
    if (!isAuthenticated && (accessToken || refreshToken)) {
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        response.cookies.delete("session");
    }

    return response;
}

export const config = {
    // Optimized Matcher: Only run on Entry Points and Protected Routes to save Edge Requests (Invocations)
    // Excludes: Static files, Images, Detail View Prefetches (/reviews/[id]), API routes
    matcher: [
        "/",                // Home (Session Refresh Point)
        "/calendar",        // Main Tab
        "/login",
        "/signup",
        "/profile/:path*",  // Protected
        "/reviews/new",     // Protected
        "/reviews/:id/edit" // Protected
    ],
};
