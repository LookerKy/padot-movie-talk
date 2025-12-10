"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { logoutAction } from "@/app/actions/auth";
import { LogOut, PenLine, KeyRound, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
    user?: {
        id: string;
        email: string;
        role: "USER" | "ADMIN";
        name?: string;
        username?: string;
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
                            className="hover:text-sky-300 transition-colors relative group font-cookie text-lg"
                        >
                            홈
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all group-hover:w-full" />
                        </Link>

                        <Link
                            href="/calendar"
                            className="hover:text-sky-300 transition-colors relative group font-cookie text-lg"
                        >
                            캘린더
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all group-hover:w-full" />
                        </Link>

                        <Link
                            href="/stats"
                            className="hover:text-sky-300 transition-colors relative group font-cookie text-lg"
                        >
                            통계
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all group-hover:w-full" />
                        </Link>

                        {user ? (
                            <>
                                {user.role === "ADMIN" && (
                                    <Link
                                        href="/admin/users/create"
                                        className="hover:text-sky-300 transition-colors relative group font-cookie text-lg"
                                    >
                                        유저 생성
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-300 transition-all group-hover:w-full" />
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="outline-none">
                                        <div className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-white/10">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-padot-blue-500 to-purple-500 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {(user.name || user.username || user.email).slice(0, 1).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-gray-300 font-medium hidden md:block">
                                                {user.name || user.username || user.email.split("@")[0]}
                                            </span>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white p-2">
                                        <DropdownMenuLabel className="text-xs text-gray-500 font-normal">내 계정</DropdownMenuLabel>
                                        <div className="px-2 py-2 mb-2">
                                            <p className="font-bold text-lg">{user.name || user.username || "User"}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <DropdownMenuSeparator className="bg-white/10" />

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/profile"
                                                className="cursor-pointer flex items-center gap-2 hover:bg-white/10 transition-colors py-2.5 rounded-md px-2 focus:bg-white/10"
                                            >
                                                <UserIcon size={16} className="text-gray-400" />
                                                <span className="font-medium text-gray-200">프로필 설정</span>
                                            </Link>
                                        </DropdownMenuItem>

                                        {user.role === "ADMIN" && (
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href="/admin/users/create"
                                                    className="cursor-pointer flex items-center gap-2 hover:bg-white/10 transition-colors py-2.5 rounded-md px-2 focus:bg-white/10"
                                                >
                                                    <KeyRound size={16} className="text-gray-400" />
                                                    <span className="font-medium text-gray-200">유저 관리</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-white/10" />

                                        <DropdownMenuItem asChild>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full cursor-pointer flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors py-2.5 rounded-md px-2 mt-1 focus:bg-red-500/10"
                                            >
                                                <LogOut size={16} />
                                                <span className="font-medium">로그아웃</span>
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
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
                    </div>
                </nav>
            </div>


        </header>
    );
}
