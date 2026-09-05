// Firebase Admin SDK — SOLO servidor. Nunca importar desde componentes cliente.
// Usa la cuenta de servicio guardada en FIREBASE_SERVICE_ACCOUNT_B64 (.env.local / Vercel).
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (!b64) {
    throw new Error(
      "Falta FIREBASE_SERVICE_ACCOUNT_B64 (cuenta de servicio de Firebase en base64)."
    );
  }
  return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
}

const app: App =
  getApps()[0] ?? initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
