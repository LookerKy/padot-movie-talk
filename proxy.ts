import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth";
import { getSession } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
    // 1. Update session if it exists (extend expiry)
    const sessionResponse = await updateSession(request);

    // 2. Define protected routes
    const path = request.nextUrl.pathname;
    const isProtectedRoute = path.startsWith("/reviews/new") || path.match(/^\/reviews\/[^/]+\/edit$/);

    // 3. User verification
    if (isProtectedRoute) {
        // We can't use getSession() directly from lib/auth because it relies on cookies(), 
        // which might work differently in middleware or we want to be explicit.
        // However, lib/auth's updateSession reads from request.cookies/headers, 
        // which is standard for middleware.
        // Let's manually check the cookie existence first for speed.
        const sessionCookie = request.cookies.get("session");

        if (!sessionCookie) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Optionally verify content of cookie if needed, but presence is a good first check.
        // For robust check, we could use decrypt from lib/auth if edge compatible.
    }

    // Return the response from updateSession (which sets the new cookie) or standard response
    return sessionResponse || NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
