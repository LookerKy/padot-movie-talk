"use server";

import prisma from "@/lib/db/client";
import { login, logout } from "@/lib/auth";
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

        let isValid = false;
        if (user.password.startsWith("$2")) {
            isValid = await bcrypt.compare(password, user.password);
        } else {
            isValid = user.password === password;
        }

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
