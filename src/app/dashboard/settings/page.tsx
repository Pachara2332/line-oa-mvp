import { CheckCircle2, Database, ExternalLink, KeyRound, LineChart, ShieldCheck, UserRound } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeading } from "@/components/page-heading";
import { getDictionary } from "@/lib/i18n";

function SettingRow({
  detail,
  icon: Icon,
  label,
  status,
}: {
  detail: string;
  icon: typeof ShieldCheck;
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-0">
      <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Icon size={18} /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
      </div>
      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{status}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await requireAdmin();
  const { dictionary } = await getDictionary();
  const t = dictionary.settings;
  const adminCredentialsReady = Boolean(session.username);
  const liffReady = Boolean(process.env.NEXT_PUBLIC_LIFF_ID && process.env.LINE_LIFF_CHANNEL_ID);

  return (
    <>
      <PageHeading eyebrow={t.eyebrow} title={t.title} detail={t.detail} />
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-white"><UserRound size={24} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t.signedIn}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">{session.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{session.role.replace("_", " ")}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{t.lineOnly}</p>
            <p className="mt-1 leading-6">{t.lineOnlyDetail}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-6">
          <SettingRow icon={ShieldCheck} label={t.lineChannel} detail={t.lineChannelDetail} status={adminCredentialsReady ? dictionary.common.ready : dictionary.common.setupNeeded} />
          <SettingRow icon={LineChart} label={t.liff} detail={t.liffDetail} status={liffReady ? dictionary.common.ready : dictionary.common.setupNeeded} />
          <SettingRow icon={Database} label={t.database} detail={t.databaseDetail} status={dictionary.common.connected} />
        </article>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 p-2 text-blue-700"><KeyRound size={18} /></span>
            <h2 className="text-lg font-bold text-slate-950">{t.security}</h2>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {[t.session, t.oauth, t.identity].map((item) => (
              <li className="flex items-center gap-2" key={item}><CheckCircle2 className="text-emerald-600" size={16} /> {item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">{t.beforeProduction}</p>
          <h2 className="mt-2 text-lg font-bold text-amber-950">{t.policy}</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">{t.policyDetail}</p>
          <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-900" href="https://nextjs.org/docs/app/guides/authentication" rel="noreferrer" target="_blank">
            {t.docs} <ExternalLink size={14} />
          </a>
        </article>
      </section>
    </>
  );
}
