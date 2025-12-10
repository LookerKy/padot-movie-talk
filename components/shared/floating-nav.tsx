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
    X
} from "lucide-react";
import { useReviewStore } from "@/store/use-review-store";
import { useState, useEffect } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FloatingNavProps {
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
        username?: string;
    } | null;
}

export function FloatingNav({ user }: FloatingNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isZenMode = useReviewStore((state) => state.isZenMode);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
        router.refresh();
    };

    const navItems = [
        { href: "/", icon: Home, label: "홈" },
        { href: "/calendar", icon: Calendar, label: "캘린더" },
        { href: "/stats", icon: BarChart2, label: "통계" },
    ];

    if (isZenMode) return null;

    return (
        <>
            {/* Main Floating Dock */}
            <nav
                className={cn(
                    "fixed z-[50] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between px-4 py-2 border shadow-2xl backdrop-blur-xl border-white/5 left-1/2 -translate-x-1/2",
                    isScrolled
                        ? "top-0 w-full max-w-[100vw] rounded-none bg-black/80 border-x-0 border-t-0"
                        : "top-6 w-[90%] max-w-5xl rounded-3xl bg-black/50" // Thinner, rounded-3xl for smoother morph to square
                )}
            >
                {/* 1. Logo Section */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link href="/" className="group flex items-center gap-3 pl-2">
                        <div className="relative w-24 opacity-90 group-hover:opacity-100 transition-opacity">
                            <span className="text-xl">𝓅𝒶𝒹ℴ𝓉</span>
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
                                    "relative px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300 hover:bg-white/5",
                                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <item.icon size={18} className={cn("transition-transform duration-300", isActive && "scale-110 text-purple-400")} />
                                <span className={cn("text-sm font-medium tracking-tight", isActive && "font-bold")}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* 3. Right Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Refined Write Button (Desktop Only) */}
                    {user && (
                        <Link
                            href="/reviews/new"
                            className="hidden sm:flex items-center gap-2 group relative px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <PenLine size={16} className="text-gray-300 group-hover:text-purple-300 transition-colors" />
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">리뷰 쓰기</span>
                        </Link>
                    )}

                    {/* User Profile / Login */}
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 hover:bg-white/5 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-white/10 group outline-none">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                        <UserIcon size={14} className="text-gray-300 group-hover:text-purple-300" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors max-w-[100px] truncate hidden lg:block">
                                        {user.name || "User"}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white mt-2">
                                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        <span>프로필</span>
                                    </Link>
                                </DropdownMenuItem>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="cursor-pointer text-purple-400 focus:text-purple-300">
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>관리자 홈</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/users/create" className="cursor-pointer text-purple-400 focus:text-purple-300">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                <span>계정 생성</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-900/20">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>로그아웃</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-full"
                        >
                            로그인
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-white/70 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[45] md:hidden">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
                        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] bg-zinc-900/90 border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200">
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
                                                    ? "bg-white/10 text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
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
                                        className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium"
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
}
