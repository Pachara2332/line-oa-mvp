import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError } from "@/lib/admin-api";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/tenant";

const schema = z.object({
  sourceId: z.string().min(1),
  displayName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
});

async function findMember(id: string) {
  return prisma.member.findUnique({ where: { id } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const member = await findMember((await params).id);
  if (!member || !canAccessBrand(session, member.brandId)) return jsonError("Member not found", 404);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกข้อมูลสมาชิกให้ถูกต้อง");
  const source = await prisma.qrSource.findUnique({ where: { id: parsed.data.sourceId } });
  if (!source || !canAccessBrand(session, source.brandId)) return jsonError("QR source not found", 404);
  try {
    return NextResponse.json({
      member: await prisma.member.update({
        where: { id: member.id },
        data: {
          ...parsed.data,
          brandId: source.brandId,
          email: parsed.data.email || null,
        },
      }),
    });
  } catch (error) {
    return mutationError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const member = await findMember((await params).id);
  if (!member || !canAccessBrand(session, member.brandId)) return jsonError("Member not found", 404);
  try {
    await prisma.member.delete({ where: { id: member.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mutationError(error);
  }
}
