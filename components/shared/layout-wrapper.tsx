"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FloatingNav } from "@/components/shared/floating-nav";
import { useReviewStore } from "@/store/use-review-store"; // For Zen Mode check if needed globally, but ZenMode is local to ReviewForm usually.
// Zen mode is likely handled by z-index stacking as discussed.

export function LayoutWrapper({ children, user }: { children: React.ReactNode; user?: any }) {
    const pathname = usePathname();
    // const { data: session } = useSession(); // Removed NextAuth hook

    // Check if we are on login/register pages
    const isAuthPage = pathname === "/login" || pathname === "/register";

    return (
        <div className="min-h-screen text-white font-sans selection:bg-purple-500/30 selection:text-white relative flex flex-col">

            {/* Ambient Background Glow (Global) -> Removed to prevent double background */}

            {/* Navigation */}
            {!isAuthPage && (
                <FloatingNav user={user} />
            )}

            {/* Main Content */}
            <main className={cn(
                "relative z-10 w-full flex-1 transition-all duration-300",
                !isAuthPage && "pt-24" // Add padding top only if nav is present
            )}>
                {children}
            </main>
        </div>
    );
}
