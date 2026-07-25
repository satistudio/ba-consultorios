// Cloudflare Pages Function — corre en el servidor, nunca en el navegador.
// Recibe una orden médica (imagen o PDF) + datos de contacto, y la envía por
// mail a BA usando Resend (Cloudflare no puede mandar mails por sí solo).
//
// Requiere en Cloudflare Pages > Settings > Environment variables (como Secret):
//   RESEND_API_KEY = <api key de resend.com>
//
// Docs: https://resend.com/docs/api-reference/emails/send-email

interface Env {
  RESEND_API_KEY: string;
  ORDER_DESTINATION_EMAIL?: string;
}

// Sin dominio propio verificado en Resend, el destino DEBE ser la casilla con la
// que se creó la cuenta de Resend. Configurable vía env ORDER_DESTINATION_EMAIL.
const DEFAULT_DESTINATION = "baconsultoriosmedicos@gmail.com";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000; // evita desbordar el stack con archivos grandes
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

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

  let form: FormData;
  try {
    form = await context.request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, reason: "invalid_form" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const name = (form.get("name") as string | null)?.trim();
  const email = (form.get("email") as string | null)?.trim();
  const phone = (form.get("phone") as string | null)?.trim();
  const consent = form.get("consent");
  const file = form.get("file") as File | null;

  if (!name || !email || !phone || !file || consent !== "true") {
    return new Response(JSON.stringify({ ok: false, reason: "missing_fields" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ ok: false, reason: "invalid_file_type" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  if (file.size > MAX_FILE_BYTES) {
    return new Response(JSON.stringify({ ok: false, reason: "file_too_large" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const fileBuffer = await file.arrayBuffer();
  const base64Content = arrayBufferToBase64(fileBuffer);

  const subject = "Nueva orden médica recibida desde la web";
  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #2C2C2C;">
      <h2 style="color: #5C1A3D;">Nueva orden médica recibida desde la web</h2>
      <p>Una persona subió una orden médica a través del sitio y pidió que la contacten para orientarla.</p>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Nombre:</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Email:</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Celular:</td><td>${escapeHtml(phone)}</td></tr>
      </table>
      <p style="margin-top: 16px; color: #888; font-size: 12px;">La orden médica está adjunta a este mail.</p>
    </div>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "BA Consultorios Médicos <onboarding@resend.dev>",
        to: [context.env.ORDER_DESTINATION_EMAIL || DEFAULT_DESTINATION],
        reply_to: email,
        subject,
        html,
        attachments: [{ filename: file.name || "orden-medica", content: base64Content }]
      })
    });

    if (!resendRes.ok) {
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
