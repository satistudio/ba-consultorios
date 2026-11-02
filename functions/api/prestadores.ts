// Diagnóstico temporal (se borra al terminar): qué prestador atiende cada servicio.
// Sin nombres de profesionales: se tachan antes de devolver.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
const RUTAS = [
  "services/254779", "services/2690377", "services/502524", "services/244881",
  "service_providers", "locations/9099/providers", "locations/9099", "providers?location_id=9099",
];
const tachar = (t: string) => t.replace(/"(public_name|name|first_name|last_name|email|phone|lastname|full_name)":"[^"]*"/g, '"$1":"-"');
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { AGENDAPRO_USER: user, AGENDAPRO_PASSWORD: password } = context.env;
  if (!user || !password) return Response.json({ ok: false });
  const out: Record<string, string> = {};
  for (const r of RUTAS) {
    const res = await fetch(`https://agendapro.com/api/public/v1/${r}`, {
      headers: { Authorization: "Basic " + btoa(`${user}:${password}`), Accept: "application/json" },
    });
    out[r] = `${res.status} ${tachar((await res.text()).slice(0, 1200))}`;
  }
  return Response.json(out, { headers: { "cache-control": "no-store" } });
};
