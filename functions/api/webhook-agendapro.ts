// Cloudflare Pages Function — recibe webhooks de AgendaPro (reservas creadas,
// actualizadas, canceladas). Con cada reserva online nueva avisa por mail
// (Resend) y por Telegram; las confirmaciones y cambios solo se cuentan.
//
// Para qué sirve: registro automático de cada reserva con su origen, sin
// depender de que nadie lo anote a mano. Base para cruzar contra sprints de Meta.
//
// Configuración (una vez):
// 1. Cloudflare ya debe tener RESEND_API_KEY cargada (la misma del formulario).
// 2. En AgendaPro > Configuraciones > Integraciones / API Pública > Webhooks:
//      https://baconsultoriosmedicos.com.ar/api/webhook-agendapro
//    (confirmado activo al 14/09/2026)
//
// Estructura real del payload (confirmada con capturas de webhook.site,
// 14/09/2026, y con los mails reales de noviembre 2026):
// {
//   trigger: "create" | "update" | ...,
//   resource_type: "Booking" | "Client" | ...,
//   created_at: string,
//   user: string | null,   // null = lo hizo el paciente (widget online o el
//                           // link de confirmar/editar del recordatorio);
//                           // string (email) = alguien logueado en el panel
//                           // de AgendaPro (staff)
//   resource: {
//     service: string,             // nombre de la especialidad
//     service_provider: string,    // profesional + especialidad
//     status: string,              // "Reservado" | "Confirmado" | ...
//     start: string,               // en UTC ("2026-11-19T17:00:00.000Z" = 14 h AR)
//     end: string,
//     client: { first_name, last_name, email, identification, ... },
//     company_name, location_address, links: { confirm, cancel, edit }
//   },
//   changes?: { status_id: [antes, después] }   // en los "update"
// }
//
// Reglas de negocio de este archivo:
// - Solo procesamos resource_type === "Booking" (ignoramos eventos de alta
//   de Cliente, que llegan aparte y no aportan nada útil).
// - Solo procesamos lo que hizo el paciente (user === null). Si "user" tiene
//   un email, fue staff quien tocó la reserva: ya lo sabe.
// - trigger "create" = reserva online nueva. Es lo único que avisa: un mail a
//   BA y un Telegram a las socias (toda reserva online cuenta como "viene de
//   Sati", decisión de Dani 10/11/2026). El Telegram lleva solo iniciales y
//   día/hora, nunca nombre completo ni especialidad.
// - trigger "update" del paciente = confirmó el turno con el link del
//   recordatorio, lo cambió o lo canceló. Muchas veces es un turno que cargó
//   recepción por teléfono o WhatsApp. NO es una reserva nueva: no manda mail
//   ni Telegram (antes mandaba un mail "Nueva reserva online" por cada
//   confirmación, ~2 de cada 3 mails). Solo suma al contador del día para el
//   resumen nocturno: confirmadas / canceladas / cambios.
// - El mail no lleva DNI, email del paciente ni el payload completo.

import { AvisosEnv, avisarATodas, campoDeUpdate, fechaAR, formatearTurno, iniciales, sumar } from "../_lib/avisos";

interface Env extends AvisosEnv {
  RESEND_API_KEY: string;
  ORDER_DESTINATION_EMAIL?: string;
}

const DEFAULT_DESTINATION = "baconsultoriosmedicos@gmail.com";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "—";
}

// Algunas plataformas verifican el endpoint con un GET antes de mandar eventos reales.
export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ ok: true, ready: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.RESEND_API_KEY;
  // Siempre respondemos 200 rápido: si AgendaPro recibe errores repetidos,
  // puede desactivar el webhook.
  const okResponse = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });

  let payload: Record<string, unknown> = {};
  try {
    payload = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return okResponse;
  }

  const resourceType = pick(payload, ["resource_type"]);
  const trigger = pick(payload, ["trigger"]);
  const staffUser = payload["user"]; // null (paciente) o email (staff)

  // Ignorar todo lo que no sea una reserva (ej: alta de Cliente).
  if (resourceType !== "Booking") return okResponse;

  // Ignorar todo lo generado por alguien logueado en AgendaPro (staff).
  if (staffUser) return okResponse;

  const inner = (payload.resource ?? {}) as Record<string, unknown>;
  const client = (inner.client ?? {}) as Record<string, unknown>;
  const status = pick(inner, ["status"]);
  const hoy = `res:${fechaAR()}`;

  // Confirmación, cambio o cancelación del paciente: solo se cuenta.
  if (trigger === "update") {
    context.waitUntil(sumar(context.env, hoy, campoDeUpdate(status)));
    return okResponse;
  }

  // Cualquier otro trigger que no sea una reserva nueva se ignora.
  if (trigger !== "create") return okResponse;

  const turno = formatearTurno(pick(inner, ["start"]));
  const ini = iniciales(String(client.first_name ?? ""), String(client.last_name ?? ""));
  const texto = `Nueva reserva online: ${ini} viene de Sati Studio\nTurno: ${turno}\nBuscala en AgendaPro por ese día y horario.`;
  context.waitUntil(Promise.all([avisarATodas(context.env, texto), sumar(context.env, hoy, "total")]));

  if (!apiKey) return okResponse;

  const clientName =
    [pick(client, ["first_name"]), pick(client, ["last_name"])]
      .filter((v) => v !== "—")
      .join(" ") || "—";
  const serviceName = pick(inner, ["service"]);
  const provider = pick(inner, ["service_provider"]);

  const fila = (etiqueta: string, valor: string) =>
    `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">${etiqueta}</td><td>${escapeHtml(valor)}</td></tr>`;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #2C2C2C;">
      <h2 style="color: #5C1A3D;">Nueva reserva online</h2>
      <p style="margin: 0 0 8px;">La sacó el paciente desde la reserva online de AgendaPro.</p>
      <table style="border-collapse: collapse; margin-top: 12px;">
        ${fila("Turno:", turno)}
        ${fila("Paciente:", clientName)}
        ${fila("Servicio:", serviceName)}
        ${fila("Profesional:", provider)}
        ${fila("Estado:", status)}
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 11px;">Hora argentina. Los datos completos del paciente están en AgendaPro.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BA Consultorios Médicos <onboarding@resend.dev>",
        to: [context.env.ORDER_DESTINATION_EMAIL || DEFAULT_DESTINATION],
        subject: `Nueva reserva online — ${serviceName} — ${turno}`,
        html
      })
    });
    if (!res.ok) {
      // Cloudflare Pages muestra esto en Functions > Real-time Logs — es la
      // única forma de enterarse si Resend empieza a fallar.
      console.error("Resend respondió con error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Falló el fetch a Resend:", err);
  }

  return okResponse;
};
