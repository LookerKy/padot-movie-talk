"use server";

import prisma from "@/lib/db/client";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    name: z.string().optional(),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export async function createUserAction(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { error: "권한이 없습니다." };
    }

    const username = formData.get("username");
    const password = formData.get("password");
    const name = formData.get("name") || "";
    const role = formData.get("role") || "USER";

    const result = createUserSchema.safeParse({
        username,
        password,
        name,
        role,
    });

    if (!result.success) {
        // Access nested error issues
        return { error: result.error.issues[0].message };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username: result.data.username },
        });

        if (existingUser) {
            return { error: "이미 존재하는 아이디입니다." };
        }

        const hashedPassword = await bcrypt.hash(result.data.password, 10);

        await prisma.user.create({
            data: {
                username: result.data.username,
                password: hashedPassword,
                name: result.data.name || null,
                role: result.data.role,
            },
        });

        revalidatePath("/admin/users"); // Assuming we have a list someday, or just generally
        return { success: true, message: "사용자가 성공적으로 생성되었습니다." };

    } catch (error) {
        console.error("Create user error:", error);
        return { error: "사용자 생성 중 오류가 발생했습니다." };
    }
}
