import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-950 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">LINE OA MVP</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Admin Dashboard</h1>
        <p className="mb-8 mt-2 text-sm leading-6 text-slate-500">เข้าสู่ระบบสำหรับผู้ดูแล เพื่อจัดการสมาชิก QR Source และคูปอง</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
