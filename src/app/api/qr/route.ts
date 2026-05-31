import QRCode from "qrcode";

export async function GET(request: Request) {
  const text = new URL(request.url).searchParams.get("text");
  if (!text || text.length > 500) return new Response("Invalid QR content", { status: 400 });
  const png = await QRCode.toBuffer(text, { width: 256, margin: 1 });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
