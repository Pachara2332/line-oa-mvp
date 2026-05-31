import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { canAccessBrand, tenantWhere } from "@/lib/tenant";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const members = await prisma.member.findMany({
    where: tenantWhere(session),
    include: { brand: true, source: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ members });
}

const schema = z.object({
  sourceId: z.string().min(1),
  lineUserId: z.string().trim().min(2).max(100),
  displayName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูลสมาชิกให้ถูกต้อง");
  const source = await prisma.qrSource.findUnique({ where: { id: parsed.data.sourceId } });
  if (!source || !canAccessBrand(session, source.brandId)) return jsonError("QR source not found", 404);
  try {
    return NextResponse.json({
      member: await prisma.member.create({
        data: {
          ...parsed.data,
          brandId: source.brandId,
          email: parsed.data.email || null,
          consentAt: new Date(),
        },
      }),
    }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
