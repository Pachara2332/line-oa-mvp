import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, createAdminSession } from "@/lib/auth";

const schema = z.object({
  username: z.string().trim().min(3).max(60),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const admin = await authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!admin?.username) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await createAdminSession({
    adminId: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    brandId: admin.brandId,
  });
  return NextResponse.json({ ok: true });
}
