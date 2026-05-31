import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessBrand } from "@/lib/tenant";

const schema = z.object({ claimId: z.string() });

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
  const claim = await prisma.couponClaim.findUnique({
    where: { id: parsed.data.claimId },
    include: { coupon: true },
  });
  if (!claim || !canAccessBrand(session, claim.coupon.brandId)) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }
  if (claim.status !== "CLAIMED") {
    return NextResponse.json({ error: "Coupon cannot be redeemed" }, { status: 409 });
  }
  const updated = await prisma.couponClaim.update({
    where: { id: claim.id },
    data: { status: "USED", usedAt: new Date() },
  });
  return NextResponse.json({ claim: updated });
}
