import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/session";
import {
  ACTIONS_URL,
  DEPLOYED_META,
  dispatchSync,
  getLatestRun,
  getRepoMeta,
  syncConfigured,
} from "@/lib/admin/github-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAN_TRIGGER = new Set(["superadmin", "owner", "gerente"]);

/** Estado de la sincronización: catálogo desplegado, catálogo en el repo y última ejecución. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const configured = syncConfigured();
  const [run, repo] = configured
    ? await Promise.all([getLatestRun().catch(() => null), getRepoMeta()])
    : [null, null];

  return NextResponse.json({
    configured,
    canTrigger: CAN_TRIGGER.has(session.rol),
    deployed: DEPLOYED_META,
    repo,
    run,
    actionsUrl: ACTIONS_URL,
    now: new Date().toISOString(),
  });
}

/** Dispara la sincronización (workflow_dispatch). */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!CAN_TRIGGER.has(session.rol)) {
    return NextResponse.json({ error: "Tu rol no puede lanzar sincronizaciones." }, { status: 403 });
  }
  if (!syncConfigured()) {
    return NextResponse.json({ error: "Falta GITHUB_TOKEN en el servidor." }, { status: 503 });
  }
  const current = await getLatestRun().catch(() => null);
  if (current && current.status !== "completed") {
    return NextResponse.json({ ok: true, alreadyRunning: true, run: current });
  }
  try {
    await dispatchSync();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo lanzar la sincronización." },
      { status: 502 }
    );
  }
}
