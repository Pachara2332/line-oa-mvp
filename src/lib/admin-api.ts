import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { AdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/tenant";

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function requireAccessibleBrand(session: AdminSession, brandId: string) {
  if (!canAccessBrand(session, brandId)) return null;
  return prisma.brand.findUnique({ where: { id: brandId } });
}

export function mutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return jsonError("ข้อมูลนี้มีอยู่แล้ว", 409);
    if (error.code === "P2003") return jsonError("ไม่สามารถลบข้อมูลที่ยังถูกใช้งานอยู่ได้", 409);
    if (error.code === "P2025") return jsonError("ไม่พบข้อมูลที่ต้องการ", 404);
  }
  console.error("Admin mutation failed", error);
  return jsonError("ไม่สามารถบันทึกข้อมูลได้", 500);
}
