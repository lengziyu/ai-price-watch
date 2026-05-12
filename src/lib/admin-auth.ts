import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "leijiatong-admin-session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminSession = {
  username: string;
  issuedAt: string;
};

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin123456",
  };
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-leijiatong-admin-secret";
}

function safeTextEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();

  return timingSafeEqual(leftHash, rightHash);
}

function createSessionSignature(payload: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(payload).digest("hex");
}

function encodeTokenPart(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeTokenPart(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createSessionToken(username: string, issuedAt: string) {
  const payload = `${encodeTokenPart(username)}.${encodeTokenPart(issuedAt)}`;
  return `${payload}.${createSessionSignature(payload)}`;
}

function parseSessionToken(token: string): AdminSession | null {
  const [encodedUsername, encodedIssuedAt, signature] = token.split(".");

  if (!encodedUsername || !encodedIssuedAt || !signature) {
    return null;
  }

  const payload = `${encodedUsername}.${encodedIssuedAt}`;
  const expectedSignature = createSessionSignature(payload);

  if (!safeTextEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    return {
      username: decodeTokenPart(encodedUsername),
      issuedAt: decodeTokenPart(encodedIssuedAt),
    };
  } catch {
    return null;
  }
}

export function isUsingDefaultAdminCredentials() {
  return !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD;
}

export function verifyAdminCredentials(username: string, password: string) {
  const credentials = getAdminCredentials();

  return (
    safeTextEqual(username.trim(), credentials.username) &&
    safeTextEqual(password, credentials.password)
  );
}

export async function getAdminSession() {
  const sessionToken = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return parseSessionToken(sessionToken);
}

export async function requireAdminAuth() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();
  const issuedAt = new Date().toISOString();

  cookieStore.set(ADMIN_COOKIE_NAME, createSessionToken(username, issuedAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
