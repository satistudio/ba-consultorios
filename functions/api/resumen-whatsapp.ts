// Resumen diario por Telegram: reservas online, confirmaciones y toques a
// WhatsApp del día. Lo dispara .github/workflows/resumen-diario.yml a la
// noche (hora argentina) con el secreto AVISOS_SECRET.
//
// Qué día resume: el que terminó (ver diaACerrar en _lib/avisos.ts). El cron
// de GitHub llegó a correr 3-4 h tarde; antes el resumen tomaba el día nuevo
// y por eso decía "0 reservas" aunque hubiera habido varias.
//
// Para reenviar un día puntual (por ejemplo, para cargarlo en la planilla):
//   curl -X POST -H "Authorization: Bearer <AVISOS_SECRET>" \
//     "https://baconsultoriosmedicos.com.ar/api/resumen-whatsapp?fecha=2026-11-16"
// Con &silencioso=1 solo lo carga en la planilla, sin mandar Telegram.
//
// Registro diario (opcional): si están REGISTRO_URL y REGISTRO_SECRET, además
// manda una fila con los números del día a la app web de Apps Script de la
// planilla "Métricas BA · registro diario". Nunca lleva datos de pacientes.

import { AvisosEnv, avisarATodas, compararSecreto, diaACerrar, etiquetaDia, leerContador } from "../_lib/avisos";

interface Env extends AvisosEnv {
  REGISTRO_URL?: string;
  REGISTRO_SECRET?: string;
}

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

const ORIGENES_WA = ["web", "ig", "status", "canal", "fb", "ads", "gmb", "otro"];

function plural(n: number, uno: string, varios: string): string {
  return n === 1 ? uno : `${n} ${varios}`;
}

async function cargarEnPlanilla(env: Env, fila: Record<string, string | number>) {
  if (!env.REGISTRO_URL || !env.REGISTRO_SECRET) return "sin configurar";
  try {
    const res = await fetch(env.REGISTRO_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secreto: env.REGISTRO_SECRET, fila })
    });
    const cuerpo = await res.text();
    if (!res.ok || !cuerpo.includes('"ok":true')) {
      console.error("La planilla respondió con error:", res.status, cuerpo.slice(0, 300));
      return "error";
    }
    return "ok";
  } catch (err) {
    console.error("Falló el envío a la planilla:", err);
    return "error";
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const token = (request.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!compararSecreto(token, env.AVISOS_SECRET)) return new Response("No autorizado", { status: 403 });

  const url = new URL(request.url);
  const pedido = url.searchParams.get("fecha") ?? "";
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(pedido) ? pedido : diaACerrar();
  const silencioso = url.searchParams.get("silencioso") === "1";

  const wa = await leerContador(env, `wa:${dia}`);
  const res = await leerContador(env, `res:${dia}`);
  const totalWa = Object.values(wa).reduce((a, b) => a + b, 0);
  const totalRes = res.total ?? 0;
  const confirmadas = res.confirmadas ?? 0;
  const cambios = res.cambios ?? 0;
  const canceladas = res.canceladas ?? 0;

  const detalle = Object.entries(wa)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${NOMBRES[k] ?? k} ${n}`)
    .join(", ");

  const lineas = [
    `🌙 ¡Hola! Así cerró el ${etiquetaDia(dia)}:`,
    "",
    `📅 ${plural(totalRes, "1 reserva online (viene de Sati Studio)", "reservas online (vienen de Sati Studio)")}`,
    `✅ ${plural(confirmadas, "1 paciente confirmó su turno", "pacientes confirmaron su turno")}`
  ];
  if (canceladas > 0) lineas.push(`❌ ${plural(canceladas, "1 paciente canceló su turno", "pacientes cancelaron su turno")}`);
  lineas.push(
    `💬 ${plural(totalWa, "1 persona abrió el WhatsApp", "personas abrieron el WhatsApp")}${detalle ? ` (${detalle})` : ""}`,
    "",
    "¡Mañana seguimos! 💜 Sati Studio"
  );

  if (!silencioso) await avisarATodas(env, lineas.join("\n"));

  const fila: Record<string, string | number> = {
    fecha: dia,
    reservas_online: totalRes,
    confirmadas,
    cambios,
    canceladas,
    wa_total: totalWa
  };
  for (const o of ORIGENES_WA) fila[`wa_${o}`] = wa[o] ?? 0;
  const planilla = await cargarEnPlanilla(env, fila);

  return new Response(JSON.stringify({ ok: true, dia, totalRes, confirmadas, cambios, canceladas, totalWa, planilla }), {
    headers: { "content-type": "application/json" }
  });
};
