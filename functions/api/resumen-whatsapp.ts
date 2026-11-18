// Resumen diario por Telegram: reservas online y toques a WhatsApp del día.
// Lo dispara .github/workflows/resumen-diario.yml a las 21 h (hora argentina)
// con el secreto AVISOS_SECRET. Se puede probar a mano con:
//   curl -X POST -H "Authorization: Bearer <AVISOS_SECRET>" https://baconsultoriosmedicos.com.ar/api/resumen-whatsapp

import { AvisosEnv, avisarATodas, compararSecreto, fechaAR, leerContador } from "../_lib/avisos";

const NOMBRES: Record<string, string> = {
  web: "web",
  ig: "Instagram",
  status: "Status",
  canal: "Canal",
  fb: "Facebook",
  ads: "anuncios",
  gmb: "Google Maps",
  otro: "otros links"
};

export const onRequestPost: PagesFunction<AvisosEnv> = async ({ request, env }) => {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!compararSecreto(token, env.AVISOS_SECRET)) return new Response("No autorizado", { status: 403 });

  const hoy = fechaAR();
  const wa = await leerContador(env, `wa:${hoy}`);
  const res = await leerContador(env, `res:${hoy}`);
  const totalWa = Object.values(wa).reduce((a, b) => a + b, 0);
  const totalRes = res.total ?? 0;

  const detalle = Object.entries(wa)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${NOMBRES[k] ?? k} ${n}`)
    .join(", ");
  const [, m, d] = hoy.split("-");
  const reservas = totalRes === 1 ? "1 reserva online" : `${totalRes} reservas online`;
  const chats = totalWa === 1 ? "1 persona abrió el WhatsApp" : `${totalWa} personas abrieron el WhatsApp`;
  const texto = [
    `🌙 ¡Hola! Así cerró hoy ${d}/${m}:`,
    "",
    `📅 ${reservas}`,
    `💬 ${chats}${detalle ? ` (${detalle})` : ""}`,
    "",
    "¡Mañana seguimos! 💜 Sati Studio"
  ].join("\n");

  await avisarATodas(env, texto);
  return new Response(JSON.stringify({ ok: true, hoy, totalRes, totalWa }), { headers: { "content-type": "application/json" } });
};
