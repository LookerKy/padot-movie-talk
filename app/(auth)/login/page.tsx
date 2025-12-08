"use client";

import { useActionState, useState } from "react";
import { loginAction, LoginState } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {
    error: "",
    fieldErrors: {},
    fields: { username: "" },
};

export default function LoginPage() {
    const [state, action, isPending] = useActionState(loginAction, initialState);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    return (
        <div
            className="w-full max-w-md relative z-10 p-4 mx-auto mt-24"
            style={{
                perspective: "1000px"
            }}
        >
            <div className={cn(
                "backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8",
                "transition-all duration-300 hover:shadow-padot-blue-900/20",
                "flex flex-col gap-8"
            )}>
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-padot-blue-500 via-purple-500 to-pink-500 dark:from-padot-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm tracking-wide">
                        페닷 명화
                    </h1>
                    <p className="text-gray-400 text-sm font-light">
                        리뷰 작성을 위해 로그인 해주세요
                    </p>
                </div>

                {/* Form */}
                <form action={action} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className={cn(
                                "text-xs font-medium uppercase tracking-wider transition-colors duration-300 ml-1",
                                focusedField === "username" ? "text-padot-blue-400" : "text-gray-500"
                            )}
                        >
                            아이디
                        </label>
                        <div className="relative group">
                            <div className={cn(
                                "absolute -inset-0.5 rounded-lg bg-gradient-to-r from-padot-blue-500/50 to-blue-600/50 opacity-0 blur transition duration-300 group-hover:opacity-50",
                                focusedField === "username" && "opacity-75"
                            )} />
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="아이디를 입력해주세요"
                                defaultValue={state?.fields?.username || ""}
                                onFocus={() => setFocusedField("username")}
                                onBlur={() => setFocusedField(null)}
                                className={cn(
                                    "relative w-full bg-black/60 border rounded-lg px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none transition-all duration-300",
                                    state?.fieldErrors?.username
                                        ? "border-red-500/50 focus:border-red-500"
                                        : "border-white/10 focus:border-padot-blue-500/50"
                                )}
                            />
                        </div>
                        {state?.fieldErrors?.username && (
                            <p className="text-red-400 text-xs pl-1 animate-slide-up">{state.fieldErrors.username}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className={cn(
                                "text-xs font-medium uppercase tracking-wider transition-colors duration-300 ml-1",
                                focusedField === "password" ? "text-padot-blue-400" : "text-gray-500"
                            )}
                        >
                            비밀번호
                        </label>
                        <div className="relative group">
                            <div className={cn(
                                "absolute -inset-0.5 rounded-lg bg-gradient-to-r from-padot-blue-500/50 to-blue-600/50 opacity-0 blur transition duration-300 group-hover:opacity-50",
                                focusedField === "password" && "opacity-75"
                            )} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="비밀번호를 입력해주세요"
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField(null)}
                                className={cn(
                                    "relative w-full bg-black/60 border rounded-lg px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none transition-all duration-300",
                                    state?.fieldErrors?.password
                                        ? "border-red-500/50 focus:border-red-500"
                                        : "border-white/10 focus:border-padot-blue-500/50"
                                )}
                            />
                        </div>
                        {state?.fieldErrors?.password && (
                            <p className="text-red-400 text-xs pl-1 animate-slide-up">{state.fieldErrors.password}</p>
                        )}
                    </div>

                    {state?.error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center animate-fade-in">
                            {state.error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "w-full h-12 bg-gradient-to-r from-padot-blue-600 to-padot-blue-500 hover:from-padot-blue-500 hover:to-padot-blue-400 text-white font-bold rounded-lg transition-all duration-300",
                            "shadow-lg shadow-padot-blue-900/20 hover:shadow-padot-blue-500/30",
                            "border border-white/10"
                        )}
                    >
                        {isPending ? <Loader2 className="animate-spin" size={20} /> : "로그인"}
                    </Button>
                </form>

                {/* Footer */}
                <div className="text-center pt-2">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 group"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-padot-blue-400 transition-colors" />
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>

            {/* Decorative border gloss */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/5" />
        </div>
    );
}
