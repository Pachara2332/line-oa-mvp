"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Gift, QrCode, Settings, TicketCheck, Users } from "lucide-react";

const links = [
  { href: "/dashboard", key: "overview", icon: BarChart3 },
  { href: "/dashboard/members", key: "members", icon: Users },
  { href: "/dashboard/coupons", key: "coupons", icon: Gift },
  { href: "/dashboard/qr-sources", key: "qrSources", icon: QrCode },
  { href: "/dashboard/claims", key: "claims", icon: TicketCheck },
  { href: "/dashboard/brands", key: "brands", icon: Building2 },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
];

export function DashboardNav({
  mobile = false,
  labels,
  superAdmin,
}: {
  mobile?: boolean;
  labels: Record<(typeof links)[number]["key"], string>;
  superAdmin: boolean;
}) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => {
    if (!superAdmin && link.href === "/dashboard/brands") return false;
    if (mobile) return ["/dashboard", "/dashboard/members", "/dashboard/coupons", "/dashboard/settings"].includes(link.href);
    return true;
  });

  return (
    <nav className={mobile ? "grid grid-cols-4 gap-1" : "space-y-1"}>
      {visibleLinks.map(({ href, key, icon: Icon }) => (
        <Link
          className={
            mobile
              ? `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold ${
                  pathname === href ? "bg-emerald-600 text-white" : "text-slate-500"
                }`
              : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  pathname === href ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-50 hover:bg-white/10"
                }`
          }
          href={href}
          key={href}
        >
          <Icon size={mobile ? 20 : 18} /> {labels[key]}
        </Link>
      ))}
    </nav>
  );
}
