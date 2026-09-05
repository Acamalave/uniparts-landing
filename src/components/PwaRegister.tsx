"use client";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "up_install_dismissed";

/** Registra el service worker (solo en producción) y ofrece instalar la app. */
export default function PwaRegister() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
      try {
        if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !installEvt) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60] bg-brand-dark text-white rounded-2xl shadow-2xl border border-white/10 p-4 flex items-center gap-3 animate-fade-in-up">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Instala la app de Uniparts</p>
        <p className="text-xs text-white/60">Catálogo y pedidos a un toque, sin abrir el navegador.</p>
      </div>
      <button
        onClick={async () => {
          await installEvt.prompt();
          const { outcome } = await installEvt.userChoice;
          if (outcome !== "accepted") dismiss();
          else setVisible(false);
        }}
        className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-bold px-3.5 py-2 rounded-lg"
      >
        Instalar
      </button>
      <button onClick={dismiss} aria-label="Cerrar" className="text-white/50 hover:text-white">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}
