// Sesión del admin (servidor). La cookie es un "session cookie" firmado por Firebase.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "./firebase-admin";
import type { AdminRole } from "./config";

export const SESSION_COOKIE = "admin_session";
export const SESSION_DAYS = 5;

export type AdminSession = {
  uid: string;
  email: string;
  nombre: string;
  rol: AdminRole;
};

/** Devuelve la sesión actual o null si no hay / es inválida / el usuario está inactivo. */
export async function getSession(): Promise<AdminSession | null> {
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const snap = await adminDb.collection("admins").doc(decoded.uid).get();
    if (!snap.exists) return null;
    const d = snap.data()!;
    if (d.activo === false) return null;
    return {
      uid: decoded.uid,
      email: decoded.email || d.email,
      nombre: d.nombre || decoded.email || "",
      rol: (d.rol as AdminRole) || "asesor",
    };
  } catch {
    return null;
  }
}

/** Para layouts/páginas del panel: exige sesión válida o redirige al login. */
export async function requireAdmin(): Promise<AdminSession> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
