import { getSession } from "@/lib/auth";

export class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError";
    }
}

export async function requireAuth() {
    const session = await getSession();
    if (!session || !session.user) {
        throw new AuthError("로그인이 필요합니다.");
    }
    return session;
}

export async function requireAdmin() {
    const session = await getSession();
    if (!session || !session.user) {
        throw new AuthError("로그인이 필요합니다.");
    }
    if (session.user.role !== "ADMIN") {
        throw new AuthError("권한이 없습니다.");
    }
    return session;
}
