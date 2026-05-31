import type { AdminSession } from "@/lib/auth";

export function tenantWhere(session: AdminSession) {
  return session.role === "SUPER_ADMIN" ? {} : { brandId: session.brandId! };
}

export function canAccessBrand(session: AdminSession, brandId: string) {
  return session.role === "SUPER_ADMIN" || session.brandId === brandId;
}
