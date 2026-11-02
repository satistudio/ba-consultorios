// Diagnóstico temporal (se borra al terminar): qué prestador atiende un servicio.
// Solo ids, sin nombres de profesionales.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { AGENDAPRO_USER: user, AGENDAPRO_PASSWORD: password } = context.env;
  if (!user || !password) return Response.json({ ok: false });
  const url = new URL(context.request.url);
  const s = Number(url.searchParams.get("s"));
  const o = Number(url.searchParams.get("o") || 0);
  const h = { Authorization: "Basic " + btoa(`${user}:${password}`), Accept: "application/json" };
  const base = "https://agendapro.com/api/public/v1";
  const provs = (await (await fetch(`${base}/locations/9099/providers`, { headers: h })).json()) as { id: number }[];
  const d = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10);
  const ok: string[] = [];
  const lote = provs.slice(o, o + 45);
  await Promise.all(lote.map(async (p) => {
    const r = await fetch(`${base}/services/${s}/available_hours?date=${d}&provider_id=${p.id}`, { headers: h });
    if (r.ok) {
      const j = (await r.json()) as { available_hours?: unknown[] };
      ok.push(`${p.id}:${j.available_hours?.length ?? "?"}`);
    }
  }));
  return Response.json({ s, total: provs.length, o, ok }, { headers: { "cache-control": "no-store" } });
};
