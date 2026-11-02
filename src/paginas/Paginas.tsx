// Páginas estáticas (sin React en el navegador): se renderizan a HTML en el
// build con scripts/build-paginas.tsx. Los botones llevan data-track y un
// script inline los empuja al dataLayer con los mismos eventos que la home
// (whatsapp_click, agendapro_direct_click). Nunca llamar gtag() ni fbq().

import type { ReactNode } from "react";
import { BRAND_INFO, MedicalService } from "../data";
import { ESPECIALIDADES, Especialidad, formatoPrecio, PRECIOS_VIGENTES, slugify } from "./especialidades";
import { GRUPOS_PRECIOS, gruposDeEspecialidad } from "./precios";
import { DERIVADOS, GRUPOS_ESTUDIO, PREPARACIONES } from "./estudios";

const WA_NUMERO = "5491164344822";

// Servicios presenciales por naturaleza: no se les ofrece teleconsulta.
const SIN_TELECONSULTA = new Set(["Podología", "Kinesiología", "Audiometría y estudios auditivos"]);
const waUrl = (texto: string) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`;

function Header() {
  return (
    <header className="bg-white/95 border-b border-[#E8D5C4]/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="/" aria-label="BA Consultorios Médicos, inicio" className="flex items-center gap-2 flex-shrink-0">
          <img src="/ba-isotipo-192.webp" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          <span className="hidden min-[420px]:inline md:hidden lg:inline font-extrabold text-[#5C1A3D] text-sm sm:text-base leading-tight">BA Consultorios Médicos</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3 text-[13px] font-medium">
          <a href="/especialidades/" className="hidden md:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Especialidades</a>
          <a href="/estudios/" className="hidden md:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Estudios</a>
          <a href="/precios/" className="px-2 sm:px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Precios</a>
          <a href="/turnos/" className="px-2 sm:px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Turnos</a>
          <a href="/contacto/" className="hidden lg:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Contacto</a>
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener"
            data-track="whatsapp_click"
            data-origin="pagina_header"
            className="px-4 py-2 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#5C1A3D] text-[#F8F6F4]/90 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-extrabold text-white mb-2">BA Consultorios Médicos</p>
          <a href="/contacto/" className="font-light hover:text-white underline underline-offset-4">{BRAND_INFO.address}</a>
        </div>
        <div>
          <p className="font-extrabold text-white mb-2">Horarios</p>
          <p className="font-light">{BRAND_INFO.schedule}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-extrabold text-white mb-1">Turnos</p>
          <a href="/especialidades/" className="hover:text-white">Todas las especialidades</a>
          <a href="/estudios/" className="hover:text-white">Estudios y preparación</a>
          <a href="/precios/" className="hover:text-white">Precios de estudios y prácticas</a>
          <a href="/turnos/" className="hover:text-white">Cómo pedir turno</a>
          <a href={BRAND_INFO.agendaProUrl} target="_blank" rel="noopener" data-track="agendapro_direct_click" data-origin="pagina_footer" className="hover:text-white">Reservar online</a>
          <a href={BRAND_INFO.whatsappUrl} target="_blank" rel="noopener" data-track="whatsapp_click" data-origin="pagina_footer" className="hover:text-white">WhatsApp: {BRAND_INFO.whatsapp}</a>
        </div>
      </div>
    </footer>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="font-sans">{children}</main>
      <Footer />
    </>
  );
}

function Migas({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Ruta" className="text-xs text-gray-500 mb-4">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5">›</span>}
          {it.href ? <a href={it.href} className="hover:text-[#C2006B]">{it.label}</a> : <span className="text-[#5C1A3D]">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function Beneficios() {
  return (
    <section className="rounded-2xl bg-[#F2C4D0]/30 border border-[#F2C4D0] p-6">
      <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Beneficios al pagar</h2>
      <ul className="space-y-2 text-sm text-gray-700 font-light">
        <li><strong className="font-bold text-[#5C1A3D]">Pago en efectivo:</strong> hasta 10% de descuento.</li>
        <li><strong className="font-bold text-[#5C1A3D]">Con LinkMed:</strong> $2.000 menos por cada consulta o práctica, en BA y en los centros asociados (farmacias Vilela).</li>
        <li>Los dos beneficios se suman. Las promos del mes las consultás por WhatsApp.</li>
      </ul>
    </section>
  );
}

const TIPOS: { tipo: MedicalService["type"]; titulo: string }[] = [
  { tipo: "Consulta", titulo: "Consultas" },
  { tipo: "Estudio realizado en BA", titulo: "Estudios que se hacen en BA" },
  { tipo: "Práctica o procedimiento", titulo: "Prácticas y procedimientos" },
];

export function EspecialidadPage({ esp }: { esp: Especialidad }) {
  const textoWa = `Hola BA! Quiero un turno de ${esp.nombre}. (Vengo de la web)`;
  const otras = ESPECIALIDADES.filter((e) => e.slug !== esp.slug);
  const teleconsulta = !SIN_TELECONSULTA.has(esp.nombre);
  const grupos = gruposDeEspecialidad(esp.nombre);
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <Migas items={[{ href: "/", label: "Inicio" }, { href: "/especialidades/", label: "Especialidades" }, { label: esp.nombre }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">{esp.nombre} en San Justo</h1>
            <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-xl">
              Atención particular de {esp.nombre.toLowerCase()} en BA Consultorios Médicos, Almafuerte 3558, San Justo.
              Reservá online con la agenda a la vista o escribinos por WhatsApp para consultar disponibilidad.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={BRAND_INFO.agendaProUrl}
                target="_blank"
                rel="noopener"
                data-track="agendapro_direct_click"
                data-origin="especialidad_hero"
                data-service={esp.nombre}
                className="text-center px-6 py-3 rounded-full bg-[#5C1A3D] text-white font-bold hover:bg-[#C2006B] transition-colors"
              >
                Reservá online
              </a>
              <a
                href={waUrl(textoWa)}
                target="_blank"
                rel="noopener"
                data-track="whatsapp_click"
                data-origin="especialidad_hero"
                data-service={esp.nombre}
                data-stype="Consulta"
                className="text-center px-6 py-3 rounded-full border-2 border-[#C2006B] text-[#C2006B] font-bold hover:bg-[#C2006B] hover:text-white transition-colors"
              >
                Escribinos por WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {teleconsulta && "Teleconsulta disponible. "}Atención particular, sin obras sociales ni prepagas.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#C2006B]">Consulta particular</p>
            {esp.consulta ? (
              <>
                <p className="mt-3 text-sm text-gray-600">Precio de lista</p>
                <p className="text-3xl font-extrabold text-[#5C1A3D]">{formatoPrecio(esp.consulta.lista)}</p>
                <p className="mt-2 text-sm text-gray-700">
                  Con beneficios, desde <strong className="font-extrabold text-[#C2006B]">{formatoPrecio(esp.consulta.desde)}</strong>
                </p>
                {esp.consulta.nota && <p className="mt-2 text-xs text-gray-500">{esp.consulta.nota}</p>}
                <p className="mt-4 text-[11px] text-gray-500">Valores de referencia. Pueden cambiar: confirmalos al reservar.</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-700">Consultá el valor por WhatsApp.</p>
            )}
            <div className="mt-5 pt-5 border-t border-[#E8D5C4]">
              <p className="text-sm font-bold text-[#5C1A3D]">Disponibilidad</p>
              <p className="text-sm text-gray-600 font-light mt-1">
                Los días y horarios cambian seguido. Los ves actualizados en la agenda online, o te los pasamos por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {esp.servicios.length > 0 &&
            TIPOS.map(({ tipo, titulo }) => {
              const lista = esp.servicios.filter((s) => s.type === tipo);
              if (!lista.length) return null;
              return (
                <section key={tipo}>
                  <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">{titulo}</h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {lista.map((s) => (
                      <li key={s.id} className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-700">{s.name}</li>
                    ))}
                  </ul>
                </section>
              );
            })}

          <section>
            <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">Preguntas frecuentes</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Atienden por obra social o prepaga?</dt>
                <dd className="text-gray-600 font-light mt-1">No. La atención en BA es particular, con beneficios por pago en efectivo y con LinkMed.</dd>
              </div>
              {teleconsulta && (
                <div>
                  <dt className="font-bold text-[#5C1A3D]">¿Hay teleconsulta?</dt>
                  <dd className="text-gray-600 font-light mt-1">Sí. Se reserva en la agenda online o por WhatsApp.</dd>
                </div>
              )}
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Dónde queda BA?</dt>
                <dd className="text-gray-600 font-light mt-1">En {BRAND_INFO.address}. {BRAND_INFO.schedule}.</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-8">
          <Beneficios />
          {grupos.length > 0 && (
            <section>
              <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Precios de estudios y prácticas</h2>
              <ul className="space-y-2 text-sm">
                {grupos.map((g) => (
                  <li key={g.id}>
                    <a href={`/precios/#${g.id}`} className="font-bold text-[#C2006B] hover:text-[#5C1A3D] underline underline-offset-4">
                      {g.titulo}: ver precios
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Otras especialidades</h2>
            <ul className="flex flex-wrap gap-2">
              {otras.map((e) => (
                <li key={e.slug}>
                  <a href={`/especialidades/${e.slug}/`} className="inline-block text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8D5C4] text-[#5C1A3D] hover:border-[#C2006B] hover:text-[#C2006B]">
                    {e.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

export function EspecialidadesIndex() {
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Especialidades" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Especialidades en San Justo</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Más de 30 especialidades con atención particular en BA Consultorios Médicos, Almafuerte 3558, San Justo.
            Elegí la tuya para ver el valor de la consulta y cómo pedir turno.
          </p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
        <div className="mb-5 max-w-xl">
          <label htmlFor="buscar-especialidad" className="block text-sm font-bold text-[#5C1A3D] mb-2">Buscá una especialidad o un estudio</label>
          <input
            id="buscar-especialidad"
            type="search"
            placeholder="Por ejemplo: piel, corazón, PAP, niños"
            autoComplete="off"
            className="w-full rounded-xl border border-[#E8D5C4] bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#C2006B]"
          />
          <p id="sin-especialidad" hidden aria-live="polite" className="mt-3 text-sm text-gray-700">
            No la encontramos con ese nombre. Mirá{" "}
            <a href="/precios/" className="font-bold text-[#C2006B] underline underline-offset-4">todos los precios</a> o{" "}
            <a href={BRAND_INFO.whatsappUrl} target="_blank" rel="noopener" data-track="whatsapp_click" data-origin="especialidades_sin_resultados" className="font-bold text-[#C2006B] underline underline-offset-4">consultanos por WhatsApp</a>.
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 gap-3">
          {ESPECIALIDADES.map((e) => (
            <li key={e.slug} data-buscar={claveEspecialidad(e)}>
              <a href={`/especialidades/${e.slug}/`} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3 hover:border-[#C2006B] transition-colors">
                <span className="font-bold text-[#5C1A3D] text-sm">{e.nombre}</span>
                {e.consulta && <span className="text-xs text-gray-500 whitespace-nowrap">desde {formatoPrecio(e.consulta.desde)}</span>}
              </a>
            </li>
          ))}
        </ul>
        </div>
        <aside>
          <Beneficios />
        </aside>
      </div>
    </Shell>
  );
}

// Palabras con las que se encuentra cada especialidad: su nombre, lo que se
// hace en BA y sinónimos de uso diario. Sin servicios "no usar" ni derivados.
const SINONIMOS: Record<string, string> = {
  cardiologia: "corazon presion", dermatologia: "piel lunares acne", pediatria: "chicos niños bebes",
  ginecologia: "mujer pap papanicolau", traumatologia: "huesos rodilla fractura", oftalmologia: "ojos vista",
  otorrinolaringologia: "oidos garganta nariz", nutricion: "dieta peso", urologia: "prostata", neurologia: "cabeza migraña",
  gastroenterologia: "estomago digestivo", endocrinologia: "tiroides hormonas", nefrologia: "riñon riñones", podologia: "pies uñas",
  neumonologia: "pulmones respiracion asma", alergista: "alergia alergias", alergia: "alergias", reumatologia: "articulaciones artritis",
};
const claveEspecialidad = (e: Especialidad) => {
  const base = slugify(e.nombre).split("-")[0];
  const servicios = e.servicios.filter((x) => x.type !== "Estudio derivado" && !/verrug|acrocord|hpv/i.test(x.name)).map((x) => x.name);
  const infantil = /infantil|infanto|pediat/i.test(e.nombre) ? " niños chicos" : "";
  return [e.nombre, SINONIMOS[base] ?? "", ...servicios].join(" ") + infantil;
};

// Buscador de /especialidades/: filtra la lista en el lugar, sin acentos.
export const BUSCADOR_ESPECIALIDADES = `<script>(function(){var i=document.getElementById("buscar-especialidad");if(!i)return;var n=function(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()};var vacio=document.getElementById("sin-especialidad");var items=[].map.call(document.querySelectorAll("[data-buscar]"),function(li){return{li:li,k:n(li.dataset.buscar).split(/[^a-z0-9]+/)}});i.addEventListener("input",function(){var q=n(i.value.trim()),t=q.split(/\s+/).filter(Boolean),c=0;items.forEach(function(x){var ok=q.length<2||t.every(function(w){return x.k.some(function(p){return p.indexOf(w)===0})});x.li.hidden=!ok;if(ok)c++});vacio.hidden=c>0})})();</script>`;

// Buscador de /precios/: muestra los resultados en un bloque debajo del campo,
// con los valores, sin mover la página ni tocar la lista completa. Arma el
// índice leyendo las filas ya renderizadas (data-*), así no duplica datos.
// Sin acentos ni mayúsculas, para que "ecografia" encuentre "Ecografía".
export const BUSCADOR_PRECIOS = `<script>(function(){var i=document.getElementById("buscar-precio");if(!i)return;var n=function(s){return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase()};var panel=document.getElementById("resultados-busqueda"),lista=document.getElementById("lista-resultados"),vacio=document.getElementById("sin-resultados"),info=document.getElementById("cantidad-resultados"),tpl=document.getElementById("tpl-resultado"),chips=document.querySelectorAll("[data-chip]"),MAX=8;var filas=[].map.call(document.querySelectorAll("[data-practica]"),function(r){var g=r.closest("[data-grupo]").dataset.grupo;return{d:r.dataset,g:g,k:n(r.dataset.practica+" "+g)}});var marcar=function(c){chips.forEach(function(x){var on=x===c;x.setAttribute("aria-pressed",on);x.classList.toggle("bg-[#C2006B]",on);x.classList.toggle("text-white",on);x.classList.toggle("border-[#C2006B]",on);x.classList.toggle("bg-white",!on);x.classList.toggle("text-[#5C1A3D]",!on)})};var nav=document.querySelector("[data-chips]");var mostrar=function(hit,texto,conGrupo){lista.innerHTML="";(conGrupo?i:nav).insertAdjacentElement("afterend",panel);panel.hidden=false;vacio.hidden=hit.length>0;info.hidden=hit.length===0;info.textContent=texto;hit.forEach(function(f){var c=tpl.content.cloneNode(true),q=function(x){return c.querySelector("[data-campo="+x+"]")};var nom=q("nombre");nom.textContent=f.d.practica;if(f.d.href){var a=document.createElement("a");a.href=f.d.href;a.className=nom.className+" underline underline-offset-4";a.textContent=f.d.practica;nom.replaceWith(a)}if(conGrupo)q("grupo").textContent=f.g;else q("grupo").remove();q("lista").textContent=f.d.lista;q("desde").textContent=f.d.desde||"Consultar";lista.appendChild(c)})};i.addEventListener("input",function(){marcar(null);var q=n(i.value.trim());if(q.length<2){panel.hidden=true;lista.innerHTML="";return}var t=q.split(/\\s+/),hit=filas.filter(function(f){return t.every(function(w){return f.k.indexOf(w)>-1})});mostrar(hit.slice(0,MAX),hit.length>MAX?"Mostramos "+MAX+" de "+hit.length+" resultados. Escribí algo más para afinar la búsqueda.":hit.length===1?"1 resultado":hit.length+" resultados",true)});chips.forEach(function(c){c.addEventListener("click",function(e){e.preventDefault();if(c.getAttribute("aria-pressed")==="true"){marcar(null);panel.hidden=true;lista.innerHTML="";return}i.value="";marcar(c);var g=c.dataset.chip,hit=filas.filter(function(f){return f.g===g});mostrar(hit,g+": "+hit.length+(hit.length===1?" precio":" precios"),false)})})})();</script>`;

export function PreciosPage() {
  const consultas = ESPECIALIDADES.filter((e) => e.consulta);
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Precios" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Precios de consultas, estudios y prácticas</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Atención particular en BA Consultorios Médicos, San Justo. Te mostramos el precio de lista y el valor con
            beneficios: pagando en efectivo y con LinkMed. Valores vigentes desde el {PRECIOS_VIGENTES.replace(/-/g, "/")}.
          </p>
          <div className="mt-6 max-w-xl">
            <label htmlFor="buscar-precio" className="block text-sm font-bold text-[#5C1A3D] mb-2">Buscá una especialidad, estudio o práctica</label>
            <input
              id="buscar-precio"
              type="search"
              placeholder="Por ejemplo: dermatología, ecografía mamaria, PAP"
              autoComplete="off"
              className="w-full rounded-xl border border-[#E8D5C4] bg-[#F8F6F4] px-4 py-3 text-sm focus:outline-none focus:border-[#C2006B]"
            />
            <div id="resultados-busqueda" hidden aria-live="polite" className="mt-3 rounded-2xl border border-[#E8D5C4] bg-white shadow-sm overflow-hidden">
              <p id="cantidad-resultados" className="px-4 pt-3 text-xs text-gray-500"></p>
              <ul id="lista-resultados" className="divide-y divide-gray-100"></ul>
              <p id="sin-resultados" hidden className="p-4 text-sm text-gray-700">
                No encontramos ese estudio en la lista.{" "}
                <a href={BRAND_INFO.whatsappUrl} target="_blank" rel="noopener" data-track="whatsapp_click" data-origin="precios_sin_resultados" className="font-bold text-[#C2006B] underline underline-offset-4">
                  Consultanos por WhatsApp
                </a>
                .
              </p>
            </div>
            <template
              id="tpl-resultado"
              dangerouslySetInnerHTML={{
                __html:
                  '<li class="px-4 py-3"><span data-campo="nombre" class="block font-bold text-[#5C1A3D] text-sm"></span><span data-campo="grupo" class="block text-xs text-gray-500"></span><div class="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm"><span class="text-gray-600">Precio de lista <strong data-campo="lista" class="font-bold text-gray-800"></strong></span><span class="text-gray-600">Con beneficios, desde <strong data-campo="desde" class="font-extrabold text-[#C2006B]"></strong></span></div></li>',
              }}
            />
          </div>
          <nav aria-label="Grupos de precios" data-chips className="mt-5 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1">
            {[{ id: "consultas", titulo: "Consultas" }, ...GRUPOS_PRECIOS].map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                data-chip={g.titulo}
                role="button"
                aria-pressed="false"
                className="shrink-0 whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8D5C4] text-[#5C1A3D] hover:border-[#C2006B] transition-colors"
              >
                {g.titulo}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] items-start">
        <div className="space-y-10">
          <section id="consultas" data-grupo="Consultas" className="scroll-mt-20">
            <TituloGrupo titulo="Consultas" />
            <TablaPrecios columna="Especialidad">
              {consultas.map((e) => (
                <FilaPrecio
                  key={e.slug}
                  nombre={e.nombre}
                  href={`/especialidades/${e.slug}/`}
                  lista={e.consulta!.lista}
                  desde={e.consulta!.desde}
                  nota={e.consulta!.nota}
                />
              ))}
            </TablaPrecios>
          </section>

          {GRUPOS_PRECIOS.map((g) => (
            <section key={g.id} id={g.id} data-grupo={g.titulo} className="scroll-mt-20">
              <TituloGrupo titulo={g.titulo} />
              <TablaPrecios>
                {g.practicas.map((pr) => (
                  <FilaPrecio key={pr.nombre} nombre={pr.nombre} lista={pr.lista} desde={pr.desde} nota={pr.nota} />
                ))}
              </TablaPrecios>
              <a
                href={waUrl(`Hola BA! Quiero consultar por ${g.titulo.toLowerCase()}. (Vengo de la web)`)}
                target="_blank"
                rel="noopener"
                data-track="whatsapp_click"
                data-origin="precios_grupo"
                data-service={g.titulo}
                data-stype="Estudio o práctica"
                className="inline-block mt-3 text-sm font-bold text-[#C2006B] hover:text-[#5C1A3D] underline underline-offset-4"
              >
                Consultar turno de {g.titulo.toLowerCase()} por WhatsApp
              </a>
            </section>
          ))}

          <section>
            <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">Preguntas frecuentes</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Qué es el precio "con beneficios, desde"?</dt>
                <dd className="text-gray-600 font-light mt-1">
                  Es el valor pagando en efectivo y con LinkMed, los dos beneficios juntos. Si usás solo uno, el valor queda entre el precio de lista y ese número.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Atienden por obra social o prepaga?</dt>
                <dd className="text-gray-600 font-light mt-1">No. La atención en BA es particular.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Hay promociones?</dt>
                <dd className="text-gray-600 font-light mt-1">Sí, cambian cada mes. Consultá las vigentes por WhatsApp.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Y los análisis de laboratorio?</dt>
                <dd className="text-gray-600 font-light mt-1">Dependen de cada orden médica. Mandanos una foto de la orden por WhatsApp y te pasamos el valor.</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-20">
          <Beneficios />
          <section className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
            <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-2">¿No encontrás tu estudio?</h2>
            <p className="text-sm text-gray-600 font-light mb-4">Escribinos con el nombre del estudio o una foto de la orden y te decimos el valor.</p>
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener"
              data-track="whatsapp_click"
              data-origin="precios_aside"
              className="block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
            >
              Escribinos por WhatsApp
            </a>
          </section>
          <p className="text-[11px] text-gray-500">
            Valores de referencia. Pueden cambiar: confirmalos al reservar.
          </p>
        </aside>
      </div>
    </Shell>
  );
}

function TituloGrupo({ titulo }: { titulo: string }) {
  return <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">{titulo}</h2>;
}

function TablaPrecios({ children, columna = "Estudio o práctica" }: { children: ReactNode; columna?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1fr_7.5rem_7.5rem] gap-3 px-4 py-2 bg-[#F8F6F4] text-[11px] font-bold uppercase tracking-wider text-gray-500">
        <span>{columna}</span>
        <span className="text-right">Precio de lista</span>
        <span className="text-right">Con beneficios</span>
      </div>
      <ul className="divide-y divide-gray-100">{children}</ul>
    </div>
  );
}

function FilaPrecio({ nombre, href, lista, desde, nota }: { key?: string; nombre: string; href?: string; lista: number; desde?: number; nota?: string }) {
  return (
    <li
      data-practica={nombre}
      data-lista={formatoPrecio(lista)}
      data-desde={desde ? formatoPrecio(desde) : undefined}
      data-href={href}
      className="px-4 py-3 grid grid-cols-2 sm:grid-cols-[1fr_7.5rem_7.5rem] gap-x-3 gap-y-1 text-sm">
      <div className="col-span-2 sm:col-span-1">
        {href ? (
          <a href={href} className="font-bold text-[#5C1A3D] hover:text-[#C2006B]">{nombre}</a>
        ) : (
          <span className="text-gray-800">{nombre}</span>
        )}
        {nota && <span className="block text-xs text-gray-500">{nota}</span>}
      </div>
      <span className="sm:text-right text-gray-600">
        <span className="sm:hidden text-xs text-gray-500">Lista </span>
        {formatoPrecio(lista)}
      </span>
      {desde ? (
        <span className="text-right font-bold text-[#C2006B]">
          <span className="sm:hidden text-xs font-normal text-gray-500">Desde </span>
          {formatoPrecio(desde)}
        </span>
      ) : (
        <span className="text-right text-gray-500">—</span>
      )}
    </li>
  );
}

// Envío de la orden médica desde /turnos/ (misma API que la home:
// /api/enviar-orden, que la manda por mail a BA). Al enviarse bien empuja
// lead_form_submit con el mismo form_name que la home.
export const FORMULARIO_ORDEN = `<script>(function(){var f=document.getElementById("form-orden");if(!f)return;var msg=document.getElementById("orden-mensaje"),btn=document.getElementById("orden-enviar"),file=document.getElementById("orden-archivo"),nombreArchivo=document.getElementById("orden-archivo-nombre"),ok=document.getElementById("orden-ok"),TIPOS=["image/jpeg","image/png","image/webp","image/heic","application/pdf"],MAX=10485760;var error=function(t){msg.textContent=t;msg.hidden=false};file.addEventListener("change",function(){var a=file.files[0];nombreArchivo.textContent=a?a.name:"Ningún archivo elegido";msg.hidden=true;if(!a)return;if(a.type&&TIPOS.indexOf(a.type)<0){error("Subí una foto (JPG, PNG o HEIC) o un PDF.");file.value="";nombreArchivo.textContent="Ningún archivo elegido"}else if(a.size>MAX){error("El archivo pesa demasiado (máximo 10 MB).");file.value="";nombreArchivo.textContent="Ningún archivo elegido"}});f.addEventListener("submit",function(e){e.preventDefault();msg.hidden=true;var d=new FormData(f);if(!file.files[0]){error("Falta la foto o el PDF de la orden.");return}if(!String(d.get("name")||"").trim()||!String(d.get("phone")||"").trim()){error("Completá tu nombre y tu celular.");return}if(!f.querySelector("[name=consent]").checked){error("Para enviarla, aceptá el uso de tus datos.");return}d.set("consent","true");btn.disabled=true;btn.textContent="Enviando...";fetch("/api/enviar-orden",{method:"POST",body:d}).then(function(r){return r.json()}).then(function(j){if(!j.ok)throw 0;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"lead_form_submit",form_name:"orden_medica",origin:"pagina_turnos"});f.hidden=true;ok.hidden=false}).catch(function(){error("No pudimos enviar la orden. Probá de nuevo o mandala por WhatsApp.");btn.disabled=false;btn.textContent="Enviar orden"})})})();</script>`;

const WA_ORDEN = "Hola BA! Tengo una orden médica y quiero sacar turno. Te mando la foto. (Vengo de la web)";

export function TurnosPage() {
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Turnos" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Pedí tu turno en BA</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Atención particular en {BRAND_INFO.address}. Elegí la forma que te quede más cómoda.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <div className="grid gap-4 md:grid-cols-3">
          <OpcionTurno numero="1" titulo="Ya sé qué necesito" texto="Reservá online: elegís especialidad, día y horario, y te llega la confirmación.">
            <a
              href={BRAND_INFO.agendaProUrl}
              target="_blank"
              rel="noopener"
              data-track="agendapro_direct_click"
              data-origin="turnos_opcion"
              className="block text-center px-6 py-3 rounded-full bg-[#5C1A3D] text-white font-bold hover:bg-[#C2006B] transition-colors"
            >
              Reservá online
            </a>
          </OpcionTurno>
          <OpcionTurno numero="2" titulo="Tengo una orden médica" texto="Mandanos la orden y te decimos qué turno sacar, cómo prepararte y cuánto sale.">
            <a href="#orden" className="block text-center px-6 py-3 rounded-full border-2 border-[#5C1A3D] text-[#5C1A3D] font-bold hover:bg-[#5C1A3D] hover:text-white transition-colors">
              Subir la orden
            </a>
          </OpcionTurno>
          <OpcionTurno numero="3" titulo="Tengo dudas" texto="Escribinos y te ayudamos a elegir especialista o estudio.">
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener"
              data-track="whatsapp_click"
              data-origin="turnos_opcion"
              className="block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
            >
              Escribinos por WhatsApp
            </a>
          </OpcionTurno>
        </div>

        <section id="orden" className="scroll-mt-20 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
          <div className="rounded-2xl border border-[#E8D5C4] bg-white p-6 sm:p-8">
            <h2 className="font-extrabold text-2xl text-[#5C1A3D]">Subí tu orden médica</h2>
            <p className="mt-2 text-sm text-gray-600 font-light">
              Te contactamos por WhatsApp o por teléfono, en el horario de atención, para darte el turno.
            </p>

            <form id="form-orden" noValidate className="mt-6 space-y-4">
              <div>
                <span className="block text-xs font-bold text-gray-600 mb-1.5">Foto o PDF de la orden</span>
                <label htmlFor="orden-archivo" className="flex items-center gap-3 rounded-xl border-2 border-dashed border-[#E8D5C4] bg-[#F8F6F4] px-4 py-4 cursor-pointer hover:border-[#C2006B]">
                  <span className="px-3 py-1.5 rounded-full bg-[#5C1A3D] text-white text-xs font-bold whitespace-nowrap">Elegir archivo</span>
                  <span id="orden-archivo-nombre" className="text-sm text-gray-500 truncate">Ningún archivo elegido</span>
                </label>
                <input id="orden-archivo" name="file" type="file" accept="image/*,application/pdf" className="sr-only" />
                <span className="block mt-1 text-[11px] text-gray-500">Podés sacarle una foto con el celular. Hasta 10 MB.</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoOrden id="orden-nombre" name="name" label="Nombre y apellido" type="text" autoComplete="name" />
                <CampoOrden id="orden-celular" name="phone" label="Celular" type="tel" autoComplete="tel" />
              </div>
              <CampoOrden id="orden-email" name="email" label="Email (opcional)" type="email" autoComplete="email" />
              <label className="flex items-start gap-2 text-xs text-gray-600">
                <input type="checkbox" name="consent" className="mt-0.5" />
                <span>
                  Acepto que BA Consultorios Médicos use estos datos y la orden solo para contactarme por este turno, conforme a la Ley de
                  Protección de Datos Personales N.º 25.326.
                </span>
              </label>
              <p id="orden-mensaje" hidden role="alert" className="text-sm text-[#C2006B] font-bold"></p>
              <button id="orden-enviar" type="submit" className="w-full px-6 py-3 rounded-full bg-[#5C1A3D] text-white font-bold hover:bg-[#C2006B] transition-colors disabled:opacity-60">
                Enviar orden
              </button>
            </form>

            <div id="orden-ok" hidden role="status" className="mt-6 rounded-xl bg-[#F2C4D0]/30 border border-[#F2C4D0] p-5">
              <p className="font-extrabold text-[#5C1A3D]">¡Recibimos tu orden!</p>
              <p className="mt-1 text-sm text-gray-700 font-light">Te contactamos en el horario de atención para darte el turno.</p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
              <h3 className="font-extrabold text-lg text-[#5C1A3D]">¿Preferís WhatsApp?</h3>
              <p className="mt-2 text-sm text-gray-600 font-light">Abrí el chat y mandanos la foto de la orden.</p>
              <a
                href={waUrl(WA_ORDEN)}
                target="_blank"
                rel="noopener"
                data-track="whatsapp_click"
                data-origin="turnos_orden"
                data-stype="Orden médica"
                className="mt-4 block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
              >
                Mandar la orden por WhatsApp
              </a>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm">
              <h3 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Qué pasa después</h3>
              <ol className="space-y-2 text-gray-600 font-light list-decimal pl-5">
                <li>Revisamos la orden.</li>
                <li>Te escribimos con el turno, el valor y la preparación, si hace falta.</li>
                <li>El día del turno, traé la orden.</li>
              </ol>
            </div>
          </aside>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <section>
            <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">Preguntas frecuentes</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Atienden por obra social o prepaga?</dt>
                <dd className="text-gray-600 font-light mt-1">No. La atención es particular, con beneficios por pago en efectivo y con LinkMed.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Cuánto sale?</dt>
                <dd className="text-gray-600 font-light mt-1">
                  Mirá los valores en <a href="/precios/" className="font-bold text-[#C2006B] underline underline-offset-4">precios</a>, o consultanos con tu orden.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿En qué horario atienden?</dt>
                <dd className="text-gray-600 font-light mt-1">{BRAND_INFO.schedule}. Los días de cada especialidad cambian seguido: los ves en la agenda online.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Dónde queda BA?</dt>
                <dd className="text-gray-600 font-light mt-1">En {BRAND_INFO.address}.</dd>
              </div>
            </dl>
          </section>
          <aside>
            <Beneficios />
          </aside>
        </div>
      </div>
    </Shell>
  );
}

function OpcionTurno({ numero, titulo, texto, children }: { numero: string; titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E8D5C4] bg-white p-6 flex flex-col">
      <span className="w-8 h-8 rounded-full bg-[#F2C4D0]/50 text-[#5C1A3D] font-extrabold flex items-center justify-center text-sm">{numero}</span>
      <h2 className="mt-3 font-extrabold text-lg text-[#5C1A3D]">{titulo}</h2>
      <p className="mt-1 mb-5 text-sm text-gray-600 font-light flex-1">{texto}</p>
      {children}
    </div>
  );
}

function CampoOrden({ id, name, label, type, autoComplete }: { id: string; name: string; label: string; type: string; autoComplete: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-[#E8D5C4] bg-[#F8F6F4] px-4 py-3 text-sm focus:outline-none focus:border-[#C2006B]"
      />
    </div>
  );
}

const WA_DERIVADO = "Hola BA! Quiero consultar el valor y el turno de un estudio. (Vengo de la web)";
const WA_LABORATORIO = "Hola BA! Quiero hacerme un análisis de laboratorio. Te mando la foto de la orden. (Vengo de la web)";

// Los grupos se abren en el lugar (<details>), sin desplazar la página.
export function EstudiosPage() {
  const grupos = GRUPOS_ESTUDIO.map((e) => ({ ...e, grupo: GRUPOS_PRECIOS.find((g) => g.id === e.id) })).filter((e) => e.grupo);
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Estudios" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Estudios en San Justo</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Ecografías, Doppler, estudios cardiológicos y más, en {BRAND_INFO.address}. Mirá qué hacemos en BA, cómo prepararte y a dónde
            te derivamos para estudios de alta complejidad.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={BRAND_INFO.agendaProUrl}
              target="_blank"
              rel="noopener"
              data-track="agendapro_direct_click"
              data-origin="estudios_hero"
              className="px-6 py-3 rounded-full bg-[#5C1A3D] text-white font-bold hover:bg-[#C2006B] transition-colors"
            >
              Reservá online
            </a>
            <a href="/turnos/#orden" className="px-6 py-3 rounded-full border-2 border-[#5C1A3D] text-[#5C1A3D] font-bold hover:bg-[#5C1A3D] hover:text-white transition-colors">
              Tengo una orden médica
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section>
          <h2 className="font-extrabold text-2xl text-[#5C1A3D]">Estudios que se hacen en BA</h2>
          <p className="mt-2 mb-5 text-sm text-gray-600 font-light">Tocá cada grupo para ver la lista completa.</p>
          <div className="grid gap-3 md:grid-cols-2 items-start">
            {grupos.map(({ id, titulo, grupo }) => (
              <details key={id} id={id} className="group rounded-2xl border border-[#E8D5C4] bg-white">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4">
                  <span>
                    <span className="block font-extrabold text-[#5C1A3D]">{titulo}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {grupo!.practicas.length} {grupo!.practicas.length === 1 ? "estudio" : "estudios"}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-[#C2006B] text-xl font-bold transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 pb-5">
                  <ul className="space-y-1.5 text-sm text-gray-700 font-light">
                    {grupo!.practicas.map((p) => (
                      <li key={p.nombre} className="flex gap-2">
                        <span aria-hidden="true" className="text-[#C2006B]">·</span>
                        {p.nombre}
                      </li>
                    ))}
                  </ul>
                  <a href={`/precios/#${id}`} className="inline-block mt-4 text-sm font-bold text-[#C2006B] underline underline-offset-4">
                    Ver precios
                  </a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="preparacion" className="scroll-mt-20">
          <h2 className="font-extrabold text-2xl text-[#5C1A3D]">Cómo prepararte</h2>
          <p className="mt-2 mb-5 text-sm text-gray-600 font-light max-w-2xl">
            Estos estudios necesitan una preparación. Para el resto, te indicamos cómo venir cuando sacás el turno.
          </p>
          <div className="rounded-2xl border border-[#E8D5C4] bg-white divide-y divide-[#E8D5C4]/60">
            {PREPARACIONES.map((p) => (
              <div key={p.estudio} className="px-5 py-4 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-6">
                <p className="font-bold text-[#5C1A3D] text-sm">{p.estudio}</p>
                <p className="mt-1 sm:mt-0 text-sm text-gray-600 font-light leading-relaxed">{p.indicacion}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">Si tenés dudas sobre la preparación, escribinos antes del turno.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <section className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
            <h2 className="font-extrabold text-xl text-[#5C1A3D]">Estudios de alta complejidad</h2>
            <p className="mt-2 text-sm text-gray-600 font-light">Estos estudios no se hacen en BA: te derivamos a un centro de alta complejidad. Escribinos y te pasamos el valor y cómo sacar el turno.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {DERIVADOS.map((d) => (
                <li key={d.nombre}>
                  <span className="font-bold text-[#5C1A3D]">{d.nombre}</span>
                  {d.detalle && <span className="block text-xs text-gray-500 font-light">{d.detalle}</span>}
                </li>
              ))}
            </ul>
            <a
              href={waUrl(WA_DERIVADO)}
              target="_blank"
              rel="noopener"
              data-track="whatsapp_click"
              data-origin="estudios_derivados"
              data-stype="Estudio derivado"
              className="mt-5 block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
            >
              Consultá valor y turno por WhatsApp
            </a>
          </section>

          <section className="rounded-2xl border border-[#E8D5C4] bg-white p-6">
            <h2 className="font-extrabold text-xl text-[#5C1A3D]">Laboratorio</h2>
            <p className="mt-2 text-sm text-gray-600 font-light">
              El valor y la preparación dependen de lo que pida tu orden. Mandanos una foto y te respondemos con todo.
            </p>
            <a
              href={waUrl(WA_LABORATORIO)}
              target="_blank"
              rel="noopener"
              data-track="whatsapp_click"
              data-origin="estudios_laboratorio"
              data-stype="Laboratorio"
              className="mt-5 block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
            >
              Mandar la orden por WhatsApp
            </a>
            <a href="/turnos/#orden" className="mt-3 block text-center text-sm font-bold text-[#5C1A3D] underline underline-offset-4">
              O subila desde la web
            </a>
          </section>
        </div>

        <Beneficios />
      </div>
    </Shell>
  );
}

const MAPS_LUGAR = "https://maps.google.com/?q=BA+Consultorios+M%C3%A9dicos,+Almafuerte+3558,+San+Justo,+La+Matanza";
const MAPS_COMO_LLEGAR = "https://www.google.com/maps/dir/?api=1&destination=BA+Consultorios+M%C3%A9dicos%2C+Almafuerte+3558%2C+San+Justo%2C+La+Matanza";
const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.9430887002068!2d-58.5548508!3d-34.6813858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcc7e7a188c227%3A0x2b693e1d88229b3!2sBA%20Consultorios%20M%C3%A9dicos%20-%20Cl%C3%ADnica%20de%20Especialidades%20en%20San%20Justo!5e0!3m2!1ses-419!2sar!4v1784852093873!5m2!1ses-419!2sar";

// Referencias del barrio confirmadas por Dani (1/11/2026): shopping y plaza de
// San Justo. Colectivos y accesibilidad: no se publican hasta que BA los confirme.
export function ContactoPage() {
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Contacto" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Contacto y cómo llegar</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Estamos en {BRAND_INFO.address}, a metros del shopping de San Justo y de la plaza de San Justo. Escribinos por WhatsApp o
            reservá tu turno online.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E8D5C4] bg-white p-6">
              <h2 className="font-extrabold text-lg text-[#5C1A3D]">Dirección</h2>
              <p className="mt-1 text-sm text-gray-700">{BRAND_INFO.address}</p>
              <p className="text-xs text-gray-500 font-light">Provincia de Buenos Aires</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li className="flex gap-2"><span aria-hidden="true" className="text-[#C2006B]">·</span>A metros del shopping de San Justo</li>
                <li className="flex gap-2"><span aria-hidden="true" className="text-[#C2006B]">·</span>A metros de la plaza de San Justo</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={MAPS_COMO_LLEGAR}
                  target="_blank"
                  rel="noopener"
                  data-track="social_click"
                  data-destination="google_maps_como_llegar"
                  data-origin="pagina_contacto"
                  className="px-5 py-2.5 rounded-full bg-[#5C1A3D] text-white text-sm font-bold hover:bg-[#C2006B] transition-colors"
                >
                  Cómo llegar
                </a>
                <a
                  href={MAPS_LUGAR}
                  target="_blank"
                  rel="noopener"
                  data-track="social_click"
                  data-destination="google_maps"
                  data-origin="pagina_contacto"
                  className="px-5 py-2.5 rounded-full border-2 border-[#5C1A3D] text-[#5C1A3D] text-sm font-bold hover:bg-[#5C1A3D] hover:text-white transition-colors"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8D5C4] bg-white p-6">
              <h2 className="font-extrabold text-lg text-[#5C1A3D]">Horarios de atención</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600 font-light">Lunes a viernes</dt>
                  <dd className="font-bold text-[#5C1A3D]">8:00 a 20:00</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600 font-light">Sábados</dt>
                  <dd className="font-bold text-[#5C1A3D]">8:00 a 14:00</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-gray-500 font-light">
                La reserva online funciona siempre. Por WhatsApp respondemos en el horario de atención.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
              <h2 className="font-extrabold text-lg text-[#5C1A3D]">Escribinos o llamanos</h2>
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener"
                data-track="whatsapp_click"
                data-origin="pagina_contacto"
                className="mt-4 block text-center px-6 py-3 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
              >
                WhatsApp {BRAND_INFO.whatsapp}
              </a>
              <a
                href="tel:+541139701945"
                className="mt-3 block text-center px-6 py-3 rounded-full border-2 border-[#5C1A3D] text-[#5C1A3D] font-bold hover:bg-[#5C1A3D] hover:text-white transition-colors"
              >
                Llamar al {BRAND_INFO.phone}
              </a>
              <a
                href={BRAND_INFO.agendaProUrl}
                target="_blank"
                rel="noopener"
                data-track="agendapro_direct_click"
                data-origin="pagina_contacto"
                className="mt-3 block text-center text-sm font-bold text-[#5C1A3D] underline underline-offset-4"
              >
                O reservá tu turno online
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8D5C4] bg-white p-3 h-80 sm:h-[28rem] lg:h-full lg:min-h-[32rem]">
            <iframe
              src={MAPS_EMBED}
              title="Mapa: BA Consultorios Médicos, Almafuerte 3558, San Justo"
              className="w-full h-full rounded-xl"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
          <section>
            <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">Antes de venir</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Necesito turno?</dt>
                <dd className="text-gray-600 font-light mt-1">
                  Sí. Sacalo online o por WhatsApp. Si tenés una orden médica, <a href="/turnos/#orden" className="font-bold text-[#C2006B] underline underline-offset-4">mandala desde acá</a>.
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Qué traigo?</dt>
                <dd className="text-gray-600 font-light mt-1">Tu DNI y, si tenés, la orden médica y los estudios anteriores.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Atienden por obra social o prepaga?</dt>
                <dd className="text-gray-600 font-light mt-1">No. La atención es particular, con beneficios por pago en efectivo y con LinkMed.</dd>
              </div>
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿El estudio necesita preparación?</dt>
                <dd className="text-gray-600 font-light mt-1">
                  Mirá <a href="/estudios/#preparacion" className="font-bold text-[#C2006B] underline underline-offset-4">cómo prepararte</a> o consultanos al sacar el turno.
                </dd>
              </div>
            </dl>
          </section>
          <aside className="rounded-2xl border border-[#E8D5C4] bg-white p-6">
            <h2 className="font-extrabold text-lg text-[#5C1A3D]">Seguinos</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a href={BRAND_INFO.instagramUrl} target="_blank" rel="noopener" data-track="social_click" data-destination="instagram_contacto" data-origin="pagina_contacto" className="font-bold text-[#5C1A3D] hover:text-[#C2006B]">
                Instagram {BRAND_INFO.instagramHandle}
              </a>
              <a href={BRAND_INFO.facebookUrl} target="_blank" rel="noopener" data-track="social_click" data-destination="facebook_contacto" data-origin="pagina_contacto" className="font-bold text-[#5C1A3D] hover:text-[#C2006B]">
                Facebook BA Consultorios Médicos
              </a>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
