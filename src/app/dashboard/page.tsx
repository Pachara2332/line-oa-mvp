import Link from "next/link";
import { ArrowUpRight, Gift, QrCode, ScanLine, TicketCheck, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tenantWhere } from "@/lib/tenant";
import { StatCard } from "@/components/stat-card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { getDictionary } from "@/lib/i18n";

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export default async function DashboardPage() {
  const session = await requireAdmin();
  const { dictionary, locale } = await getDictionary();
  const t = dictionary.overview;
  const where = tenantWhere(session);
  const trendStart = new Date();
  trendStart.setHours(0, 0, 0, 0);
  trendStart.setDate(trendStart.getDate() - 6);
  const [members, coupons, claims, used, sources, recentMembers, trendMembers, claimRows] = await Promise.all([
    prisma.member.count({ where }),
    prisma.coupon.count({ where }),
    prisma.couponClaim.count({ where: { coupon: where } }),
    prisma.couponClaim.count({ where: { coupon: where, status: "USED" } }),
    prisma.qrSource.findMany({
      where,
      include: { _count: { select: { members: true } } },
      orderBy: { members: { _count: "desc" } },
      take: 4,
    }),
    prisma.member.findMany({
      where,
      include: { source: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.member.findMany({
      where: { ...where, createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
    prisma.couponClaim.findMany({
      where: { coupon: where },
      select: { status: true },
    }),
  ]);
  const sourceMembers = sources.reduce((sum, source) => sum + source._count.members, 0);
  const redemptionRate = percentage(used, claims);
  const dateLocale = locale === "th" ? "th-TH" : "en-US";
  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(trendStart);
    date.setDate(date.getDate() + index);
    return {
      date,
      value: trendMembers.filter((member) => member.createdAt.toDateString() === date.toDateString()).length,
    };
  });
  const claimStatuses = ["CLAIMED", "USED", "EXPIRED", "CANCELLED"] as const;
  const claimData = claimStatuses.map((status) => claimRows.filter((claim) => claim.status === status).length);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{t.eyebrow}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.detail}</p>
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900" href="/dashboard/qr-sources">
          {t.manageSources} <ArrowUpRight size={16} />
        </Link>
      </header>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label={t.totalMembers} value={members} note={t.memberNote} />
        <StatCard icon={QrCode} label={t.sources} value={sources.length} note={t.sourceNote} />
        <StatCard icon={Gift} label={t.activeCoupons} value={coupons} note={t.couponNote} />
        <StatCard icon={TicketCheck} label={t.redemptionRate} value={`${redemptionRate}%`} note={`${used.toLocaleString()} ${t.confirmed}`} />
      </section>

      <DashboardCharts
        claimData={claimData}
        claimDetail={t.claimDetail}
        claimLabels={[...claimStatuses]}
        claimTitle={t.claimHealth}
        trendData={trend.map((item) => item.value)}
        trendDetail={t.trendDetail}
        trendLabels={trend.map((item) => item.date.toLocaleDateString(dateLocale, { weekday: "short" }))}
        trendTitle={t.trendTitle}
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t.attribution}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{t.sourcePerformance}</h2>
            </div>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><ScanLine size={19} /></span>
          </div>
          <div className="mt-6 space-y-5">
            {sources.length ? sources.map((source) => {
              const share = percentage(source._count.members, sourceMembers);
              return (
                <div key={source.id}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{source.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-400">{source.code}</p>
                    </div>
                    <div className="text-right">
                      <strong className="text-lg text-slate-950">{source._count.members.toLocaleString()}</strong>
                      <p className="text-xs text-slate-400">{t.memberUnit}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            }) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">{t.noSources}</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t.liveFeed}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{t.recent}</h2>
            </div>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><UserPlus size={19} /></span>
          </div>
          <div className="mt-5 space-y-2">
            {recentMembers.length ? recentMembers.map((member) => (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3" key={member.id}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {(member.displayName || "L").slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{member.displayName || "LINE Member"}</p>
                  <p className="truncate text-xs text-slate-400">{member.source.name}</p>
                </div>
                <time className="text-[11px] text-slate-400">{member.createdAt.toLocaleDateString(dateLocale)}</time>
              </div>
            )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">{t.noRegistrations}</p>}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">{t.velocity}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-bold">{claims.toLocaleString()}</p>
              <p className="mt-1 text-sm text-emerald-100">{t.claims}</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-emerald-300 hover:text-white" href="/dashboard/coupons">
              {t.couponDetails} <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${redemptionRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-emerald-200">{redemptionRate}% {t.redeemed}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t.nextAction}</p>
          <h2 className="mt-3 text-lg font-bold text-emerald-950">{t.growCoverage}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-800">{t.growDetail}</p>
        </article>
      </section>
    </>
  );
}
