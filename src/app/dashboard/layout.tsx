import Link from "next/link";
import { Download, LogOut, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { LanguageSwitch } from "@/components/language-switch";
import { getDictionary } from "@/lib/i18n";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const { dictionary, locale } = await getDictionary();
  return (
    <div className="min-h-screen bg-[#f5f7f7]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-emerald-950 p-5 text-white lg:block">
        <Link href="/dashboard" className="block border-b border-white/10 pb-5">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">LINE OA</span>
          <strong className="mt-1 block text-xl">{dictionary.shell.console}</strong>
        </Link>
        <div className="py-5"><DashboardNav labels={dictionary.nav} superAdmin={session.role === "SUPER_ADMIN"} /></div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/10 p-4 text-xs text-emerald-100">
          <p className="font-semibold text-white">{session.name}</p>
          <p className="mt-1 flex items-center gap-1 opacity-70"><ShieldCheck size={13} /> {session.role.replace("_", " ")}</p>
          <LogoutButton text={dictionary.shell.signOut} />
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">LINE OA</p>
            <strong className="text-lg text-slate-950">{dictionary.shell.console}</strong>
          </div>
          <LanguageSwitch locale={locale} />
        </div>
      </header>
      <main className="min-h-screen px-5 py-6 pb-24 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{dictionary.shell.workspace}</p>
              <p className="mt-1 text-sm text-slate-500">{dictionary.shell.workspaceDetail}</p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitch locale={locale} />
              <a className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-400" href="/api/admin/export">
                <Download size={16} /> {dictionary.shell.export}
              </a>
            </div>
          </div>
          {children}
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <DashboardNav labels={dictionary.nav} mobile superAdmin={session.role === "SUPER_ADMIN"} />
      </div>
    </div>
  );
}
