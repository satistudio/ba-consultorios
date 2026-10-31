// Datos de las páginas por especialidad (/especialidades/<slug>/).
// Se generan como HTML estático en el build (scripts/build-paginas.tsx) para
// que Google indexe cada especialidad con su propio título y descripción.

import { SPECIALTIES, SERVICES_DATA, MedicalService } from "../data";

// Precio de la consulta particular. Fuente: planilla "PRECIOS 01-09-2026".
//   lista = 1ra vez o renovación, pago electrónico (precio publicado)
//   desde = con LinkMed y pago en efectivo (todos los beneficios sumados)
// Las columnas internas (PROFESIONAL / BA) nunca se publican.
export const PRECIOS_VIGENTES = "01-09-2026";

const CONSULTA: Record<string, { lista: number; desde: number; nota?: string }> = {
  "Alergista": { lista: 42000, desde: 36000 },
  "Cardiología": { lista: 37000, desde: 31500 },
  "Cardiología infantil": { lista: 42000, desde: 36000, nota: "Incluye electrocardiograma." },
  "Cirugía general": { lista: 38000, desde: 32400 },
  "Clínica médica": { lista: 37000, desde: 31500 },
  "Dermatología": { lista: 41000, desde: 35100 },
  "Diabetología": { lista: 39000, desde: 33300 },
  "Endocrinología de adultos": { lista: 39000, desde: 33300 },
  "Flebología": { lista: 37000, desde: 31500 },
  "Gastroenterología": { lista: 38000, desde: 32400 },
  "Ginecología": { lista: 37000, desde: 31500 },
  "Hematología": { lista: 38000, desde: 32400 },
  "Hepatología": { lista: 38000, desde: 32400 },
  "Infectología": { lista: 39000, desde: 33300 },
  "Kinesiología": { lista: 37000, desde: 31500 },
  "Neumonología": { lista: 39000, desde: 33300 },
  "Neumonología infantil": { lista: 39000, desde: 33300 },
  "Neurología": { lista: 42000, desde: 36000 },
  "Neurología infantil": { lista: 42000, desde: 36000 },
  "Nutrición": { lista: 39000, desde: 33300 },
  "Obstetricia": { lista: 39000, desde: 33300 },
  "Oftalmología": { lista: 37000, desde: 31500 },
  "Otorrinolaringología": { lista: 39000, desde: 33300 },
  "Pediatría": { lista: 37000, desde: 31500 },
  "Proctología": { lista: 38000, desde: 32400 },
  "Reumatología": { lista: 40000, desde: 34200 },
  "Traumatología": { lista: 37000, desde: 31500 },
  "Urología": { lista: 37000, desde: 31500 },
  "Podología": { lista: 42000, desde: 36000 },
};

// Sin página propia: especialidades y prácticas marcadas "no usar" en la guía
// de marca de BA (la web lleva Meta Pixel, que restringe datos de salud).
const SIN_PAGINA = new Set(["Psiquiatría de adultos", "Psicopedagogía"]);
const SERVICIOS_NO_PUBLICAR = new Set(["ur-6"]);

export interface Especialidad {
  nombre: string;
  slug: string;
  consulta?: { lista: number; desde: number; nota?: string };
  servicios: MedicalService[];
}

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const ESPECIALIDADES: Especialidad[] = SPECIALTIES.filter((n) => !SIN_PAGINA.has(n))
  .map((nombre) => ({
    nombre,
    slug: slugify(nombre),
    consulta: CONSULTA[nombre],
    servicios: SERVICES_DATA.filter(
      (s, i, todos) =>
        s.specialty === nombre &&
        !SERVICIOS_NO_PUBLICAR.has(s.id) &&
        // data.ts repite algunos estudios dentro de la misma especialidad
        todos.findIndex((o) => o.specialty === s.specialty && o.name === s.name) === i,
    ),
  }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const formatoPrecio = (n: number) => "$" + n.toLocaleString("es-AR");
