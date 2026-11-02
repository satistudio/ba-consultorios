// Diagnóstico temporal (se borra al terminar): qué prestador atiende cada servicio.
// Devuelve solo ids, sin nombres de profesionales.
interface Env { AGENDAPRO_USER: string; AGENDAPRO_PASSWORD: string }
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { AGENDAPRO_USER: user, AGENDAPRO_PASSWORD: password } = context.env;
  if (!user || !password) return Response.json({ ok: false });
  const res = await fetch("https://agendapro.com/api/public/v1/providers", {
    headers: { Authorization: "Basic " + btoa(`${user}:${password}`), Accept: "application/json" },
  });
  const texto = await res.text();
  try {
    const lista = JSON.parse(texto) as Record<string, unknown>[];
    return Response.json({
      ok: res.ok,
      claves: Object.keys(lista[0] ?? {}),
      lista: lista.map((p) => ({ id: p.id, location: p.location_id ?? p.locations ?? null, services: p.services ?? p.service_ids ?? null })),
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ok: res.ok, status: res.status, muestra: texto.slice(0, 1500).replace(/"(public_name|name|first_name|last_name|email)":"[^"]*"/g, '"$1":"-"') });
  }
};
