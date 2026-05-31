export function PageHeading({
  title,
  detail,
  eyebrow,
}: {
  title: string;
  detail: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-7">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{detail}</p>
    </header>
  );
}
