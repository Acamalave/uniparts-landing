// Disparo y estado de la sincronización del catálogo (GitHub Actions `sync-odoo.yml`).
// El workflow lee Odoo (solo lectura), y si el catálogo cambió hace commit → Vercel publica.
import deployedMeta from "@/data/catalog-meta.json";

const REPO = process.env.GITHUB_REPO || "Acamalave/uniparts-landing";
const WORKFLOW = "sync-odoo.yml";

export type CatalogMeta = { syncedAt: string; total: number; conPrecio: number; conFoto: number };

export type SyncRun = {
  id: number;
  number: number;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: "success" | "failure" | "cancelled" | null;
  createdAt: string;
  updatedAt: string;
  url: string;
  event: string;
};

export const DEPLOYED_META = deployedMeta as CatalogMeta;
export const ACTIONS_URL = `https://github.com/${REPO}/actions/workflows/${WORKFLOW}`;
export const syncConfigured = () => Boolean(process.env.GITHUB_TOKEN);

async function gh(path: string, init: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN no configurado");
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`GitHub ${init.method || "GET"} ${path} → ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

/** Última ejecución del workflow (manual o programada). */
export async function getLatestRun(): Promise<SyncRun | null> {
  const data = await gh(`/actions/workflows/${WORKFLOW}/runs?per_page=1`);
  const r = data?.workflow_runs?.[0];
  if (!r) return null;
  return {
    id: r.id,
    number: r.run_number,
    status: r.status,
    conclusion: r.conclusion,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    url: r.html_url,
    event: r.event,
  };
}

/** Meta del catálogo que está en el repo (rama main). Si difiere del desplegado, Vercel está publicando. */
export async function getRepoMeta(): Promise<CatalogMeta | null> {
  try {
    const data = await gh(`/contents/src/data/catalog-meta.json?ref=main`);
    if (!data?.content) return null;
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf8")) as CatalogMeta;
  } catch {
    return null;
  }
}

/** Lanza el workflow (workflow_dispatch) en main. */
export async function dispatchSync(): Promise<void> {
  await gh(`/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: "main" }),
    headers: { "Content-Type": "application/json" },
  });
}
