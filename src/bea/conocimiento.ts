// Lo que sabe BEA. Se arma con los MISMOS datos que publican las páginas
// (especialidades, precios, estudios), así cuando cambia un precio en la web
// BEA cambia con ella: no hay una segunda lista que actualizar.
// Regla aprobada (doc "BEA: reglas y preguntas trampa"): BEA responde solo con
// lo publicado. Por eso acá NO entran costos de laboratorio, columnas internas,
// promos del mes, horarios por profesional ni nombres de médicos.

import { BRAND_INFO } from "../data";
import { ESPECIALIDADES, PRECIOS_VIGENTES } from "../paginas/especialidades";
import { GRUPOS_PRECIOS } from "../paginas/precios";
import { DERIVADOS, PREPARACIONES } from "../paginas/estudios";

// Igual que en Paginas.tsx: servicios presenciales sin teleconsulta.
// "No usar" de la guía de marca: BEA no orienta sobre esto (regla aprobada).
const NO_USAR = /verrug|acrocord|hpv/i;

const SIN_TELECONSULTA = new Set(["Podología", "Kinesiología", "Audiometría y estudios auditivos"]);

// Sin toLocaleString: el servidor de Cloudflare no siempre trae el formato es-AR.
const pesos = (n: number) => "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const precio = (lista: number, desde?: number) =>
  desde ? `lista ${pesos(lista)}, con beneficios desde ${pesos(desde)}` : `lista ${pesos(lista)}`;

function especialidades() {
  return ESPECIALIDADES.map((e) => {
    const partes = [`- ${e.nombre}`];
    if (e.consulta) partes.push(`consulta: ${precio(e.consulta.lista, e.consulta.desde)}${e.consulta.nota ? ` (${e.consulta.nota})` : ""}`);
    partes.push(SIN_TELECONSULTA.has(e.nombre) ? "solo presencial" : "también teleconsulta");
    const servicios = e.servicios.filter((s) => !NO_USAR.test(s.name)).map((s) => (s.type === "Estudio derivado" ? `${s.name} (alta complejidad: se deriva)` : s.name)).join("; ");
    if (servicios) partes.push(`incluye: ${servicios}`);
    return partes.join(" | ");
  }).join("\n");
}

function precios() {
  return GRUPOS_PRECIOS.map(
    (g) => `${g.titulo}:\n` + g.practicas.map((p) => `- ${p.nombre}: ${precio(p.lista, p.desde)}${p.nota ? ` (${p.nota})` : ""}`).join("\n"),
  ).join("\n\n");
}

export const CONOCIMIENTO = `# Datos de BA Consultorios Médicos (lo publicado en la web)

## Dónde y cuándo
- Dirección: ${BRAND_INFO.address}. A metros del shopping de San Justo y de la plaza de San Justo.
- Horario de atención: ${BRAND_INFO.schedule}. Domingos cerrado. Los días de cada especialidad cambian seguido: se ven en la agenda online.
- Teléfono: ${BRAND_INFO.phone}. WhatsApp: ${BRAND_INFO.whatsapp}.
- Página de contacto con mapa y cómo llegar: /contacto/

## Cómo sacar turno
- Online, en la agenda (se ven días y horarios disponibles y llega un recordatorio).
- Con orden médica: se sube la foto de la orden en /turnos/ o se manda por WhatsApp. BA revisa la orden y escribe con el turno, el valor y la preparación si hace falta.
- Por WhatsApp, dentro del horario de atención. Si se necesita antes, por WhatsApp se evalúa un sobreturno.
- La orden médica no es obligatoria para la mayoría de las ecografías o electrocardiogramas si se viene de forma particular. Si el estudio lo pidió otro profesional, conviene traerla para hacer exactamente lo que pide.

## Cómo se paga
- La atención es particular. No trabaja con obras sociales, prepagas ni PAMI.
- No hay atención a domicilio, ni descuento familiar, ni plan de socios.
- Medios de pago: efectivo, transferencia, o tarjeta de débito o crédito por MercadoPago, antes de entrar al consultorio.
- Beneficios: pagando en efectivo, hasta 10% de descuento. Con LinkMed, $2.000 menos por cada consulta o práctica (en BA y en los centros asociados, que son las farmacias Vilela). Los dos beneficios se suman. "Con beneficios desde" es el valor con los dos juntos; con uno solo, el valor queda entre el de lista y ese número.
- Las promos del mes cambian cada mes y se consultan por WhatsApp.
- Precios vigentes desde el ${PRECIOS_VIGENTES.replace(/-/g, "/")}.

## Informes de estudios
- El plazo depende de cada estudio: se consulta al sacar el turno o por WhatsApp.
- Se entregan en formato digital por WhatsApp, o impresos si se piden al hacer el estudio.

## Especialidades (valor de la consulta particular)
${especialidades()}

## Estudios y prácticas en BA (precios)
${precios()}

## Preparaciones publicadas
${PREPARACIONES.map((p) => `- ${p.estudio}: ${p.indicacion}`).join("\n")}
Para cualquier otro estudio, la preparación se indica al sacar el turno.

## Estudios de alta complejidad (no se hacen en BA)
BA deriva a un centro de alta complejidad. El valor y cómo sacar el turno se consultan por WhatsApp; no se publican valores ni el nombre del centro.
${DERIVADOS.map((d) => `- ${d.nombre}${d.detalle ? `. ${d.detalle}` : ""}`).join("\n")}

## Laboratorio
El valor y la preparación dependen de lo que pida la orden. Se manda la foto de la orden por WhatsApp o se sube en /turnos/.
`;
