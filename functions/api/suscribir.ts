// Cloudflare Pages Function — recibe suscripciones al newsletter de salud
// (nombre + email) y las reenvía por mail a BA vía Resend.
//
// Requiere: RESEND_API_KEY en Cloudflare (la misma del formulario de órdenes).
//
// Siguiente paso natural: cuando Brevo esté activo, esta función puede escribir
// directo en la lista de Brevo (POST https://api.brevo.com/v3/contacts) en vez
// de mandar un mail. La estructura ya queda lista para ese cambio.

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, reason: "not_configured" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  let body: { name?: string; email?: string; consent?: boolean };
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "invalid_body" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || !email || !body.consent) {
    return new Response(JSON.stringify({ ok: false, reason: "missing_fields" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #2C2C2C;">
      <h2 style="color: #5C1A3D;">Nueva suscripción desde la web</h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Nombre:</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Email:</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Consentimiento:</td><td>Aceptado (Ley 25.326)</td></tr>
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 12px;">Sumar este contacto a la lista de email marketing.</p>
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
        reply_to: email,
        subject: "Nueva suscripción al newsletter de salud",
        html
      })
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, reason: "send_failed" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "send_failed" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
};
