// TEMPORAL (se borra antes de mergear): lista cruda de servicios de AgendaPro
// para armar el catálogo del buscador. Solo responde en vistas previas.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const host = new URL(ctx.request.url).hostname;
  if (!host.endsWith(".ba-consultorios-3da.pages.dev")) return new Response("no", { status: 404 });
  const auth = "Basic " + btoa(`${ctx.env.AGENDAPRO_USER}:${ctx.env.AGENDAPRO_PASSWORD}`);
  const out: unknown[] = [];
  const pages: unknown[] = [];
  for (let p = 1; p <= 10; p++) {
    const r = await fetch(`https://agendapro.com/api/public/v1/services?page=${p}&per_page=100`, { headers: { Authorization: auth, Accept: "application/json" } });
    const t = await r.text();
    let j: any; try { j = JSON.parse(t); } catch { pages.push({ p, status: r.status, text: t.slice(0, 300) }); break; }
    const arr = Array.isArray(j) ? j : (j.services ?? j.data ?? []);
    pages.push({ p, status: r.status, n: arr.length, keys: Array.isArray(j) ? "array" : Object.keys(j) });
    out.push(...arr);
    if (arr.length < 100) break;
  }
  return new Response(JSON.stringify({ pages, services: out }), { headers: { "content-type": "application/json" } });
};
