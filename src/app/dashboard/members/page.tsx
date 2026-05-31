import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tenantWhere } from "@/lib/tenant";
import { PageHeading } from "@/components/page-heading";
import { DataTable } from "@/components/data-table";
import { CreatePanel, EntityActions } from "@/components/crud-controls";
import { getDictionary } from "@/lib/i18n";

export default async function MembersPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.pages.members;
  const where = tenantWhere(session);
  const [members, sources] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { brand: true, source: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.qrSource.findMany({ where, include: { brand: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t.total}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{members.length.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{t.sources}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{sources.length.toLocaleString()}</p>
        </article>
      </section>
      <CreatePanel endpoint="/api/admin/members" fields={[
        { name: "sourceId", label: "QR source", type: "select", options: sources.map((source) => ({ label: `${source.brand.name} - ${source.name}`, value: source.id })), required: true },
        { name: "lineUserId", label: "LINE user ID", required: true },
        { name: "displayName", label: "Display name" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email" },
      ]} title={t.add} />
      <DataTable headers={["Name", "Brand", "Contact", "QR Source", "Registered", "Manage"]} rows={members.map((member) => [
        <strong key={member.id}>{member.displayName || "LINE Member"}</strong>, member.brand.name,
        <span key={`${member.id}-contact`}>{member.phone || "-"}<br /><small className="text-slate-400">{member.email || "No email"}</small></span>,
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700" key={`${member.id}-source`}>{member.source.code}</span>,
        member.createdAt.toLocaleString("th-TH"),
        <EntityActions endpoint={`/api/admin/members/${member.id}`} fields={[
          { name: "sourceId", label: "QR source", type: "select", options: sources.map((source) => ({ label: `${source.brand.name} - ${source.name}`, value: source.id })), required: true },
          { name: "displayName", label: "Display name" },
          { name: "phone", label: "Phone" },
          { name: "email", label: "Email" },
        ]} initial={{ sourceId: member.sourceId, displayName: member.displayName, phone: member.phone, email: member.email }} key={`${member.id}-actions`} label={member.displayName || "LINE Member"} />,
      ])} />
    </>
  );
}
