import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "line_oa_admin_password_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "local-development-secret-change-me",
);

export type AdminSession = {
  adminId: string;
  username: string;
  email: string | null;
  name: string;
  role: "SUPER_ADMIN" | "BRAND_ADMIN";
  brandId: string | null;
};

export async function authenticateAdmin(username: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin?.username || !admin.passwordHash) return null;
  if (!(await compare(password, admin.passwordHash))) return null;
  return admin;
}

export async function createAdminSession(session: AdminSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AdminSession;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}
