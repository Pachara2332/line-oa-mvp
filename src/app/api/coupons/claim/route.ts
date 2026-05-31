import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyMemberToken } from "@/lib/member-token";

const schema = z.object({ couponId: z.string(), memberToken: z.string() });

export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json());
    const member = await verifyMemberToken(data.memberToken);
    const coupon = await prisma.coupon.findFirst({
      where: { id: data.couponId, brandId: member.brandId, active: true },
      include: { _count: { select: { claims: true } } },
    });
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    if (coupon.quota !== null && coupon._count.claims >= coupon.quota) {
      return NextResponse.json({ error: "Coupon quota reached" }, { status: 409 });
    }
    const claim = await prisma.couponClaim.upsert({
      where: { couponId_memberId: { couponId: coupon.id, memberId: member.memberId } },
      update: {},
      create: { couponId: coupon.id, memberId: member.memberId },
    });
    return NextResponse.json({ claim });
  } catch {
    return NextResponse.json({ error: "Unable to claim coupon" }, { status: 400 });
  }
}
