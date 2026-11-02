// TEMPORAL (se borra antes de mergear): prueba qué servicios de AgendaPro
// devuelven horarios por sucursal o por el prestador ECOGRAFIAS. Solo en vistas previas.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
const IDS = [, 244881, 244883];
export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const host = new URL(ctx.request.url).hostname;
  if (!host.endsWith(".ba-consultorios-3da.pages.dev")) return new Response("no", { status: 404 });
  const auth = "Basic " + btoa(`${ctx.env.AGENDAPRO_USER}:${ctx.env.AGENDAPRO_PASSWORD}`);
  const d = new Date(Date.now() - 3 * 3600_000);
  const dates = [0, 1, 2, 3].map((o) => new Date(d.getTime() + o * 86400_000).toISOString().slice(0, 10));
  const q = async (id: number, scope: string) => {
    let out = "";
    for (const date of dates) {
      try {
        const r = await fetch(`https://agendapro.com/api/public/v1/services/${id}/available_hours?date=${date}&${scope}`, { headers: { Authorization: auth, Accept: "application/json" } });
        const t = await r.text();
        let j: any; try { j = JSON.parse(t); } catch { return `HTTP${r.status}:${t.slice(0, 60)}`; }
        if (Array.isArray(j?.available_hours)) { if (j.available_hours.length) return `OK ${date} ${j.available_hours.length}`; out = "vacio"; }
        else return `ERR ${r.status} ${JSON.stringify(j).slice(0, 80)}`;
      } catch (e) { return "EXC"; }
    }
    return out;
  };
  const res = [];
  for (let i = 0; i < IDS.length; i += 10) {
    res.push(...await Promise.all(IDS.slice(i, i + 10).map(async (id) => {
      const loc = await q(id, "location_id=9099");
      const eco = loc.startsWith("OK") ? "-" : await q(id, "provider_id=82112");
      return { id, loc, eco };
    })));
  }
  return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
};
