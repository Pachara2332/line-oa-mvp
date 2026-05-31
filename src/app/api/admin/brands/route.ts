import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { jsonError, mutationError } from "@/lib/admin-api";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);
  return NextResponse.json({
    brands: await prisma.brand.findMany({ orderBy: { createdAt: "desc" } }),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("กรุณากรอกชื่อและ slug ให้ถูกต้อง");
  try {
    return NextResponse.json({ brand: await prisma.brand.create({ data: parsed.data }) }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
