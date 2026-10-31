// Genera las páginas estáticas por especialidad después de `vite build`.
// Parte de dist/index.html para conservar exactamente el mismo <head>
// (GTM en head + noscript, favicon, CSS compilado) y reemplaza solo lo propio
// de cada página: título, descripción, canonical, Open Graph, JSON-LD y body.
// Las páginas no cargan el bundle de React: son HTML puro, rápidas e indexables.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { ESPECIALIDADES, formatoPrecio } from "../src/paginas/especialidades";
import { EspecialidadPage, EspecialidadesIndex } from "../src/paginas/Paginas";

const SITE = "https://baconsultoriosmedicos.com.ar";
const DIST = "dist";
const base = readFileSync(`${DIST}/index.html`, "utf8");

// Mismos eventos y parámetros que la home (ver MEDICIÓN en App.tsx).
const TRACKING = `<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-track]");if(!a)return;var d=a.dataset,p={event:d.track,origin:d.origin||""};if(d.track==="whatsapp_click"){p.service_name=d.service||"";p.service_type=d.stype||""}else if(d.track==="agendapro_direct_click"){p.service_name=d.service||""}window.dataLayer=window.dataLayer||[];window.dataLayer.push(p)});</script>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

function reemplazar(html: string, patron: RegExp, valor: string) {
  if (!patron.test(html)) throw new Error(`No se encontró ${patron} en dist/index.html`);
  return html.replace(patron, valor);
}

function pagina(opts: { path: string; titulo: string; descripcion: string; ld: unknown[]; body: string }) {
  const url = SITE + opts.path;
  let html = base;
  html = reemplazar(html, /<title>[^<]*<\/title>/, `<title>${esc(opts.titulo)}</title>`);
  html = reemplazar(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(opts.descripcion)}" />`);
  html = reemplazar(html, /<meta name="keywords" content="[^"]*" \/>\s*/, "");
  html = reemplazar(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = reemplazar(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = reemplazar(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(opts.titulo)}" />`);
  html = reemplazar(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(opts.descripcion)}" />`);
  html = reemplazar(html, /<meta property="twitter:url" content="[^"]*" \/>/, `<meta property="twitter:url" content="${url}" />`);
  html = reemplazar(html, /<meta property="twitter:title" content="[^"]*" \/>/, `<meta property="twitter:title" content="${esc(opts.titulo)}" />`);
  html = reemplazar(html, /<meta property="twitter:description" content="[^"]*" \/>/, `<meta property="twitter:description" content="${esc(opts.descripcion)}" />`);
  html = reemplazar(html, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, opts.ld.map(jsonLd).join("\n    "));
  // Sin bundle de React ni modulepreload: la página es HTML estático.
  html = html.replace(/\s*<script type="module"[^>]*><\/script>/g, "");
  html = html.replace(/\s*<link rel="modulepreload"[^>]*>/g, "");
  html = reemplazar(html, /<div id="root"><\/div>/, `<div id="root">${opts.body}</div>\n    ${TRACKING}`);
  if (!html.includes("GTM-MG27TQ4T")) throw new Error("La página perdió GTM");

  const dir = `${DIST}${opts.path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}index.html`, html);
}

const migas = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE + it.path })),
});

pagina({
  path: "/especialidades/",
  titulo: "Especialidades en San Justo | BA Consultorios Médicos",
  descripcion: "Más de 30 especialidades con atención particular en San Justo, La Matanza. Mirá el valor de cada consulta y pedí tu turno online o por WhatsApp.",
  ld: [migas([{ name: "Inicio", path: "/" }, { name: "Especialidades", path: "/especialidades/" }])],
  body: renderToStaticMarkup(<EspecialidadesIndex />),
});

for (const esp of ESPECIALIDADES) {
  const path = `/especialidades/${esp.slug}/`;
  const precio = esp.consulta
    ? ` Consulta particular: precio de lista ${formatoPrecio(esp.consulta.lista)}, con beneficios desde ${formatoPrecio(esp.consulta.desde)}.`
    : "";
  pagina({
    path,
    titulo: `${esp.nombre} en San Justo | Turnos particulares | BA Consultorios Médicos`,
    descripcion: `Turnos de ${esp.nombre.toLowerCase()} en San Justo, La Matanza.${precio} Reservá online o escribinos por WhatsApp.`,
    ld: [
      migas([
        { name: "Inicio", path: "/" },
        { name: "Especialidades", path: "/especialidades/" },
        { name: esp.nombre, path },
      ]),
    ],
    body: renderToStaticMarkup(<EspecialidadPage esp={esp} />),
  });
}

// Sitemap: home + índice + una URL por especialidad.
const hoy = new Date().toISOString().slice(0, 10);
const urls = ["/", "/especialidades/", ...ESPECIALIDADES.map((e) => `/especialidades/${e.slug}/`)];
writeFileSync(
  `${DIST}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${hoy}</lastmod>\n  </url>`).join("\n") +
    `\n</urlset>\n`,
);

console.log(`Páginas generadas: ${ESPECIALIDADES.length} especialidades + índice. Sitemap: ${urls.length} URLs.`);
