import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyLineIdToken } from "@/lib/line";
import { createMemberToken } from "@/lib/member-token";

const schema = z.object({
  sourceCode: z.string().min(1),
  idToken: z.string().optional(),
  demoLineUserId: z.string().optional(),
  displayName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(8).max(30),
  email: z.email().optional().or(z.literal("")),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete the registration form" }, { status: 400 });
  }

  try {
    const source = await prisma.qrSource.findUnique({ where: { code: parsed.data.sourceCode } });
    if (!source) return NextResponse.json({ error: "QR source not found" }, { status: 404 });
    const profile = await verifyLineIdToken(parsed.data.idToken, parsed.data.demoLineUserId);
    const member = await prisma.member.upsert({
      where: {
        brandId_lineUserId: { brandId: source.brandId, lineUserId: profile.sub },
      },
      update: {
        sourceId: source.id,
        displayName: parsed.data.displayName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        consentAt: new Date(),
      },
      create: {
        brandId: source.brandId,
        sourceId: source.id,
        lineUserId: profile.sub,
        displayName: parsed.data.displayName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        consentAt: new Date(),
      },
    });
    const coupons = await prisma.coupon.findMany({
      where: { brandId: source.brandId, active: true },
      select: { id: true, title: true, description: true },
    });
    return NextResponse.json({
      member: { id: member.id, displayName: member.displayName },
      memberToken: await createMemberToken(member.id, member.brandId),
      coupons,
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }
}
