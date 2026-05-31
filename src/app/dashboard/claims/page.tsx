import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tenantWhere } from "@/lib/tenant";
import { PageHeading } from "@/components/page-heading";
import { DataTable } from "@/components/data-table";
import { RedeemClaimButton } from "@/components/redeem-claim-button";
import { getDictionary } from "@/lib/i18n";

export default async function ClaimsPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.pages.claims;
  const claims = await prisma.couponClaim.findMany({
    where: { coupon: tenantWhere(session) },
    include: { coupon: { include: { brand: true } }, member: true },
    orderBy: { claimedAt: "desc" },
  });
  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <DataTable headers={["Coupon", "Brand", "Member", "Claimed", "Used", "Status", "Manage"]} rows={claims.map((claim) => [
        claim.coupon.title, claim.coupon.brand.name, claim.member.displayName || "-",
        claim.claimedAt.toLocaleString("th-TH"), claim.usedAt?.toLocaleString("th-TH") || "-",
        <strong className={claim.status === "USED" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700" : "rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700"} key={claim.id}>{claim.status}</strong>,
        claim.status === "CLAIMED" ? <RedeemClaimButton claimId={claim.id} key={`${claim.id}-redeem`} /> : "-",
      ])} />
    </>
  );
}
