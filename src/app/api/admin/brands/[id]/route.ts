import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError } from "@/lib/admin-api";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const error = await requireSuperAdmin();
  if (error) return error;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกชื่อและ slug ให้ถูกต้อง");
  try {
    return NextResponse.json({ brand: await prisma.brand.update({ where: { id: (await params).id }, data: parsed.data }) });
  } catch (mutation) {
    return mutationError(mutation);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const error = await requireSuperAdmin();
  if (error) return error;
  try {
    await prisma.brand.delete({ where: { id: (await params).id } });
    return NextResponse.json({ ok: true });
  } catch (mutation) {
    return mutationError(mutation);
  }
}
