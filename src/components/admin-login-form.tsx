"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { Modal } from "./ui/modal";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      if (!response.ok) {
        setLoading(false);
        setModalMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setIsModalOpen(true);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setLoading(false);
      setModalMessage("ไม่สามารถเชื่อมต่อระบบได้");
      setIsModalOpen(true);
    }
  }

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="เข้าสู่ระบบไม่สำเร็จ">
        <p className="text-gray-600 dark:text-gray-300">{modalMessage}</p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(false)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </Modal>

      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-semibold text-slate-700">
          Username
          <span className="relative mt-2 block">
            <UserRound className="absolute left-3 top-3.5 text-slate-400" size={17} />
            <input className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-emerald-500" name="username" required disabled={loading} />
          </span>
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Password
          <span className="relative mt-2 block">
            <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={17} />
            <input className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-emerald-500" name="password" required type="password" disabled={loading} />
          </span>
        </label>
        <button className="w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors" disabled={loading}>
          {loading ? <Spinner className="w-5 h-5 text-white" /> : null}
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </>
  );
}
