// Mini sitio que se publica SOLO en el proyecto viejo de Cloudflare Pages
// ("ba-consultorios", cuenta de Araguine), que sirve ba-consultorios.pages.dev.
// Ese proyecto no puede conectarse al repo (Cloudflare no deja usar el mismo
// repo en dos cuentas), así que se sube a mano con el workflow
// redirect-old-pages.yml. Todo lo que llega se redirige con 301 al dominio
// real, conservando ruta y parámetros, para que Google mude la indexación.

const CANONICAL_ORIGIN = "https://baconsultoriosmedicos.com.ar";

// Única excepción al 301: el archivo de verificación de Search Console de la
// propiedad https://ba-consultorios.pages.dev/. Se verificaba con Google Tag
// Manager, que dejó de existir al redirigir todo, y sin propiedad verificada no
// funciona el Cambio de dirección. Google pide no borrarlo nunca.
const VERIFICACION_GSC = "/googlee9709fbc1b3aad02.html";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === VERIFICACION_GSC) {
      return new Response("google-site-verification: googlee9709fbc1b3aad02.html", {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
  },
};
