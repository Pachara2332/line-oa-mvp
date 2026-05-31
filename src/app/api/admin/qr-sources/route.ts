import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError, requireAccessibleBrand } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { tenantWhere } from "@/lib/tenant";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const qrSources = await prisma.qrSource.findMany({
    where: tenantWhere(session),
    include: { brand: true, _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ qrSources });
}

const schema = z.object({
  brandId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9_-]+$/),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูล QR source ให้ถูกต้อง");
  if (!(await requireAccessibleBrand(session, parsed.data.brandId))) return jsonError("Brand not found", 404);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  try {
    return NextResponse.json({
      qrSource: await prisma.qrSource.create({
        data: { ...parsed.data, qrUrl: `${appUrl}/liff/join?source=${encodeURIComponent(parsed.data.code)}` },
      }),
    }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
