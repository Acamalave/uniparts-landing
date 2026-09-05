// Usuarios del admin (colección Firestore `admins`, keyed por uid de Firebase Auth). Solo servidor.
import { adminDb } from "./firebase-admin";
import type { AdminRole } from "./config";

export type AdminUserRecord = {
  uid: string;
  email: string;
  nombre: string;
  rol: AdminRole;
  activo: boolean;
};

export async function listAdmins(): Promise<AdminUserRecord[]> {
  const snap = await adminDb.collection("admins").orderBy("email").get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      uid: doc.id,
      email: d.email,
      nombre: d.nombre || d.email,
      rol: (d.rol as AdminRole) || "asesor",
      activo: d.activo !== false,
    };
  });
}
