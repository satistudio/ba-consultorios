// Cloudflare Pages Function — recibe webhooks de AgendaPro (reservas creadas,
// modificadas, canceladas) y reenvía un aviso por mail vía Resend.
//
// Para qué sirve: registro automático de cada reserva con su origen, sin
// depender de que nadie lo anote a mano. Base para cruzar contra sprints de Meta.
//
// Configuración (una vez):
// 1. Cloudflare ya debe tener RESEND_API_KEY cargada (la misma del formulario).
// 2. En AgendaPro > Configuraciones > Integraciones / API Pública > Webhooks >
//    "Crear Webhook": pegar la URL
//      https://ba-consultorios.pages.dev/api/webhook-agendapro
//    y elegir los eventos de reservas (creada / actualizada / cancelada).
//
// El formato exacto del payload varía según el evento; esta función es tolerante:
// extrae los campos comunes si existen y adjunta el JSON completo como respaldo.

interface Env {
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
    if (typeof v === "string" && v.trim()) return v;
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

  if (!apiKey) return okResponse;

  let payload: Record<string, unknown> = {};
  try {
    payload = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return okResponse;
  }

  // Campos comunes en payloads de reservas (nombres tentativos, con fallback al JSON crudo)
  const inner = (payload.data ?? payload.booking ?? payload) as Record<string, unknown>;
  const eventType = pick(payload, ["event", "event_type", "type", "action"]);
  const clientName = pick(inner, ["client_name", "customer_name", "name", "first_name"]);
  const serviceName = pick(inner, ["service_name", "service", "title"]);
  const startTime = pick(inner, ["start_time", "start", "date", "datetime"]);

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #2C2C2C;">
      <h2 style="color: #5C1A3D;">Actividad de reservas — AgendaPro</h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Evento:</td><td>${escapeHtml(eventType)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Paciente:</td><td>${escapeHtml(clientName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Servicio:</td><td>${escapeHtml(serviceName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Fecha/hora:</td><td>${escapeHtml(startTime)}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 11px;">Payload completo (respaldo técnico):</p>
      <pre style="background: #F8F6F4; padding: 10px; border-radius: 6px; font-size: 10px; overflow-x: auto;">${escapeHtml(JSON.stringify(payload, null, 2)).slice(0, 4000)}</pre>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BA Consultorios Médicos <onboarding@resend.dev>",
        to: [context.env.ORDER_DESTINATION_EMAIL || DEFAULT_DESTINATION],
        subject: `AgendaPro: ${eventType !== "—" ? eventType : "actividad de reserva"}`,
        html
      })
    });
  } catch {
    // silencioso: nunca devolvemos error a AgendaPro
  }

  return okResponse;
};
