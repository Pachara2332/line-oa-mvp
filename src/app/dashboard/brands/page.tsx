import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeading } from "@/components/page-heading";
import { DataTable } from "@/components/data-table";
import { CreatePanel, EntityActions } from "@/components/crud-controls";
import { getDictionary } from "@/lib/i18n";

export default async function BrandsPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.pages.brands;
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { members: true, qrSources: true, coupons: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <CreatePanel endpoint="/api/admin/brands" fields={[
        { name: "name", label: "Brand name", required: true },
        { name: "slug", label: "Slug", placeholder: "demo-brand", required: true },
      ]} title={t.add} />
      <DataTable headers={["Brand", "Slug", "QR Sources", "Members", "Coupons", "Manage"]} rows={brands.map((brand) => [
        <strong key={brand.id}>{brand.name}</strong>, brand.slug, brand._count.qrSources, brand._count.members, brand._count.coupons,
        <EntityActions endpoint={`/api/admin/brands/${brand.id}`} fields={[
          { name: "name", label: "Brand name", required: true },
          { name: "slug", label: "Slug", required: true },
        ]} initial={{ name: brand.name, slug: brand.slug }} key={`${brand.id}-actions`} label={brand.name} />,
      ])} />
    </>
  );
}
