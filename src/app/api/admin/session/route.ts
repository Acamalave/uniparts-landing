import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/admin/firebase-admin";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/admin/session";

export const runtime = "nodejs";

/** Intercambia el ID token de Firebase Auth por una cookie de sesión httpOnly. */
export async function POST(req: Request) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) {
    return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const snap = await adminDb.collection("admins").doc(decoded.uid).get();
    if (!snap.exists || snap.data()?.activo === false) {
      return NextResponse.json(
        { error: "Tu usuario no tiene acceso al centro de comando." },
        { status: 403 }
      );
    }
    const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const res = NextResponse.json({ ok: true, rol: snap.data()?.rol });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  }
}

/** Cierra la sesión. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
