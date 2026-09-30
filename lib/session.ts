import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "rl_session";

export type Viewer = { id: string; name: string };

export function encodeSession(v: Viewer) {
  return Buffer.from(JSON.stringify(v)).toString("base64url");
}

export async function getViewer(): Promise<Viewer | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const v = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return typeof v?.id === "string" && typeof v?.name === "string" ? v : null;
  } catch {
    return null;
  }
}

/** For gated pages: returns the viewer or sends them back to registration. */
export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/");
  return v;
}
