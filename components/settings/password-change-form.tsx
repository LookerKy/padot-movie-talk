"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { convertHangulToEnglish } from "@/lib/hangul-utils";

const initialState: FormState = {
    error: undefined,
    success: false
};

interface FormState {
    error?: string | {
        currentPassword?: string[];
        newPassword?: string[];
        confirmPassword?: string[];
    };
    success?: boolean;
}



export function PasswordChangeForm() {
    const [state, action, isPending] = useActionState<FormState, FormData>(changePasswordAction, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    // State for controlled inputs to handle auto-conversion
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
            // Reset local state as well
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        }
    }, [state?.success]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const converted = convertHangulToEnglish(value);
        setFormData(prev => ({ ...prev, [name]: converted }));
    };

    const fieldErrors = typeof state?.error === 'object' && state.error !== null && !Array.isArray(state.error) ? state.error : {};

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <KeyRound className="text-padot-blue-400" />
                    비밀번호 변경
                </h2>
                <p className="text-gray-400 text-sm">
                    계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.
                </p>
            </div>

            <form ref={formRef} action={action} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">현재 비밀번호</label>
                    <input
                        name="currentPassword"
                        type="password"
                        required
                        value={formData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-padot-blue-500/50 focus:bg-white/10 transition-colors"
                        placeholder="현재 사용 중인 비밀번호"
                    />
                    {fieldErrors.currentPassword && (
                        <p className="text-red-400 text-xs">{fieldErrors.currentPassword[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">새 비밀번호</label>
                    <input
                        name="newPassword"
                        type="password"
                        required
                        value={formData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-padot-blue-500/50 focus:bg-white/10 transition-colors"
                        placeholder="영문, 숫자 포함 6자 이상"
                    />
                    {fieldErrors.newPassword && (
                        <p className="text-red-400 text-xs">{fieldErrors.newPassword[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">새 비밀번호 확인</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-padot-blue-500/50 focus:bg-white/10 transition-colors"
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                    {fieldErrors.confirmPassword && (
                        <p className="text-red-400 text-xs">{fieldErrors.confirmPassword[0]}</p>
                    )}
                </div>

                {typeof state?.error === 'string' && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={16} />
                        비밀번호가 성공적으로 변경되었습니다.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" />
                            변경 중...
                        </>
                    ) : (
                        "비밀번호 변경하기"
                    )}
                </button>
            </form>
        </div>
    );
}
