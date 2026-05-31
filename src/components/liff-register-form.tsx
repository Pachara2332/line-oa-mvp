"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./ui/modal";
import { Spinner } from "./ui/spinner";

type Coupon = { id: string; title: string; description: string | null };
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

export function LiffRegisterForm({ sourceCode }: { sourceCode: string }) {
  const [idToken, setIdToken] = useState<string>();
  const [demoMode] = useState(!liffId);
  
  const [memberToken, setMemberToken] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [claimed, setClaimed] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  function showAlert(title: string, message: string) {
    setModalTitle(title);
    setModalMessage(message);
    setIsModalOpen(true);
  }

  useEffect(() => {
    if (!liffId) return;
    import("@line/liff").then(async ({ default: liff }) => {
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return;
      }
      setIdToken(liff.getIDToken() ?? undefined);
    }).catch(() => showAlert("ข้อผิดพลาด", "ไม่สามารถเริ่มต้น LIFF ได้"));
  }, []);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
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
        showAlert("เกิดข้อผิดพลาด", body.error);
        return;
      }
      setMemberToken(body.memberToken);
      setCoupons(body.coupons);
      showAlert("สำเร็จ", "สมัครสมาชิกสำเร็จ เลือกรับสิทธิ์ได้ด้านล่าง");
    } catch (error) {
      showAlert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function claim(couponId: string) {
    setIsClaiming(couponId);
    try {
      const response = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId, memberToken }),
      });
      const body = await response.json();
      if (!response.ok) {
        showAlert("เกิดข้อผิดพลาด", body.error);
        return;
      }
      setClaimed((current) => [...current, couponId]);
      showAlert("สำเร็จ", "รับสิทธิ์เรียบร้อยแล้ว");
    } catch (error) {
      showAlert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setIsClaiming(null);
    }
  }

  const renderModal = () => (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
      <p className="text-gray-600 dark:text-gray-300">{modalMessage}</p>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(false)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          ตกลง
        </button>
      </div>
    </Modal>
  );

  if (memberToken) {
    return (
      <section className="space-y-4">
        {renderModal()}
        {coupons.map((coupon) => (
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" key={coupon.id}>
            <h2 className="text-lg font-bold">{coupon.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{coupon.description}</p>
            <button 
              className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:bg-slate-300 transition-colors hover:bg-emerald-700" 
              disabled={claimed.includes(coupon.id) || isClaiming === coupon.id} 
              onClick={() => claim(coupon.id)}
            >
              {isClaiming === coupon.id ? <Spinner className="w-5 h-5 text-white" /> : null}
              {claimed.includes(coupon.id) ? "รับสิทธิ์แล้ว" : "รับสิทธิ์"}
            </button>
          </article>
        ))}
      </section>
    );
  }

  return (
    <>
      {renderModal()}
      <form className="space-y-4" onSubmit={register}>
        {demoMode && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Local demo mode: ยังไม่ได้ตั้งค่า LIFF ID</p>}
        <label className="block text-sm font-medium">ชื่อสมาชิก<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-emerald-500" name="displayName" required disabled={isSubmitting} /></label>
        <label className="block text-sm font-medium">เบอร์โทร<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-emerald-500" name="phone" required disabled={isSubmitting} /></label>
        <label className="block text-sm font-medium">Email<input className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-emerald-500" name="email" type="email" disabled={isSubmitting} /></label>
        <label className="flex gap-3 text-sm text-slate-600"><input name="consent" type="checkbox" required disabled={isSubmitting} /> ยินยอมให้จัดเก็บข้อมูลเพื่อสมัครสมาชิกและรับสิทธิ์</label>
        <button 
          className="w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-70 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner className="w-5 h-5 text-white" /> : null}
          สมัครสมาชิก
        </button>
      </form>
    </>
  );
}
