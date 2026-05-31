import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n";

function safeRedirect(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale: Locale = url.searchParams.get("locale") === "en" ? "en" : "th";
  (await cookies()).set("dashboard_locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return NextResponse.redirect(new URL(safeRedirect(url.searchParams.get("redirect")), request.url));
}
