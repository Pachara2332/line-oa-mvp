import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError, requireAccessibleBrand } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/tenant";

const schema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  quota: z.number().int().positive().nullable().optional(),
  active: z.boolean(),
});

async function findCoupon(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const coupon = await findCoupon((await params).id);
  if (!coupon || !(await requireAccessibleBrand(session, coupon.brandId))) return jsonError("Coupon not found", 404);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูลคูปองให้ถูกต้อง");
  try {
    return NextResponse.json({ coupon: await prisma.coupon.update({ where: { id: coupon.id }, data: parsed.data }) });
  } catch (error) {
    return mutationError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const coupon = await findCoupon((await params).id);
  if (!coupon || !canAccessBrand(session, coupon.brandId)) return jsonError("Coupon not found", 404);
  try {
    await prisma.coupon.delete({ where: { id: coupon.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mutationError(error);
  }
}
