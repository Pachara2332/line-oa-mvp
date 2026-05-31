"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const nextLocale = locale === "th" ? "en" : "th";
  return (
    <a
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-emerald-400"
      href={`/api/locale?locale=${nextLocale}&redirect=${encodeURIComponent(pathname)}`}
    >
      <Languages size={15} /> {nextLocale.toUpperCase()}
    </a>
  );
}
