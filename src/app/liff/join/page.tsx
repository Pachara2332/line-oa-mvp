import { LiffRegisterForm } from "@/components/liff-register-form";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  if (!source) return <main className="p-8 text-center">QR source is missing.</main>;
  return (
    <main className="mx-auto min-h-screen max-w-lg bg-slate-50 p-6">
      <header className="mb-7 rounded-3xl bg-emerald-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">LINE OA Membership</p>
        <h1 className="mt-3 text-3xl font-bold">สมัครสมาชิก</h1>
        <p className="mt-2 text-sm text-emerald-100">ลงทะเบียนเพื่อรับสิทธิ์พิเศษจากแบรนด์</p>
        <code className="mt-5 block rounded-lg bg-white/10 px-3 py-2 text-xs">{source}</code>
      </header>
      <LiffRegisterForm sourceCode={source} />
    </main>
  );
}
