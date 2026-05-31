import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "local-development-secret-change-me",
);

export async function createMemberToken(memberId: string, brandId: string) {
  return new SignJWT({ memberId, brandId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
}

export async function verifyMemberToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { memberId: string; brandId: string };
}
