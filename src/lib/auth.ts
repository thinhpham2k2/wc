import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserPayload } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
const COOKIE_NAME = "wc-token";

export const signToken = async (payload: UserPayload): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
};

export const getUser = async (): Promise<UserPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
};

export const requireAuth = async (): Promise<UserPayload> => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
};

export const requireAdmin = async (): Promise<UserPayload> => {
  const user = await requireAuth();
  if (!user.isAdmin) throw new Error("Forbidden");
  return user;
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
};
