"use server";

import prisma from "@/lib/db/client";
import { login, logout, getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
// Force TS re-check

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export interface LoginState {
    error?: string;
    fieldErrors?: {
        username?: string;
        password?: string;
    };
    fields?: {
        username: string;
    };
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const errors: { username?: string; password?: string } = {};

    if (!username || username.trim() === "") {
        errors.username = "ID를 입력해주세요";
    }

    if (!password || password.trim() === "") {
        errors.password = "올바른 비밀번호를 입력해주세요";
    }

    if (Object.keys(errors).length > 0) {
        return {
            fieldErrors: errors,
            fields: { username }
        };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return {
                error: "ID혹은 패스워드를 확인해주세요",
                fields: { username }
            };
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return {
                error: "id혹은 패스워드를 확인해주세요",
                fields: { username }
            };
        }

        // Login success
        await login({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            name: user.name,
        });

    } catch (error) {
        console.error("Login error:", error);
        return { error: "서버 에러가 발생했습니다." };
    }

    redirect("/");
}

export async function logoutAction() {
    await logout();
    redirect("/");
}

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(6, "새 비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
});

export async function changePasswordAction(prevState: any, formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return { error: "로그인이 필요합니다." };
        }

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        const validation = changePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmPassword
        });

        if (!validation.success) {
            return { error: validation.error.flatten().fieldErrors };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) return { error: "사용자를 찾을 수 없습니다." };

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return { error: { currentPassword: ["현재 비밀번호가 일치하지 않습니다."] } };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return { success: true };

    } catch (error) {
        console.error("Change Password Error:", error);
        return { error: "비밀번호 변경 중 오류가 발생했습니다." };
    }
}
