// Páginas estáticas (sin React en el navegador): se renderizan a HTML en el
// build con scripts/build-paginas.tsx. Los botones llevan data-track y un
// script inline los empuja al dataLayer con los mismos eventos que la home
// (whatsapp_click, agendapro_direct_click). Nunca llamar gtag() ni fbq().

import type { ReactNode } from "react";
import { BRAND_INFO, MedicalService } from "../data";
import { ESPECIALIDADES, Especialidad, formatoPrecio, PRECIOS_VIGENTES } from "./especialidades";
import { GRUPOS_PRECIOS, gruposDeEspecialidad } from "./precios";

const WA_NUMERO = "5491164344822";

// Servicios presenciales por naturaleza: no se les ofrece teleconsulta.
const SIN_TELECONSULTA = new Set(["Podología", "Kinesiología", "Audiometría y estudios auditivos"]);
const waUrl = (texto: string) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`;

function Header() {
  return (
    <header className="bg-white/95 border-b border-[#E8D5C4]/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/ba-isotipo-vino.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          <span className="hidden min-[420px]:inline font-extrabold text-[#5C1A3D] text-sm sm:text-base leading-tight">BA Consultorios Médicos</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3 text-[13px] font-medium">
          <a href="/especialidades/" className="hidden sm:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Especialidades</a>
          <a href="/precios/" className="px-2 sm:px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Precios</a>
          <a href="/" className="hidden sm:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Inicio</a>
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
          <p className="font-light">{BRAND_INFO.address}</p>
        </div>
        <div>
          <p className="font-extrabold text-white mb-2">Horarios</p>
          <p className="font-light">{BRAND_INFO.schedule}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-extrabold text-white mb-1">Turnos</p>
          <a href="/especialidades/" className="hover:text-white">Todas las especialidades</a>
          <a href="/precios/" className="hover:text-white">Precios de estudios y prácticas</a>
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
                <p className="mt-4 text-[11px] text-gray-400">Valores de referencia. Pueden cambiar: confirmalos al reservar.</p>
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
        <ul className="grid sm:grid-cols-2 gap-3">
          {ESPECIALIDADES.map((e) => (
            <li key={e.slug}>
              <a href={`/especialidades/${e.slug}/`} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3 hover:border-[#C2006B] transition-colors">
                <span className="font-bold text-[#5C1A3D] text-sm">{e.nombre}</span>
                {e.consulta && <span className="text-xs text-gray-500 whitespace-nowrap">desde {formatoPrecio(e.consulta.desde)}</span>}
              </a>
            </li>
          ))}
        </ul>
        <aside>
          <Beneficios />
        </aside>
      </div>
    </Shell>
  );
}

// Buscador de /precios/: muestra los resultados en un bloque debajo del campo,
// con los valores, sin mover la página ni tocar la lista completa. Arma el
// índice leyendo las filas ya renderizadas (data-*), así no duplica datos.
// Sin acentos ni mayúsculas, para que "ecografia" encuentre "Ecografía".
export const BUSCADOR_PRECIOS = `<script>(function(){var i=document.getElementById("buscar-precio");if(!i)return;var n=function(s){return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase()};var panel=document.getElementById("resultados-busqueda"),lista=document.getElementById("lista-resultados"),vacio=document.getElementById("sin-resultados"),info=document.getElementById("cantidad-resultados"),tpl=document.getElementById("tpl-resultado"),MAX=8;var filas=[].map.call(document.querySelectorAll("[data-practica]"),function(r){var g=r.closest("[data-grupo]").dataset.grupo;return{d:r.dataset,g:g,k:n(r.dataset.practica+" "+g)}});i.addEventListener("input",function(){var q=n(i.value.trim());lista.innerHTML="";if(q.length<2){panel.hidden=true;return}var t=q.split(/\\s+/),hit=filas.filter(function(f){return t.every(function(w){return f.k.indexOf(w)>-1})});panel.hidden=false;vacio.hidden=hit.length>0;info.hidden=hit.length===0;info.textContent=hit.length>MAX?"Mostramos "+MAX+" de "+hit.length+" resultados. Escribí algo más para afinar la búsqueda.":hit.length===1?"1 resultado":hit.length+" resultados";hit.slice(0,MAX).forEach(function(f){var c=tpl.content.cloneNode(true),q=function(x){return c.querySelector("[data-campo="+x+"]")};var nom=q("nombre");nom.textContent=f.d.practica;if(f.d.href){var a=document.createElement("a");a.href=f.d.href;a.className=nom.className+" underline underline-offset-4";a.textContent=f.d.practica;nom.replaceWith(a)}q("grupo").textContent=f.g;q("lista").textContent=f.d.lista;q("desde").textContent=f.d.desde||"Consultar";lista.appendChild(c)})})})();</script>`;

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
          <nav aria-label="Grupos de precios" className="mt-5 flex flex-wrap gap-2">
            {[{ id: "consultas", titulo: "Consultas" }, ...GRUPOS_PRECIOS].map((g) => (
              <a key={g.id} href={`#${g.id}`} className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8D5C4] text-[#5C1A3D] hover:border-[#C2006B] hover:text-[#C2006B]">
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
          <p className="text-[11px] text-gray-400">
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
        <span className="sm:hidden text-xs text-gray-400">Lista </span>
        {formatoPrecio(lista)}
      </span>
      {desde ? (
        <span className="text-right font-bold text-[#C2006B]">
          <span className="sm:hidden text-xs font-normal text-gray-400">Desde </span>
          {formatoPrecio(desde)}
        </span>
      ) : (
        <span className="text-right text-gray-400">—</span>
      )}
    </li>
  );
}
