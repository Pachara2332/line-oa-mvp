import Image from "next/image";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tenantWhere } from "@/lib/tenant";
import { PageHeading } from "@/components/page-heading";
import { DataTable } from "@/components/data-table";
import { CreatePanel, EntityActions } from "@/components/crud-controls";
import { getDictionary } from "@/lib/i18n";

export default async function QrSourcesPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.pages.qrSources;
  const [sources, brands] = await Promise.all([
    prisma.qrSource.findMany({
      where: tenantWhere(session),
      include: { brand: true, _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ where: session.role === "SUPER_ADMIN" ? {} : { id: session.brandId! }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <CreatePanel endpoint="/api/admin/qr-sources" fields={[
        { name: "brandId", label: "Brand", type: "select", options: brands.map((brand) => ({ label: brand.name, value: brand.id })), required: true },
        { name: "name", label: "Source name", required: true },
        { name: "code", label: "Source code", placeholder: "STORE_FRONT_01", required: true },
      ]} title={t.add} />
      <DataTable headers={["QR", "Source", "Brand", "Code", "Members", "LIFF Link", "Manage"]} rows={sources.map((source) => [
        <Image alt={source.name} height={64} key={source.id} src={`/api/qr?text=${encodeURIComponent(source.qrUrl)}`} unoptimized width={64} />,
        <strong key={`${source.id}-name`}>{source.name}</strong>, source.brand.name, <code className="rounded bg-slate-100 px-2 py-1 text-xs" key={source.code}>{source.code}</code>, source._count.members,
        <a className="text-emerald-700 hover:underline" href={source.qrUrl} key={source.qrUrl} target="_blank">Open link</a>,
        <EntityActions endpoint={`/api/admin/qr-sources/${source.id}`} fields={[
          { name: "name", label: "Source name", required: true },
          { name: "code", label: "Source code", required: true },
        ]} initial={{ name: source.name, code: source.code }} key={`${source.id}-actions`} label={source.name} />,
      ])} />
    </>
  );
}
