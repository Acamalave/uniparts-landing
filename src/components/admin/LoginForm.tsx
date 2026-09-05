"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const errorMsg = (code: string) => {
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Correo o contraseña incorrectos.";
  if (code.includes("too-many-requests")) return "Demasiados intentos. Espera unos minutos.";
  if (code.includes("network")) return "Sin conexión. Revisa tu internet.";
  return "No se pudo iniciar sesión.";
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await cred.user.getIdToken();
      const r = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      // La cookie del servidor es la fuente de verdad; limpiamos el estado del cliente.
      await signOut(auth).catch(() => {});
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo iniciar sesión.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      const message = (err as { message?: string })?.message || "";
      setError(code ? errorMsg(code) : message || "No se pudo iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@upandina.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange hover:bg-brand-orange-dark disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
