import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLineIdToken } from "@/lib/line";

const schema = z.object({ idToken: z.string(), demoLineUserId: z.string().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ID token" }, { status: 400 });
  try {
    return NextResponse.json({ profile: await verifyLineIdToken(parsed.data.idToken, parsed.data.demoLineUserId) });
  } catch {
    return NextResponse.json({ error: "Profile verification failed" }, { status: 401 });
  }
}
