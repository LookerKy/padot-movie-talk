"use client";

import { useActionState } from "react";
import { createUserAction } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

export default function CreateUserPage() {
    // Correctly using useActionState (formerly useFormState if on older version, but React 19 uses useActionState)
    // Wait, package.json says "react": "19.2.1", so useActionState is available (or useFormState from react-dom)
    // Next.js might still be transitioning. Safe bet is useActionState if React 19, or check imports.
    // 'react' export 'useActionState' ? Yes, in 19.

    // Let's try simple form with client side submission wrapper if types are fussy, 
    // or standard form action. But getting error feedback is nice.

    // Actually, simple useState wrapper around the action is often easiest to debug than experimental hooks
    // if we don't strictly need progressive enhancement for an admin page.

    return (
        <div className="max-w-md mx-auto py-12">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-padot-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
                일반 유저 생성
            </h1>

            <CreateUserForm />
        </div>
    );
}

import { useState } from "react";
import { convertHangulToEnglish } from "@/lib/hangul-utils"; // Import utility

function CreateUserForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ error?: string; success?: boolean; message?: string } | null>(null);
    const [passwordValue, setPasswordValue] = useState(""); // Controlled password state

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const res = await createUserAction(null, formData);

        setLoading(false);
        if (res) {
            setMessage(res);
            if (res.success) {
                (e.target as HTMLFormElement).reset();
                setPasswordValue(""); // Reset password state
            }
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const converted = convertHangulToEnglish(val);
        setPasswordValue(converted);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    아이디 (Username)
                </label>
                <input
                    name="username"
                    required
                    minLength={3}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                    placeholder="padot_admin"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    비밀번호
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={4}
                    value={passwordValue}
                    onChange={handlePasswordChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                    placeholder="••••••••"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    이름 (선택)
                </label>
                <input
                    name="name"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                    placeholder="관리자"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    권한
                </label>
                <select
                    name="role"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground"
                    defaultValue="USER"
                >
                    <option value="USER" className="bg-popover text-popover-foreground">일반 사용자 (USER)</option>
                    <option value="ADMIN" className="bg-popover text-popover-foreground">관리자 (ADMIN)</option>
                </select>
            </div>

            {message?.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium">
                    {message.error}
                </div>
            )}

            {message?.success && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 text-sm font-medium">
                    {message.message}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-padot-blue-500 hover:bg-padot-blue-600 text-white font-bold transition-all disabled:opacity-50"
            >
                {loading && <Loader2 size={18} className="animate-spin" />}
                유저 생성하기
            </button>
        </form>
    );
}
