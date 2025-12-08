"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { logoutAction } from "@/app/actions/auth";
import { LogOut, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
    };
}

export function Header({ user }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                isScrolled
                    ? "bg-black/80 backdrop-blur-md py-3 shadow-lg shadow-black/20"
                    : "bg-transparent py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-2xl font-bold text-white tracking-tighter hover:opacity-80 transition-opacity"
                >
                    페닷 명화
                </Link>

                <nav className="flex items-center gap-8">
                    <div className="flex items-center gap-8 text-sm font-medium">
                        <Link
                            href="/"
                            className="hover:text-sky-300 transition-colors relative group"
                        >
                            어워즈
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all duration-300 group-hover:w-full" />
                        </Link>
                        <Link
                            href="/calendar"
                            className="hover:text-sky-300 transition-colors relative group"
                        >
                            시네티 캘린더
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all duration-300 group-hover:w-full" />
                        </Link>
                    </div>

                    {user ? (
                        <div className="flex items-center text-sm font-medium gap-4">
                            {user.role === "ADMIN" && (
                                <Link
                                    href="/admin/users/create"
                                    className="hover:text-sky-300 transition-colors relative group"
                                >
                                    유저 생성

                                </Link>
                            )}
                            <Link
                                href="/reviews/new"
                                className={cn(
                                    "flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300",
                                    "bg-padot-blue-500 hover:bg-padot-blue-600 text-white"
                                )}
                            >
                                <PenLine size={14} />
                                리뷰 작성
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-300 hover:text-white transition-colors p-2"
                                title="로그아웃"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className={cn(
                                "text-sm font-medium px-5 py-1.5 rounded-full transition-all duration-300",
                                isScrolled
                                    ? "bg-white text-black hover:bg-gray-200"
                                    : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/10"
                            )}
                        >
                            로그인
                        </Link>
                    )}
                </nav>
            </div>


        </header>
    );
}
