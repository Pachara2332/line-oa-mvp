import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { tenantWhere } from "@/lib/tenant";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const members = await prisma.member.findMany({
    where: tenantWhere(session),
    include: { brand: true, source: true },
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    ["brand", "lineUserId", "displayName", "phone", "email", "source", "registeredAt"],
    ...members.map((member) => [
      member.brand.name,
      member.lineUserId,
      member.displayName,
      member.phone,
      member.email,
      member.source.name,
      member.createdAt.toISOString(),
    ]),
  ];
  return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="members.csv"',
    },
  });
}
