"use client";

import { FormEvent, useEffect, useState } from "react";

type Coupon = { id: string; title: string; description: string | null };
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

export function LiffRegisterForm({ sourceCode }: { sourceCode: string }) {
  const [idToken, setIdToken] = useState<string>();
  const [demoMode] = useState(!liffId);
  const [message, setMessage] = useState("");
  const [memberToken, setMemberToken] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);

  useEffect(() => {
    if (!liffId) return;
    import("@line/liff").then(async ({ default: liff }) => {
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return;
      }
      setIdToken(liff.getIDToken() ?? undefined);
    }).catch(() => setMessage("ไม่สามารถเริ่มต้น LIFF ได้"));
  }, []);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/liff/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceCode,
        idToken,
        demoLineUserId: demoMode ? `demo-${form.get("phone")}` : undefined,
        displayName: form.get("displayName"),
        phone: form.get("phone"),
        email: form.get("email"),
        consent: form.get("consent") === "on",
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error);
      return;
    }
    setMemberToken(body.memberToken);
    setCoupons(body.coupons);
    setMessage("สมัครสมาชิกสำเร็จ เลือกรับสิทธิ์ได้ด้านล่าง");
  }

  async function claim(couponId: string) {
    const response = await fetch("/api/coupons/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId, memberToken }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error);
      return;
    }
    setClaimed((current) => [...current, couponId]);
    setMessage("รับสิทธิ์เรียบร้อยแล้ว");
  }

  if (memberToken) {
    return (
      <section className="space-y-4">
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>
        {coupons.map((coupon) => (
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" key={coupon.id}>
            <h2 className="text-lg font-bold">{coupon.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{coupon.description}</p>
            <button className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300" disabled={claimed.includes(coupon.id)} onClick={() => claim(coupon.id)}>
              {claimed.includes(coupon.id) ? "รับสิทธิ์แล้ว" : "รับสิทธิ์"}
            </button>
          </article>
        ))}
      </section>
    );
  }

  return (
    <form className="space-y-4" onSubmit={register}>
      {demoMode && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Local demo mode: ยังไม่ได้ตั้งค่า LIFF ID</p>}
      <label className="block text-sm font-medium">ชื่อสมาชิก<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" name="displayName" required /></label>
      <label className="block text-sm font-medium">เบอร์โทร<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" name="phone" required /></label>
      <label className="block text-sm font-medium">Email<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" name="email" type="email" /></label>
      <label className="flex gap-3 text-sm text-slate-600"><input name="consent" type="checkbox" required /> ยินยอมให้จัดเก็บข้อมูลเพื่อสมัครสมาชิกและรับสิทธิ์</label>
      {message && <p className="text-sm text-red-600">{message}</p>}
      <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">สมัครสมาชิก</button>
    </form>
  );
}
