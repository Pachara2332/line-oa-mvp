import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tenantWhere } from "@/lib/tenant";
import { PageHeading } from "@/components/page-heading";
import { DataTable } from "@/components/data-table";
import { CreatePanel, EntityActions } from "@/components/crud-controls";
import { getDictionary } from "@/lib/i18n";

export default async function CouponsPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.pages.coupons;
  const where = tenantWhere(session);
  const [coupons, brands] = await Promise.all([
    prisma.coupon.findMany({
      where,
      include: { brand: true, _count: { select: { claims: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ where: session.role === "SUPER_ADMIN" ? {} : { id: session.brandId! }, orderBy: { name: "asc" } }),
  ]);
  const activeCoupons = coupons.filter((coupon) => coupon.active).length;
  const totalClaims = coupons.reduce((sum, coupon) => sum + coupon._count.claims, 0);
  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t.active}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{activeCoupons.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t.claims}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{totalClaims.toLocaleString()}</p>
        </article>
      </section>
      <CreatePanel endpoint="/api/admin/coupons" fields={[
        { name: "brandId", label: "Brand", type: "select", options: brands.map((brand) => ({ label: brand.name, value: brand.id })), required: true },
        { name: "title", label: "Coupon title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "quota", label: "Quota (blank = unlimited)", type: "number" },
        { name: "active", label: "Active", type: "checkbox" },
      ]} initial={{ active: true }} title={t.add} />
      <DataTable headers={["Coupon", "Brand", "Description", "Quota", "Claims", "Status", "Manage"]} rows={coupons.map((coupon) => [
        <strong key={coupon.id}>{coupon.title}</strong>, coupon.brand.name, coupon.description || "-",
        coupon.quota ?? "Unlimited", coupon._count.claims,
        <span className={coupon.active ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"} key={`${coupon.id}-status`}>{coupon.active ? "Active" : "Inactive"}</span>,
        <EntityActions endpoint={`/api/admin/coupons/${coupon.id}`} fields={[
          { name: "title", label: "Coupon title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "quota", label: "Quota", type: "number" },
          { name: "active", label: "Active", type: "checkbox" },
        ]} initial={{ title: coupon.title, description: coupon.description, quota: coupon.quota, active: coupon.active }} key={`${coupon.id}-actions`} label={coupon.title} />,
      ])} />
    </>
  );
}
