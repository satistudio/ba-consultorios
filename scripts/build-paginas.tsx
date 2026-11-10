// Genera las páginas estáticas por especialidad después de `vite build`.
// Parte de dist/index.html para conservar exactamente el mismo <head>
// (GTM en head + noscript, favicon, CSS compilado) y reemplaza solo lo propio
// de cada página: título, descripción, canonical, Open Graph, JSON-LD y body.
// Las páginas no cargan el bundle de React: son HTML puro, rápidas e indexables.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { StrictMode } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import App from "../src/App";
import { ESPECIALIDADES, formatoPrecio } from "../src/paginas/especialidades";
import { EspecialidadPage, EspecialidadesIndex, BUSCADOR_ESPECIALIDADES, PreciosPage, BUSCADOR_PRECIOS, TurnosPage, FORMULARIO_ORDEN, EstudiosPage, ContactoPage, NoEncontrada } from "../src/paginas/Paginas";

const SITE = "https://baconsultoriosmedicos.com.ar";
const DIST = "dist";
const base = readFileSync(`${DIST}/index.html`, "utf8");

// Mismos eventos y parámetros que la home (ver MEDICIÓN en App.tsx).
const TRACKING = `<script>document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-track]");if(!a)return;var d=a.dataset,p={event:d.track,origin:d.origin||""};if(d.track==="whatsapp_click"){p.service_name=d.service||"";p.service_type=d.stype||"";try{navigator.sendBeacon&&navigator.sendBeacon("/api/wa-click",p.origin)}catch(x){}}else if(d.track==="agendapro_direct_click"){p.service_name=d.service||""}else if(d.track==="social_click"){p.destination=d.destination||""}window.dataLayer=window.dataLayer||[];window.dataLayer.push(p)});</script>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

function reemplazar(html: string, patron: RegExp, valor: string) {
  if (!patron.test(html)) throw new Error(`No se encontró ${patron} en dist/index.html`);
  return html.replace(patron, valor);
}

function pagina(opts: { path: string; titulo: string; descripcion: string; ld: unknown[]; body: string; script?: string; archivo?: string }) {
  const url = SITE + opts.path;
  let html = base;
  html = reemplazar(html, /<title>[^<]*<\/title>/, `<title>${esc(opts.titulo)}</title>`);
  html = reemplazar(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(opts.descripcion)}" />`);
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
  html = reemplazar(html, /<div id="root"><\/div>/, `<div id="root">${opts.body}</div>\n    ${TRACKING}${opts.script ?? ""}`);
  if (!html.includes("GTM-MG27TQ4T")) throw new Error("La página perdió GTM");

  // 404.html: Cloudflare la sirve con estado 404 para cualquier ruta que no
  // existe (sin ella, devolvía la home con 200 y Google la veía duplicada).
  if (opts.archivo) {
    html = reemplazar(html, /<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="noindex, follow" />`);
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, "");
    writeFileSync(`${DIST}/${opts.archivo}`, html);
    return;
  }
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
  script: BUSCADOR_ESPECIALIDADES,
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

pagina({
  path: "/precios/",
  titulo: "Precios de consultas, ecografías y estudios en San Justo | BA Consultorios Médicos",
  descripcion: "Precios particulares de consultas, ecografías, Doppler y prácticas en San Justo. Precio de lista y valor con beneficios por pago en efectivo y LinkMed.",
  ld: [migas([{ name: "Inicio", path: "/" }, { name: "Precios", path: "/precios/" }])],
  body: renderToStaticMarkup(<PreciosPage />),
  script: BUSCADOR_PRECIOS,
});

pagina({
  path: "/turnos/",
  titulo: "Turnos en San Justo: reservá online o mandá tu orden médica | BA Consultorios Médicos",
  descripcion: "Pedí turno en BA Consultorios Médicos, San Justo: reservá online, subí la foto de tu orden médica o escribinos por WhatsApp. Atención particular.",
  ld: [migas([{ name: "Inicio", path: "/" }, { name: "Turnos", path: "/turnos/" }])],
  body: renderToStaticMarkup(<TurnosPage />),
  script: FORMULARIO_ORDEN,
});

pagina({
  path: "/estudios/",
  titulo: "Ecografías, Doppler y estudios en San Justo | BA Consultorios Médicos",
  descripcion: "Ecografías, Doppler, estudios cardiológicos, electroencefalograma y más en San Justo. Cómo prepararte y estudios de alta complejidad. Atención particular.",
  ld: [migas([{ name: "Inicio", path: "/" }, { name: "Estudios", path: "/estudios/" }])],
  body: renderToStaticMarkup(<EstudiosPage />),
});

// Mismos datos que el JSON-LD de la home (index.html), para SEO local.
const CLINICA = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "@id": `${SITE}/#clinic`,
  name: "BA Consultorios Médicos",
  url: `${SITE}/`,
  image: `${SITE}/ba-isotipo.png`,
  telephone: "+54 11 3970-1945",
  address: { "@type": "PostalAddress", streetAddress: "Almafuerte 3558", addressLocality: "San Justo", addressRegion: "La Matanza, Buenos Aires", postalCode: "1754", addressCountry: "AR" },
  geo: { "@type": "GeoCoordinates", latitude: -34.6814237, longitude: -58.5548983 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "14:00" },
  ],
  sameAs: ["https://www.instagram.com/baconsultoriosmedicos"],
};

pagina({
  path: "/contacto/",
  titulo: "Contacto y cómo llegar: Almafuerte 3558, San Justo | BA Consultorios Médicos",
  descripcion: "BA Consultorios Médicos en Almafuerte 3558, San Justo, a metros del shopping y de la plaza de San Justo. Horarios, mapa, cómo llegar, WhatsApp y teléfono. Atención particular.",
  ld: [migas([{ name: "Inicio", path: "/" }, { name: "Contacto", path: "/contacto/" }]), CLINICA],
  body: renderToStaticMarkup(<ContactoPage />),
});

pagina({
  path: "/",
  archivo: "404.html",
  titulo: "Página no encontrada | BA Consultorios Médicos",
  descripcion: "Esta página no existe o cambió de lugar. Elegí a dónde ir en BA Consultorios Médicos, San Justo.",
  ld: [],
  body: renderToStaticMarkup(<NoEncontrada />),
});

// Sitemap: home + índice + estudios + precios + turnos + una URL por especialidad.
const hoy = new Date().toISOString().slice(0, 10);
const urls = ["/", "/especialidades/", "/estudios/", "/precios/", "/turnos/", "/contacto/", ...ESPECIALIDADES.map((e) => `/especialidades/${e.slug}/`)];
writeFileSync(
  `${DIST}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${hoy}</lastmod>\n  </url>`).join("\n") +
    `\n</urlset>\n`,
);

// Home: se escribe ya dibujada (renderToString) para que el navegador muestre el
// título sin esperar al JavaScript; main.tsx la hidrata. Va al final porque las
// demás páginas parten de dist/index.html con el root vacío.
const home = renderToString(<StrictMode><App /></StrictMode>);
writeFileSync(`${DIST}/index.html`, reemplazar(base, /<div id="root"><\/div>/, `<div id="root">${home}</div>`));

console.log(`Páginas generadas: ${ESPECIALIDADES.length} especialidades + índice + estudios + precios + turnos + contacto. Sitemap: ${urls.length} URLs.`);
