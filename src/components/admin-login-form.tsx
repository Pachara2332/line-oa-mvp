"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block text-sm font-semibold text-slate-700">
        Username
        <span className="relative mt-2 block">
          <UserRound className="absolute left-3 top-3.5 text-slate-400" size={17} />
          <input className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-emerald-500" name="username" required />
        </span>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Password
        <span className="relative mt-2 block">
          <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={17} />
          <input className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-emerald-500" name="password" required type="password" />
        </span>
      </label>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
