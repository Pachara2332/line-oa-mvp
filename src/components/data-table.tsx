export function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{headers.map((header) => <th className="px-5 py-4" key={header}>{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? rows.map((row, index) => (
            <tr className="hover:bg-slate-50/80" key={index}>{row.map((cell, cellIndex) => <td className="px-5 py-4" key={cellIndex}>{cell}</td>)}</tr>
          )) : <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={headers.length}>No data yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
