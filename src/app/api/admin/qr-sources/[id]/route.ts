import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/tenant";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9_-]+$/),
});

async function findSource(id: string) {
  return prisma.qrSource.findUnique({ where: { id } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const source = await findSource((await params).id);
  if (!source || !canAccessBrand(session, source.brandId)) return jsonError("QR source not found", 404);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูล QR source ให้ถูกต้อง");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  try {
    return NextResponse.json({
      qrSource: await prisma.qrSource.update({
        where: { id: source.id },
        data: { ...parsed.data, qrUrl: `${appUrl}/liff/join?source=${encodeURIComponent(parsed.data.code)}` },
      }),
    });
  } catch (error) {
    return mutationError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const source = await findSource((await params).id);
  if (!source || !canAccessBrand(session, source.brandId)) return jsonError("QR source not found", 404);
  try {
    await prisma.qrSource.delete({ where: { id: source.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mutationError(error);
  }
}
