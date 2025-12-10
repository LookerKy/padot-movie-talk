"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
    Home,
    Calendar,
    BarChart2,
    PenLine,
    LogOut,
    Settings,
    User as UserIcon,
    UserPlus,
    Menu,
    X,
    Sun,
    Moon,
    Laptop
} from "lucide-react";
import { motion } from "framer-motion";
import { useReviewStore } from "@/store/use-review-store";
import React, { useState, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

interface FloatingNavProps {
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
        username?: string;
    } | null;
}

// Re-exporting component to fix build cache
export const FloatingNav = React.memo(function FloatingNav({ user }: FloatingNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isZenMode = useReviewStore((state) => state.isZenMode);
    const { theme, setTheme } = useTheme();

    // Handle scroll effect with requestAnimationFrame
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
        router.refresh();
    };

    const navItems = [
        { href: "/", icon: Home, label: "어워즈" },
        { href: "/calendar", icon: Calendar, label: "캘린더" },
        { href: "/stats", icon: BarChart2, label: "통계" },
    ];

    if (isZenMode) return null;

    return (
        <>
            {/* Main Floating Dock */}
            <motion.nav
                initial={false}
                animate={{
                    y: isScrolled ? 0 : 24,
                }}
                transition={{
                    type: "tween",
                    duration: 0.3,
                    ease: [0.32, 0.72, 0, 1]
                }}
                className={cn(
                    "fixed z-[50] flex items-center justify-between px-4 py-2 border shadow-2xl backdrop-blur-xl left-1/2 -translate-x-1/2 nav-glass transition-[width,max-width,border-radius] duration-300 ease-out",
                    isScrolled
                        ? "border-b w-full max-w-full rounded-none"
                        : "border w-[90%] max-w-5xl rounded-3xl"
                )}
            >
                {/* 1. Logo Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link href="/" className="group flex items-center gap-3 pl-2">
                        <div className="relative pb-1 w-50 opacity-90 group-hover:opacity-100 transition-opacity">
                            <span className="text-xl font-bold text-foreground tracking-tight">𝓅𝒶𝒹ℴ𝓉 𝓂ℴ𝓋𝒾ℯ𝓈</span>
                        </div>
                    </Link>
                </div>

                {/* 2. Center Nav Items (Desktop) */}
                <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300",
                                    isActive
                                        ? "text-primary bg-primary/10 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon size={18} className={cn("transition-transform duration-300", isActive && "scale-105 text-primary")} />
                                <span className={cn("text-sm tracking-tight", isActive && "font-bold")}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* 3. Right Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full hover:bg-secondary/20 transition-colors relative outline-none focus:outline-none focus:ring-0"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </button>

                    {/* Refined Write Button (Desktop Only) */}
                    {user && (
                        <Link
                            href="/reviews/new"
                            className="hidden md:flex items-center justify-center p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20 group"
                        >
                            <PenLine size={18} />
                            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-[80px] group-hover:opacity-100 group-hover:ml-2 text-sm font-bold">
                                리뷰 작성
                            </span>
                        </Link>
                    )}

                    {/* User Profile / Login */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 hover:bg-secondary/20 px-4 py-2 rounded-full transition-all border border-transparent hover:border-border/50 group outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-foreground leading-none">
                                            {user.name || "User"}
                                        </span>
                                    </div>
                                    <div className="ml-1 opacity-50 text-muted-foreground group-hover:opacity-100 transition-opacity">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 glass-card animate-in fade-in zoom-in-95 duration-200">
                                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>프로필</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/users/create" className="cursor-pointer">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                <span>계정 생성</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}



                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>로그아웃</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-5 py-2 hover:bg-secondary/50 rounded-full"
                        >
                            로그인
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[45] md:hidden">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] nav-glass rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200">
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "px-4 py-3 rounded-xl flex items-center gap-3 transition-all",
                                                isActive
                                                    ? "bg-secondary/50 text-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                                            )}
                                        >
                                            <item.icon size={20} />
                                            <span className="text-base font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                                {user && (
                                    <Link
                                        href="/reviews/new"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium"
                                    >
                                        <PenLine size={20} />
                                        <span>리뷰 작성하기</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
});
