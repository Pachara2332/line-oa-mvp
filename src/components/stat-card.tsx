import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  note,
  value,
}: {
  icon: LucideIcon;
  label: string;
  note: string;
  value: number | string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Icon size={18} /></span>
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-2 text-xs font-medium text-emerald-700">{note}</p>
    </article>
  );
}
