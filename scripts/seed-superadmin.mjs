#!/usr/bin/env node
// Siembra el superadmin en Firebase Auth + Firestore (`admins/{uid}`) y genera
// un enlace para que defina su propia contraseña. Lee .env.local. Idempotente.
//
// Uso: node scripts/seed-superadmin.mjs
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomBytes } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const email = env.ADMIN_SUPERADMIN_EMAIL;
const nombre = env.ADMIN_SUPERADMIN_NAME || "Acacio Malavé";
if (!email || !env.FIREBASE_SERVICE_ACCOUNT_B64) {
  console.error("Faltan ADMIN_SUPERADMIN_EMAIL o FIREBASE_SERVICE_ACCOUNT_B64 en .env.local");
  process.exit(1);
}

const sa = JSON.parse(Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8"));
initializeApp({ credential: cert(sa) });
const auth = getAuth();
const db = getFirestore();

let user;
try {
  user = await auth.getUserByEmail(email);
  console.log("Usuario Auth ya existía:", user.uid);
} catch {
  user = await auth.createUser({
    email,
    displayName: nombre,
    password: randomBytes(24).toString("base64url"), // temporal; se cambia con el enlace
    emailVerified: true,
  });
  console.log("Usuario Auth creado:", user.uid);
}

await db.collection("admins").doc(user.uid).set(
  { email, nombre, rol: "superadmin", activo: true, creadoEn: new Date().toISOString() },
  { merge: true }
);
console.log("Firestore admins/%s -> superadmin OK", user.uid);

// Sin `url` de continuación: evita "unauthorized-continue-uri" si el dominio
// aún no está en los dominios autorizados de Firebase Auth.
const link = await auth.generatePasswordResetLink(email);
console.log("\nENLACE PARA DEFINIR CONTRASEÑA (válido ~1 hora):\n" + link + "\n");
