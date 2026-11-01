// Datos de /estudios/.
// Estudios en BA: se toman de GRUPOS_PRECIOS (misma fuente que /precios/).
// Preparaciones: planilla "PRECIOS 01-09-2026". Solo se publican las que son
// claras; el resto se indica al sacar el turno. "Ecografía vesical" de la planilla (precio y ayuno 6 hs)
// de la planilla es de vesícula (confirmado por Dani 1/11). Sin marcas
// comerciales de medicamentos.
// Derivados: estudios que BA deriva a un centro de alta complejidad. No se
// publican valores ni el nombre del centro, y no se lo llama "centro asociado"
// (en BA ese término es farmacias Vilela, por LinkMed).

export const GRUPOS_ESTUDIO: { id: string; titulo: string }[] = [
  { id: "ecografias", titulo: "Ecografías" },
  { id: "doppler", titulo: "Ecografías Doppler" },
  { id: "obstetricas", titulo: "Ecografías obstétricas" },
  { id: "mamografia", titulo: "Mamografía" },
  { id: "cardiologia", titulo: "Estudios cardiológicos" },
  { id: "neumonologia", titulo: "Estudios respiratorios" },
  { id: "neurologia", titulo: "Electroencefalograma" },
  { id: "oftalmologia", titulo: "Estudios de los ojos" },
  { id: "alergia", titulo: "Tests de alergia" },
];

export interface Preparacion {
  estudio: string;
  indicacion: string;
}

export const PREPARACIONES: Preparacion[] = [
  {
    estudio: "Ecografía de vesícula",
    indicacion: "Ayuno de 6 horas antes del estudio.",
  },
  {
    estudio: "Ecografía renal",
    indicacion: "Tomá 1 litro de agua (entre 4 y 8 vasos) entre 30 minutos y 1 hora y media antes del estudio, y no orines.",
  },
  {
    estudio: "Ecografía reno-vesical (vías urinarias)",
    indicacion: "Tomá entre 1 y 1,5 litros de agua una hora antes y vení con la vejiga llena.",
  },
  {
    estudio: "Ecografía reno-vésico-prostática",
    indicacion: "Tomá 1 litro de agua una hora antes y no orines.",
  },
  {
    estudio: "Doppler de arterias renales",
    indicacion:
      "Ayuno de 6 horas. Además, los 3 días anteriores se toma un medicamento para reducir los gases: te pasamos el detalle al sacar el turno.",
  },
  {
    estudio: "Prick test (alergia)",
    indicacion:
      "Algunos medicamentos se suspenden unos días antes: antialérgicos, antidepresivos, corticoides y antigripales. Consultá con tu médico antes de dejar cualquier medicación.",
  },
];

export const DERIVADOS: { nombre: string; detalle?: string }[] = [
  { nombre: "Resonancia magnética (RMN)", detalle: "Incluye angiorresonancia, colangiorresonancia y urorresonancia." },
  { nombre: "Tomografía computada (TC)" },
  { nombre: "Densitometría ósea" },
  { nombre: "Electromiograma" },
  { nombre: "Potenciales evocados" },
  { nombre: "Polisomnografía (estudio del sueño)" },
];
