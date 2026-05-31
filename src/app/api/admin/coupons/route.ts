import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError, requireAccessibleBrand } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { tenantWhere } from "@/lib/tenant";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({
    where: tenantWhere(session),
    include: { brand: true, _count: { select: { claims: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
}

const schema = z.object({
  brandId: z.string().min(1),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  quota: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูลคูปองให้ถูกต้อง");
  if (!(await requireAccessibleBrand(session, parsed.data.brandId))) return jsonError("Brand not found", 404);
  try {
    return NextResponse.json({ coupon: await prisma.coupon.create({ data: parsed.data }) }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
