"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCheck } from "lucide-react";

export function RedeemClaimButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function redeem() {
    if (!window.confirm("Mark this coupon as redeemed?")) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/coupons/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId }),
    });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) return setError(body.error);
    router.refresh();
  }

  return (
    <div>
      <button className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60" disabled={saving} onClick={redeem}>
        <TicketCheck size={13} /> {saving ? "Saving..." : "Redeem"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
