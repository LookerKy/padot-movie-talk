import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is required");
}
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionUser {
    id: string;
    username: string;
    role: "USER" | "ADMIN";
    name: string | null;
    email?: string | null;
}

export interface SessionPayload extends JWTPayload {
    user: SessionUser;
}

export async function encrypt(payload: JWTPayload, expiresIn: string = "1h") {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function login(userData: SessionUser) {
    // 1. Access Token (1 hour)
    // We only put minimal info in Access Token to keep it small
    const accessToken = await encrypt({ user: userData }, "1h");

    // 2. Refresh Token (7 days)
    // We can put the same info or just ID, but currently stateless so we need user info to regenerate Access Token
    const refreshToken = await encrypt({ user: userData }, "7d");

    // Save tokens in cookies
    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("session"); // Clean up old session cookie if exists
}

export async function getSession() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // If access token exists and is valid, return payload
    if (accessToken) {
        const payload = await decrypt(accessToken);
        if (payload) return payload;
    }

    // If access token is missing or invalid, we don't handle refresh here.
    // Refreshing happens in Middleware. 
    // However, if we are in a Server Component and middleware missed it (or didn't run),
    // we might want to check refreshToken? 
    // For now, let's assume Middleware ensures we have a valid access token if a refresh token exists.
    return null;
}

// This function will be used by Middleware, so it operates on specific inputs/outputs
// rather than using `cookies()` which isn't fully available in Middleware the same way.
export async function refreshSession(refreshToken: string) {
    const payload = await decrypt(refreshToken);
    if (!payload) return null;

    // Reuse the user data from the refresh token to create a new access token
    // Note: In a stateful system, we would query the DB here to ensure user still exists/isn't banned.
    // For stateless, we trust the valid signature of the Refresh Token.
    const newAccessToken = await encrypt({ user: payload.user }, "1h");
    const newRefreshToken = await encrypt({ user: payload.user }, "7d"); // Rotate refresh token

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: payload.user
    };
}
