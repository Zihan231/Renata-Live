import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendRecord } from "@/lib/store";
import { SESSION_COOKIE, encodeSession } from "@/lib/session";

/** Accepts 01XXXXXXXXX, 8801XXXXXXXXX or +8801XXXXXXXXX; returns 8801XXXXXXXXX. */
function normalizeBdPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("880") ? digits.slice(2) : digits;
  return /^01[3-9]\d{8}$/.test(local) ? `88${local}` : null;
}

export async function POST(req: Request) {
  let body: { name?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const phone = typeof body.phone === "string" ? normalizeBdPhone(body.phone) : null;

  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 422 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Please enter a valid Bangladeshi mobile number." }, { status: 422 });
  }

  const id = randomUUID();
  await appendRecord("registrations", {
    id,
    name,
    phone,
    createdAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? "",
  });

  const res = NextResponse.json({ ok: true, name });
  res.cookies.set(SESSION_COOKIE, encodeSession({ id, name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
