// Precios de estudios y prácticas para /precios/.
// Fuente: planilla "PRECIOS 01-09-2026" (misma vigencia que las consultas).
//   lista = 1ra vez o renovación, pago electrónico (precio publicado)
//   desde = con LinkMed y pago en efectivo (todos los beneficios sumados);
//           si la práctica no tiene valor con LinkMed, es el valor en efectivo.
// Quedan afuera a propósito: columnas internas (PROFESIONAL / BA / materiales),
// promociones (se consultan por WhatsApp), prácticas "no usar" de la guía de
// marca (verrugas/HPV, ADOS/ADI-R, tests de CI), urológicas sin precio, y filas
// con nombres de profesionales o valores "a consultar".

export interface Practica {
  nombre: string;
  lista: number;
  // Sin valor: la planilla no tiene precio con beneficios para esa práctica.
  desde?: number;
  nota?: string;
}

export interface GrupoPrecios {
  id: string;
  titulo: string;
  // Especialidades (nombres de data.ts) cuyas páginas enlazan a este grupo.
  especialidades: string[];
  practicas: Practica[];
}

const p = (nombre: string, lista: number, desde: number | undefined, nota?: string): Practica => ({ nombre, lista, desde, nota });

export const GRUPOS_PRECIOS: GrupoPrecios[] = [
  {
    id: "ecografias",
    titulo: "Ecografías",
    especialidades: ["Ginecología", "Urología", "Traumatología", "Pediatría"],
    practicas: [
      p("Ecografía abdominal", 37000, 31500),
      p("Ecografía hepatobiliopancreática", 37000, 31500),
      p("Ecografía transvaginal", 37000, 31500),
      p("Ecografía pleural", 37000, 31500),
      p("Ecografía renal", 37000, 31500),
      p("Ecografía vesical", 37000, 31500),
      p("Ecografía articular (mano, codo, rodilla, hombro o pie)", 42000, 36000),
      p("Ecografía de cadera pediátrica", 39000, 33300),
      p("Ecografía cerebral", 47000, 40500),
      p("Ecografía de pared abdominal", 39000, 33300),
      p("Ecografía inguinal", 39000, 33300),
      p("Ecografía mamaria", 39000, 33300),
      p("Ecografía de partes blandas", 39000, 33300),
      p("Ecografía pelviana", 39000, 33300),
      p("Ecografía prostática", 39000, 33300),
      p("Ecografía testicular o peneana", 39000, 33300),
      p("Ecografía de tiroides", 39000, 33300),
      p("Ecografía reno-vesical (vías urinarias)", 54000, 46800),
      p("Ecografía vésico-prostática", 52000, 45000),
      p("Ecografía reno-vésico-prostática", 62000, 54000),
    ],
  },
  {
    id: "doppler",
    titulo: "Ecografías Doppler",
    especialidades: ["Cardiología", "Flebología"],
    practicas: [
      p("Doppler abdominal", 57000, 49500),
      p("Doppler de aorta abdominal", 57000, 49500),
      p("Doppler espleno-portal", 57000, 49500),
      p("Doppler ginecológico o transvaginal", 57000, 49500),
      p("Doppler mamario", 57000, 49500),
      p("Doppler de partes blandas", 57000, 49500),
      p("Doppler testicular o peneano", 57000, 49500),
      p("Doppler tiroideo", 57000, 49500),
      p("Doppler articular con power", 57000, 49500),
      p("Doppler de arterias renales", 80000, 70200),
      p("Doppler de vasos del cuello", 82000, 72000),
      p("Doppler venoso o arterial de ambos miembros", 82000, 72000),
      p("Doppler venoso y arterial de ambos miembros", 102000, 90000),
    ],
  },
  {
    id: "obstetricas",
    titulo: "Ecografías obstétricas",
    especialidades: ["Obstetricia", "Ginecología"],
    practicas: [
      p("Ecografía obstétrica", 41000, 35100),
      p("Ecografía obstétrica + Doppler obstétrico", 62000, 54000),
      p("Ecografía obstétrica + translucencia nucal o scan", 67000, 58500),
      p("Doppler obstétrico o fetal", 57000, 49500),
      p("Doppler de arterias uterinas", 57000, 49500),
      p("Doppler obstétrico + arterias uterinas", 77000, 67500),
      p("Doppler obstétrico + translucencia nucal o scan fetal", 77000, 67500),
      p("Translucencia nucal o scan + arterias uterinas", 77000, 67500),
      p("Doppler obstétrico + translucencia nucal o scan + arterias uterinas", 87000, 76500),
    ],
  },
  {
    id: "mamografia",
    titulo: "Mamografía",
    especialidades: ["Ginecología"],
    practicas: [p("Mamografía", 75000, undefined, "Consultá los beneficios por WhatsApp.")],
  },
  {
    id: "cardiologia",
    titulo: "Cardiología",
    especialidades: ["Cardiología"],
    practicas: [
      p("Consulta con electrocardiograma (apto físico)", 42000, 36000),
      p("Ecocardiograma Doppler", 77000, 67500),
      p("Ergometría", 58000, 50400),
      p("Holter", 72000, 63000),
      p("Presurometría (MAPA)", 72000, 63000),
    ],
  },
  {
    id: "ginecologia",
    titulo: "Ginecología",
    especialidades: ["Ginecología"],
    practicas: [
      p("PAP", 57000, 49500),
      p("Colposcopía", 38000, 32400),
      p("PAP y colposcopía", 66000, 57600),
      p("Topicaciones", 52000, 45000),
      p("Biopsia cervical", 172000, 153000),
      p("Biopsia de endometrio / legrado endometrial", 172000, 153000),
      p("Cepillado endometrial", 172000, 153000),
      p("Drenaje de glándula de Bartholino", 82000, 72000),
      p("Extracción de lesión vulvar", 102000, 90000),
      p("Colocación de DIU", 107000, 94500, "Incluye el DIU."),
      p("Extracción de DIU", 47000, 40500),
      p("Extracción y colocación de DIU en el día", 127000, 112500),
      p("Colocación de implante anticonceptivo (chip)", 202000, 180000),
      p("Extracción de implante anticonceptivo (chip)", 77000, 67500),
    ],
  },
  {
    id: "dermatologia",
    titulo: "Dermatología",
    especialidades: ["Dermatología"],
    practicas: [
      p("Biopsia de piel", 172000, 153000),
      p("Curetaje de escara", 107000, 94500),
      p("Curetaje de molusco", 92000, 81000),
      p("Drenaje", 62000, 54000),
      p("Escisión local", 62000, 54000),
      p("Extracción de quiste sebáceo", 62000, 54000),
      p("Extracción de quiste milium", 62000, 54000),
      p("Electrocoagulación", 62000, 54000),
      p("Infiltración", 67000, 58500),
      p("Topicación con TCA", 61000, 53100),
      p("Topicación de máculas actínicas", 67000, 58500),
      p("Peeling químico", 65000, 56700),
    ],
  },
  {
    id: "traumatologia",
    titulo: "Traumatología",
    especialidades: ["Traumatología"],
    practicas: [
      p("Infiltración", 67000, 58500),
      p("Extracción de yeso", 67000, 58500),
      p("Yeso bota corta", 77000, 67500),
      p("Yeso bota larga", 77000, 67500),
      p("Yeso antebraquial", 77000, 67500),
      p("Yeso braquiopalmar", 77000, 67500),
      p("Drenaje de hematoma o infección", 77000, 67500),
      p("Sutura de heridas", 77000, 67500),
      p("Uña encarnada", 92000, 81000),
      p("Plasma rico en plaquetas (PRP) articular", 202000, 180000),
    ],
  },
  {
    id: "flebologia",
    titulo: "Flebología",
    especialidades: ["Flebología"],
    practicas: [
      p("Escleroterapia, una pierna", 47000, 40500),
      p("Escleroterapia, ambas piernas", 82000, 72000),
      p("Láser, una pierna", 47000, 40500),
      p("Láser, ambas piernas", 82000, 72000),
    ],
  },
  {
    id: "otorrinolaringologia",
    titulo: "Otorrinolaringología",
    especialidades: ["Otorrinolaringología"],
    practicas: [
      p("Lavado de oído", 45000, 38700),
      p("Consulta + lavado de oído en el día", 57000, 49500),
      p("Cauterización", 45000, 38700),
      p("Rinofibrolaringoscopía", 72000, 63000),
      p("Corte de frenillo", 60000, 54000, "Sin beneficio LinkMed."),
      p("Corte de frenillo infantil", 90000, 89000, "Sin beneficio LinkMed."),
    ],
  },
  {
    id: "neumonologia",
    titulo: "Neumonología",
    especialidades: ["Neumonología"],
    practicas: [
      p("Espirometría informada (adultos)", 57000, 49500),
      p("Consulta + espirometría", 89000, 78300),
      p("Estudio de FeNO", 132000, 117000),
    ],
  },
  {
    id: "neurologia",
    titulo: "Neurología",
    especialidades: ["Neurología"],
    practicas: [
      p("Electroencefalograma simple", 52000, 45000),
      p("Electroencefalograma con activación", 62000, 54000),
      p("Electroencefalograma de sueño", 72000, 63000),
      p("Electroencefalograma de sueño prolongado", 82000, 72000),
    ],
  },
  {
    id: "oftalmologia",
    titulo: "Oftalmología",
    especialidades: ["Oftalmología"],
    practicas: [
      p("Fondo de ojo (ambos ojos)", 52000, 45000),
      p("Consulta + fondo de ojo", 72000, 63000),
      p("Oftalmoscopía binocular indirecta (OBI)", 52000, 45000),
      p("Tonometría", 32000, 27000),
    ],
  },
  {
    id: "alergia",
    titulo: "Alergia",
    especialidades: ["Alergista"],
    practicas: [
      p("Prick test de aeroalérgenos", 92000, 81000),
      p("Prick test de alimentos", 92000, 81000),
      p("Prick test de látex", 92000, 81000),
      p("Prick test de fluoresceína", 67000, 58500),
    ],
  },
  {
    id: "nutricion",
    titulo: "Nutrición",
    especialidades: ["Nutrición"],
    practicas: [p("Antropometría", 57000, 49500)],
  },
];

export const gruposDeEspecialidad = (nombre: string) => GRUPOS_PRECIOS.filter((g) => g.especialidades.includes(nombre));
