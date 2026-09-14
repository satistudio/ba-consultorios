// Cloudflare Pages Function — recibe webhooks de AgendaPro (reservas creadas,
// actualizadas, canceladas) y reenvía un aviso por mail vía Resend.
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
// 14/09/2026 — reemplaza los nombres "tentativos" de la versión anterior,
// que buscaba en payload.data / payload.booking y nunca miraba acá):
// {
//   trigger: "create" | "update" | ...,
//   resource_type: "Booking" | "Client" | ...,
//   created_at: string,
//   user: string | null,   // null = generado por el paciente (widget online);
//                           // string (email) = generado por alguien logueado
//                           // en el panel de AgendaPro (staff)
//   resource: {
//     service: string,             // nombre de la especialidad
//     service_provider: string,    // profesional + especialidad
//     status: string,              // "Reservado" | "Confirmado" | ...
//     start: string,
//     end: string,
//     client: { first_name, last_name, email, identification_number, ... },
//     company_name, location_address, links: { confirm, cancel, edit }
//   }
// }
//
// Reglas de negocio de este archivo:
// - Solo procesamos resource_type === "Booking" (ignoramos eventos de alta
//   de Cliente, que llegan aparte y no aportan nada útil a este mail — y
//   antes generaban un segundo mail vacío por cada reserva online).
// - Solo notificamos cuando el evento lo generó el paciente (user === null).
//   Si "user" tiene un email, fue staff quien tocó la reserva (la creó,
//   la confirmó, la editó) — ya lo sabe, no hace falta avisarle por mail.

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

  const resourceType = pick(payload, ["resource_type"]);
  const trigger = pick(payload, ["trigger"]);
  const staffUser = payload["user"]; // null (paciente) o email (staff)

  // Ignorar todo lo que no sea una reserva (ej: alta de Cliente).
  if (resourceType !== "Booking") return okResponse;

  // Ignorar todo lo generado por alguien logueado en AgendaPro (staff).
  if (staffUser) return okResponse;

  const inner = (payload.resource ?? {}) as Record<string, unknown>;
  const client = (inner.client ?? {}) as Record<string, unknown>;

  const clientName =
    [pick(client, ["first_name"]), pick(client, ["last_name"])]
      .filter((v) => v !== "—")
      .join(" ") || "—";
  const serviceName = pick(inner, ["service"]);
  const provider = pick(inner, ["service_provider"]);
  const status = pick(inner, ["status"]);
  const startTime = pick(inner, ["start"]);

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #2C2C2C;">
      <h2 style="color: #5C1A3D;">Nueva reserva online — AgendaPro</h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Evento:</td><td>${escapeHtml(trigger)} / ${escapeHtml(resourceType)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Paciente:</td><td>${escapeHtml(clientName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Servicio:</td><td>${escapeHtml(serviceName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Profesional:</td><td>${escapeHtml(provider)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Estado:</td><td>${escapeHtml(status)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Fecha/hora:</td><td>${escapeHtml(startTime)}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 11px;">Payload completo (respaldo técnico):</p>
      <pre style="background: #F8F6F4; padding: 10px; border-radius: 6px; font-size: 10px; overflow-x: auto;">${escapeHtml(JSON.stringify(payload, null, 2)).slice(0, 4000)}</pre>
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
        subject: `AgendaPro: reserva ${status !== "—" ? status.toLowerCase() : "nueva"} — ${serviceName}`,
        html
      })
    });
    if (!res.ok) {
      // Antes esto se tragaba en silencio. Cloudflare Pages muestra esto en
      // Functions > Real-time Logs — es la única forma de enterarse si Resend
      // empieza a fallar, en vez de descubrirlo dos meses después.
      console.error("Resend respondió con error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Falló el fetch a Resend:", err);
  }

  return okResponse;
};
