// TEMPORAL (se borra antes de mergear): prueba qué servicios de AgendaPro
// devuelven horarios por sucursal o por el prestador ECOGRAFIAS. Solo en vistas previas.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
const IDS = [1048494,1087345,1087355,1143451,1161749,1171937,1388306,1412121,1516605,1527463,1527467,1527476,1554215,1554218,1554219,1554220,1554222,1666194,1674657,1679337,1783061,2022987,2051727,2051736,2051741,2051745,2051753,2051763,2051768,2051774,2051783,2053869,2148692,2148706,2155223,2284631,234460,235007,235067,235070,235072,235075,235077,235079,235083,235093,235100,235102,235103,235105,235106,235109,235118,235712,235907,236656,236657,236658,236660,238286,241878,241885,244883,247226,2480574,2480575,2480576,2484411,2506853,257915,267272,2713894,2773746,2842409,2943756,3001189,3009914,3009933,3010009,3020505,3026900,3033616,3036962,3079674,3150332,441623,441626,441630,441633,441648,443521,470296,480998,516094,524838,525844,526589,567159,580001,580003,580005,583123,641065,659753,684383,686110,825299,825314,878551,916471,924558,957131,972908,973487, 244881, 244883];
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
