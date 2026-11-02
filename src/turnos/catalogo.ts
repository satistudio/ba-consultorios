// Catálogo del buscador de turnos de la home.
// Fuente: servicios de BA en AgendaPro (GET /api/public/v1/services, 2/11/2026),
// curado a mano. Quedan afuera a propósito: promos (no se publican), servicios
// "no usar" de la guía de marca (psiquiatría, psicopedagogía, sexología,
// ADOS/ADI-R, tests de CI, verrugas), ECG con nombre de profesional,
// laboratorio (va por orden) y duplicados. Los nombres son los de la web, no
// los de AgendaPro (que están en mayúsculas y con abreviaturas).
// Ecografías y Doppler: AgendaPro solo devuelve horarios pidiéndolos por el
// prestador "ECOGRAFIAS" (provider_id 82112), no por sucursal.

export interface ServicioTurno {
  id: string; // slug para /api/disponibilidad?item=
  nombre: string;
  claves: string; // palabras extra para el buscador
  service_id: number;
  provider_id?: number;
}

const ECO = 82112;

export const CATALOGO_TURNOS: ServicioTurno[] = [
  // Consultas
  { id: "alergia", nombre: "Alergia", claves: "alergista alergias", service_id: 2850616 },
  { id: "cardiologia", nombre: "Cardiología con electrocardiograma", claves: "cardio corazon ecg electro", service_id: 682555 },
  { id: "cardiologia-infantil", nombre: "Cardiología infantil (incluye ECG)", claves: "cardio niños chicos pediatrica", service_id: 701552 },
  { id: "cirugia-general", nombre: "Cirugía general", claves: "cirujano", service_id: 501442 },
  { id: "clinica-medica", nombre: "Clínica médica", claves: "clinico medico general", service_id: 216822 },
  { id: "dermatologia", nombre: "Dermatología", claves: "dermato piel", service_id: 216823 },
  { id: "dermatologia-infantil", nombre: "Dermatología infantil (hasta 15 años)", claves: "dermato piel niños chicos", service_id: 3076470 },
  { id: "diabetologia", nombre: "Diabetología", claves: "diabetes azucar", service_id: 239137 },
  { id: "endocrinologia", nombre: "Endocrinología", claves: "endocrino tiroides hormonas", service_id: 218454 },
  { id: "endocrinologia-infantil", nombre: "Endocrinología infantil", claves: "endocrino niños chicos", service_id: 3014877 },
  { id: "columna", nombre: "Especialista en columna", claves: "espalda columna lumbar", service_id: 3005946 },
  { id: "flebologia", nombre: "Flebología", claves: "flebologo varices venas piernas", service_id: 555866 },
  { id: "gastroenterologia", nombre: "Gastroenterología", claves: "gastro estomago digestivo", service_id: 641056 },
  { id: "ginecologia", nombre: "Ginecología", claves: "gineco ginecologa", service_id: 218457 },
  { id: "gineco-infanto-juvenil", nombre: "Ginecología infanto juvenil", claves: "gineco niñas adolescentes", service_id: 3078938 },
  { id: "hematologia", nombre: "Hematología", claves: "hemato sangre", service_id: 453810 },
  { id: "hepatologia", nombre: "Hepatología", claves: "higado", service_id: 613420 },
  { id: "infectologia", nombre: "Infectología", claves: "infecto infecciones", service_id: 724372 },
  { id: "kinesiologia", nombre: "Kinesiología (sesión)", claves: "kine kinesiologo rehabilitacion", service_id: 542073 },
  { id: "nefrologia", nombre: "Nefrología", claves: "nefro riñon", service_id: 2690377 },
  { id: "neumonologia", nombre: "Neumonología", claves: "neumo pulmon respiratorio", service_id: 698078 },
  { id: "neumonologia-infantil", nombre: "Neumonología infantil", claves: "neumo pulmon niños chicos", service_id: 502524 },
  { id: "neurologia", nombre: "Neurología", claves: "neuro neurologo", service_id: 218460 },
  { id: "neurologia-infantil", nombre: "Neurología infantil", claves: "neuro niños chicos", service_id: 641070 },
  { id: "nutricion", nombre: "Nutrición", claves: "nutricionista dieta peso", service_id: 218465 },
  { id: "obstetricia", nombre: "Obstetricia", claves: "obstetra embarazo", service_id: 471180 },
  { id: "oftalmologia", nombre: "Oftalmología", claves: "oftalmo ojos vista oculista", service_id: 223077 },
  { id: "otorrino", nombre: "Otorrinolaringología", claves: "otorrino oido nariz garganta", service_id: 223079 },
  { id: "pediatria", nombre: "Pediatría", claves: "pediatra niños chicos bebe", service_id: 223075 },
  { id: "podologia", nombre: "Podología", claves: "podologo pies uñas", service_id: 272526 },
  { id: "proctologia", nombre: "Proctología", claves: "procto", service_id: 2152768 },
  { id: "reumatologia", nombre: "Reumatología", claves: "reuma reumatologo articulaciones", service_id: 264399 },
  { id: "traumatologia", nombre: "Traumatología", claves: "traumato traumatologo huesos", service_id: 437362 },
  { id: "urologia", nombre: "Urología", claves: "urologo prostata", service_id: 223082 },
  // Estudios y prácticas
  { id: "pap-colpo", nombre: "PAP y colposcopía", claves: "papanicolau pap colpo gineco", service_id: 234961 },
  { id: "pap", nombre: "PAP (Papanicolau)", claves: "papanicolau gineco", service_id: 235068 },
  { id: "ergometria", nombre: "Ergometría", claves: "cardio esfuerzo", service_id: 682559 },
  { id: "holter", nombre: "Holter", claves: "cardio", service_id: 759279 },
  { id: "mapa", nombre: "MAPA o presurometría", claves: "presion cardio", service_id: 2838460 },
  { id: "ecocardiograma", nombre: "Ecocardiograma Doppler", claves: "eco cardio corazon ecodoppler", service_id: 2335573 },
  { id: "espirometria", nombre: "Espirometría", claves: "pulmon respiratorio neumo", service_id: 511199 },
  { id: "eeg", nombre: "Electroencefalograma", claves: "eeg neuro", service_id: 641063 },
  { id: "fondo-de-ojo", nombre: "Fondo de ojo", claves: "ojos oftalmo", service_id: 441698 },
  { id: "eco-tv", nombre: "Ecografía ginecológica o transvaginal", claves: "eco transvaginal tv gineco", service_id: 244881, provider_id: ECO },
  { id: "eco-mamaria", nombre: "Ecografía mamaria", claves: "eco mamas pechos", service_id: 244882, provider_id: ECO },
  { id: "eco-abdominal", nombre: "Ecografía abdominal", claves: "eco abdomen panza", service_id: 932051, provider_id: ECO },
  { id: "eco-obstetrica", nombre: "Ecografía obstétrica", claves: "eco embarazo bebe", service_id: 244884, provider_id: ECO },
  { id: "eco-renal", nombre: "Ecografía renal", claves: "eco riñon", service_id: 244886, provider_id: ECO },
  { id: "eco-tiroides", nombre: "Ecografía de tiroides", claves: "eco tiroidea", service_id: 244887, provider_id: ECO },
  { id: "eco-hepatobiliar", nombre: "Ecografía hepatobiliar", claves: "eco higado vesicula", service_id: 1087348, provider_id: ECO },
  { id: "eco-articular", nombre: "Ecografía articular", claves: "eco rodilla hombro mano codo pie", service_id: 907974, provider_id: ECO },
  { id: "eco-rvp", nombre: "Ecografía reno-vésico-prostática", claves: "eco prostata riñon vejiga", service_id: 250855, provider_id: ECO },
  { id: "doppler-miembros", nombre: "Doppler venoso o arterial de miembros", claves: "eco doppler piernas brazos venas varices", service_id: 924549, provider_id: ECO },
  { id: "mamografia", nombre: "Mamografía", claves: "mamas pechos", service_id: 254779 },
  { id: "prick", nombre: "Prick test (aeroalérgenos)", claves: "alergia test", service_id: 1527460 },
  { id: "peeling", nombre: "Peeling químico", claves: "dermato piel", service_id: 2943633 },
  { id: "lavaje-oidos", nombre: "Lavaje de oídos", claves: "oido otorrino", service_id: 235095 },
  { id: "diu", nombre: "Colocación de DIU", claves: "gineco anticonceptivo", service_id: 235071 },
];
