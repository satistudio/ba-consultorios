// Catálogo del buscador de turnos de la home.
// Fuente: los 203 servicios de BA en AgendaPro (GET /api/public/v1/services,
// revisado completo el 2/11/2026). Entra todo lo que se reserva, salvo:
//  - promos (no se publican) y "ECOGRAFIAS $25.000",
//  - "no usar" de la guía de marca: psiquiatría, psicopedagogía, sexología,
//    ADOS/ADI-R, tests de CI o neurocognitivos, verrugas/acrocordón,
//  - ECG con nombre de profesional, laboratorio (va por orden),
//  - psicología (no está en la web), seriada gastroduodenal, espinograma,
//    "ecografía especial", "Clínica de Tone", prick con fluoresceína,
//  - duplicados: Neurología 2022987, Flebología 15', Ecodoppler cardíaco
//    443521, Doppler 236656 y 924558, "+ lavaje de oídos (diferencia)".
// Las prácticas que suele indicar el médico (biopsias, drenajes, yeso, etc.)
// están en PRACTICAS_TURNOS y solo se muestran con MOSTRAR_PRACTICAS = true.
// Los nombres son los de la web, no los de AgendaPro (que están en mayúsculas
// y con abreviaturas).
// Ecografías y Doppler: AgendaPro solo devuelve horarios pidiéndolos por el
// prestador "ECOGRAFIAS" (provider_id 82112), no por sucursal. Ojo: con
// provider_id AgendaPro devuelve la agenda del prestador sin validar el
// servicio, así que provider_id va SOLO en ecografías y Doppler que por
// sucursal dan "No Available Providers". El resto va por sucursal: si da ese
// error (ej. mamografía), el buscador muestra "Escribinos por WhatsApp".

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
  { id: "cardiologia-sin-ecg", nombre: "Cardiología (consulta sin electrocardiograma)", claves: "cardio corazon", service_id: 524838 },
  { id: "apto-fisico-egresados", nombre: "Apto físico para egresados (estudiantes)", claves: "apto fisico viaje egresados colegio escuela cardio", service_id: 2881449 },
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
  { id: "gastroenterologia-infantil", nombre: "Gastroenterología infantil", claves: "gastro estomago digestivo niños chicos pediatrica", service_id: 3150332 },
  { id: "ginecologia", nombre: "Ginecología", claves: "gineco ginecologa", service_id: 218457 },
  { id: "gineco-infanto-juvenil", nombre: "Ginecología infanto juvenil", claves: "gineco niñas adolescentes", service_id: 3078938 },
  { id: "hematologia", nombre: "Hematología", claves: "hemato sangre", service_id: 453810 },
  { id: "hepatologia", nombre: "Hepatología", claves: "higado", service_id: 613420 },
  { id: "infectologia", nombre: "Infectología", claves: "infecto infecciones", service_id: 724372 },
  { id: "kinesiologia", nombre: "Kinesiología (sesión)", claves: "kine kinesiologo rehabilitacion", service_id: 542073 },
  { id: "nefrologia", nombre: "Nefrología", claves: "nefro riñon", service_id: 2690377 },
  { id: "neumonologia", nombre: "Neumonología", claves: "neumo pulmon respiratorio", service_id: 698078 },
  { id: "neumonologia-espirometria", nombre: "Neumonología con espirometría", claves: "neumo pulmon respiratorio espiro", service_id: 2842409 },
  { id: "neumonologia-infantil", nombre: "Neumonología infantil", claves: "neumo pulmon niños chicos", service_id: 502524 },
  { id: "neurologia", nombre: "Neurología", claves: "neuro neurologo", service_id: 218460 },
  { id: "neurologia-infantil", nombre: "Neurología infantil", claves: "neuro niños chicos", service_id: 641070 },
  { id: "nutricion", nombre: "Nutrición", claves: "nutricionista dieta peso", service_id: 218465 },
  { id: "obstetricia", nombre: "Obstetricia", claves: "obstetra embarazo", service_id: 471180 },
  { id: "oftalmologia", nombre: "Oftalmología", claves: "oftalmo ojos vista oculista", service_id: 223077 },
  { id: "oftalmologia-fondo-de-ojo", nombre: "Oftalmología con fondo de ojo", claves: "oftalmo ojos vista oculista", service_id: 238286 },
  { id: "otorrino", nombre: "Otorrinolaringología", claves: "otorrino oido nariz garganta", service_id: 223079 },
  { id: "otorrino-lavaje", nombre: "Otorrinolaringología con lavaje de oídos", claves: "otorrino oido tapon cera", service_id: 1412121 },
  { id: "pediatria", nombre: "Pediatría", claves: "pediatra niños chicos bebe", service_id: 223075 },
  { id: "podologia", nombre: "Podología", claves: "podologo pies uñas", service_id: 272526 },
  { id: "proctologia", nombre: "Proctología", claves: "procto", service_id: 2152768 },
  { id: "reumatologia", nombre: "Reumatología", claves: "reuma reumatologo articulaciones", service_id: 264399 },
  { id: "traumatologia", nombre: "Traumatología", claves: "traumato traumatologo huesos", service_id: 437362 },
  { id: "urologia", nombre: "Urología", claves: "urologo prostata", service_id: 223082 },
  // Teleconsultas (la guía de marca: "en todas las especialidades")
  { id: "tele-clinica", nombre: "Teleconsulta de clínica médica", claves: "telemedicina online virtual videollamada clinico", service_id: 2051727 },
  { id: "tele-pediatria", nombre: "Teleconsulta de pediatría", claves: "telemedicina online virtual videollamada pediatra niños", service_id: 2051736 },
  { id: "tele-ginecologia", nombre: "Teleconsulta de ginecología", claves: "telemedicina online virtual videollamada gineco", service_id: 2051763 },
  { id: "tele-dermatologia", nombre: "Teleconsulta de dermatología", claves: "telemedicina online virtual videollamada dermato piel", service_id: 2051741 },
  { id: "tele-cardiologia", nombre: "Teleconsulta de cardiología", claves: "telemedicina online virtual videollamada cardio", service_id: 2051768 },
  { id: "tele-endocrinologia", nombre: "Teleconsulta de endocrinología", claves: "telemedicina online virtual videollamada endocrino", service_id: 2484411 },
  { id: "tele-endo-diabetologia", nombre: "Teleconsulta de endocrinología o diabetología", claves: "telemedicina online virtual videollamada endocrino diabetes", service_id: 2051783 },
  { id: "tele-urologia", nombre: "Teleconsulta de urología", claves: "telemedicina online virtual videollamada urologo", service_id: 2051774 },
  { id: "tele-alergia", nombre: "Teleconsulta de alergia", claves: "telemedicina online virtual videollamada alergista", service_id: 1516605 },
  { id: "tele-traumatologia", nombre: "Teleconsulta de traumatología", claves: "telemedicina online virtual videollamada traumato", service_id: 2053869 },
  { id: "tele-neurologia", nombre: "Teleconsulta de neurología", claves: "telemedicina online virtual videollamada neuro", service_id: 2051745 },
  { id: "tele-infectologia", nombre: "Teleconsulta de infectología", claves: "telemedicina online virtual videollamada infecto", service_id: 2051753 },
  // Estudios y prácticas
  { id: "pap-colpo", nombre: "PAP y colposcopía", claves: "papanicolau pap colpo gineco", service_id: 234961 },
  { id: "pap", nombre: "PAP (Papanicolau)", claves: "papanicolau gineco", service_id: 235068 },
  { id: "colposcopia", nombre: "Colposcopía", claves: "colpo gineco", service_id: 235067 },
  { id: "ergometria", nombre: "Ergometría", claves: "cardio esfuerzo", service_id: 682559 },
  { id: "holter", nombre: "Holter", claves: "cardio", service_id: 759279 },
  { id: "mapa", nombre: "MAPA o presurometría", claves: "presion cardio", service_id: 2838460 },
  { id: "ecocardiograma", nombre: "Ecocardiograma Doppler", claves: "eco cardio corazon ecodoppler", service_id: 2335573 },
  { id: "espirometria", nombre: "Espirometría", claves: "pulmon respiratorio neumo", service_id: 511199 },
  { id: "eeg", nombre: "Electroencefalograma", claves: "eeg neuro", service_id: 641063 },
  { id: "eeg-activacion", nombre: "Electroencefalograma con activación", claves: "eeg neuro", service_id: 641065 },
  { id: "eeg-sueno", nombre: "Electroencefalograma de sueño", claves: "eeg neuro dormir", service_id: 2506853 },
  { id: "eeg-sueno-prolongado", nombre: "Electroencefalograma de sueño prolongado", claves: "eeg neuro dormir", service_id: 525844 },
  { id: "estudio-feno", nombre: "Estudio de FeNO (desde 5 años)", claves: "feno asma pulmon respiratorio neumo alergia", service_id: 3079674 },
  { id: "rinofibrolaringoscopia", nombre: "Rinofibrolaringoscopía", claves: "fibrolaringo fibro nasal laringe otorrino nariz garganta", service_id: 235093 },
  { id: "fondo-de-ojo", nombre: "Fondo de ojo", claves: "ojos oftalmo", service_id: 441698 },
  { id: "tonometria", nombre: "Tonometría (presión ocular)", claves: "ojos oftalmo presion glaucoma", service_id: 3020505 },
  // OBI: nombre provisorio hasta que BA confirme qué es (está en Oftalmología).
  { id: "obi", nombre: "OBI (oftalmología)", claves: "ojos oftalmo", service_id: 235712 },
  { id: "control-visual", nombre: "Control visual", claves: "ojos vista anteojos lentes optica", service_id: 1171937 },
  { id: "control-visual-infantil", nombre: "Control visual infantil", claves: "ojos vista anteojos lentes optica niños chicos", service_id: 1388306 },
  { id: "pedigrafia", nombre: "Pedigrafía (incluye plantillas)", claves: "pies plantillas ortopedia podologia pisada", service_id: 3036962 },
  { id: "antropometria", nombre: "Antropometría (evaluación corporal)", claves: "nutricion peso composicion corporal", service_id: 1048494 },
  { id: "monitoreo-fetal", nombre: "Monitoreo fetal", claves: "embarazo bebe obstetricia", service_id: 235007 },
  { id: "eco-tv", nombre: "Ecografía ginecológica o transvaginal", claves: "eco transvaginal tv gineco", service_id: 244883, provider_id: ECO },
  { id: "eco-mamaria", nombre: "Ecografía mamaria", claves: "eco mamas pechos", service_id: 244882, provider_id: ECO },
  { id: "eco-abdominal", nombre: "Ecografía abdominal", claves: "eco abdomen panza", service_id: 932051, provider_id: ECO },
  { id: "eco-obstetrica", nombre: "Ecografía obstétrica", claves: "eco embarazo bebe", service_id: 244884, provider_id: ECO },
  { id: "eco-renal", nombre: "Ecografía renal", claves: "eco riñon", service_id: 244886, provider_id: ECO },
  { id: "eco-tiroides", nombre: "Ecografía de tiroides", claves: "eco tiroidea", service_id: 244887, provider_id: ECO },
  { id: "eco-hepatobiliar", nombre: "Ecografía hepatobiliar", claves: "eco higado vesicula", service_id: 1087348, provider_id: ECO },
  { id: "eco-articular", nombre: "Ecografía articular", claves: "eco rodilla hombro mano codo pie", service_id: 907974, provider_id: ECO },
  { id: "eco-rvp", nombre: "Ecografía reno-vésico-prostática", claves: "eco prostata riñon vejiga", service_id: 250855, provider_id: ECO },
  { id: "eco-vesicula", nombre: "Ecografía de vesícula", claves: "eco vesicula biliar", service_id: 1087345, provider_id: ECO },
  { id: "eco-renal-vesical", nombre: "Ecografía renal y vesical", claves: "eco riñon vejiga", service_id: 516094, provider_id: ECO },
  { id: "eco-vesico-prostatica", nombre: "Ecografía vésico-prostática", claves: "eco prostata vejiga", service_id: 973487, provider_id: ECO },
  { id: "eco-pleural", nombre: "Ecografía pleural", claves: "eco pulmon pleura", service_id: 2148692, provider_id: ECO },
  { id: "eco-cerebral-pediatrica", nombre: "Ecografía cerebral pediátrica", claves: "eco cerebro bebe niños transfontanelar", service_id: 825299, provider_id: ECO },
  { id: "eco-obstetrica-tn", nombre: "Ecografía obstétrica con translucencia nucal (TN) o scan", claves: "eco embarazo bebe tn scan morfologica", service_id: 2148706, provider_id: ECO },
  { id: "eco-obstetrica-doppler", nombre: "Ecografía obstétrica con Doppler obstétrico", claves: "eco embarazo bebe doppler", service_id: 878551, provider_id: ECO },
  { id: "doppler-miembros", nombre: "Doppler venoso o arterial de miembros", claves: "eco doppler piernas brazos venas varices", service_id: 924549, provider_id: ECO },
  { id: "doppler-miembros-ambos", nombre: "Doppler venoso y arterial de miembros", claves: "eco doppler piernas brazos venas arterias varices", service_id: 236657 },
  { id: "doppler-obstetrico", nombre: "Doppler fetal u obstétrico", claves: "eco doppler embarazo bebe", service_id: 267272, provider_id: ECO },
  { id: "doppler-arterias-uterinas", nombre: "Doppler de arterias uterinas", claves: "eco doppler embarazo utero", service_id: 2773746, provider_id: ECO },
  { id: "doppler-obstetrico-uterinas", nombre: "Doppler obstétrico y de arterias uterinas", claves: "eco doppler embarazo bebe utero", service_id: 825314, provider_id: ECO },
  { id: "tn-doppler-obstetrico", nombre: "Translucencia nucal (TN) o scan con Doppler obstétrico", claves: "eco doppler embarazo bebe tn scan", service_id: 1674657, provider_id: ECO },
  { id: "tn-uterinas", nombre: "Translucencia nucal (TN) o scan con arterias uterinas", claves: "eco doppler embarazo bebe tn scan utero", service_id: 241885, provider_id: ECO },
  { id: "doppler-obstetrico-uterinas-tn", nombre: "Doppler obstétrico, arterias uterinas y TN o scan", claves: "eco doppler embarazo bebe tn scan utero", service_id: 1666194, provider_id: ECO },
  { id: "doppler-ginecologico", nombre: "Doppler ginecológico o transvaginal", claves: "eco doppler gineco transvaginal tv", service_id: 684383, provider_id: ECO },
  { id: "doppler-mamario", nombre: "Doppler mamario", claves: "eco doppler mamas pechos", service_id: 235907, provider_id: ECO },
  { id: "doppler-tiroideo", nombre: "Doppler tiroideo", claves: "eco doppler tiroides", service_id: 257915, provider_id: ECO },
  { id: "doppler-renal", nombre: "Doppler renal", claves: "eco doppler riñon", service_id: 236658, provider_id: ECO },
  { id: "doppler-arterias-renales", nombre: "Doppler de arterias renales", claves: "eco doppler riñon", service_id: 1679337 },
  { id: "doppler-abdominal", nombre: "Doppler abdominal", claves: "eco doppler abdomen panza", service_id: 236660, provider_id: ECO },
  { id: "doppler-aorta", nombre: "Doppler de aorta abdominal", claves: "eco doppler abdomen aorta", service_id: 1161749 },
  { id: "doppler-espleno-portal", nombre: "Doppler espleno-portal", claves: "eco doppler higado bazo portal", service_id: 1087355, provider_id: ECO },
  { id: "doppler-vasos-cuello", nombre: "Doppler de vasos de cuello", claves: "eco doppler cuello carotidas", service_id: 686110 },
  { id: "doppler-testicular", nombre: "Doppler testicular", claves: "eco doppler testiculos", service_id: 280454, provider_id: ECO },
  { id: "doppler-partes-blandas", nombre: "Doppler de partes blandas", claves: "eco doppler", service_id: 241878, provider_id: ECO },
  { id: "doppler-articular", nombre: "Doppler articular con power", claves: "eco doppler rodilla hombro articulacion", service_id: 1143451, provider_id: ECO },
  { id: "mamografia", nombre: "Mamografía", claves: "mamas pechos", service_id: 254779 },
  { id: "prick", nombre: "Prick test (aeroalérgenos)", claves: "alergia test", service_id: 1527460 },
  { id: "prick-alimentos", nombre: "Prick test (alimentos)", claves: "alergia test comida", service_id: 1527463 },
  { id: "prick-latex", nombre: "Prick test (látex)", claves: "alergia test latex", service_id: 1527467 },
  { id: "peeling", nombre: "Peeling químico", claves: "dermato piel", service_id: 2943633 },
  { id: "lavaje-oidos", nombre: "Lavaje de oídos", claves: "oido otorrino", service_id: 235095 },
  { id: "diu", nombre: "Colocación de DIU", claves: "gineco anticonceptivo", service_id: 235071 },
];

// Prácticas que suele indicar el médico en consulta. Están cargadas pero NO se
// muestran hasta que BA confirme que el paciente las puede reservar solo.
export const MOSTRAR_PRACTICAS = false;

export const PRACTICAS_TURNOS: ServicioTurno[] = [
  // Ginecología
  { id: "extraccion-diu", nombre: "Extracción de DIU", claves: "gineco anticonceptivo", service_id: 235070 },
  { id: "recambio-diu", nombre: "Extracción y colocación de DIU en el día", claves: "gineco anticonceptivo recambio", service_id: 480998 },
  { id: "colocacion-chip", nombre: "Colocación de implante anticonceptivo (chip)", claves: "gineco anticonceptivo chip implante", service_id: 3026900 },
  { id: "extraccion-chip", nombre: "Extracción de implante anticonceptivo (chip)", claves: "gineco anticonceptivo chip implante", service_id: 526589 },
  { id: "biopsia-cuello", nombre: "Biopsia de cuello uterino o polipectomía", claves: "gineco cervix polipo", service_id: 235075 },
  { id: "biopsia-endometrio", nombre: "Biopsia de endometrio", claves: "gineco utero", service_id: 235079 },
  { id: "biopsia-vaginal", nombre: "Biopsia vaginal", claves: "gineco", service_id: 235083 },
  { id: "cepillado-endocervical", nombre: "Cepillado o legrado endocervical", claves: "gineco", service_id: 235077 },
  { id: "topicacion-gineco", nombre: "Topicación ginecológica", claves: "gineco", service_id: 235072 },
  { id: "drenaje-bartolino", nombre: "Drenaje de glándula de Bartolino", claves: "gineco quiste", service_id: 1783061 },
  { id: "lesion-vulvar", nombre: "Extracción de lesión vulvar", claves: "gineco", service_id: 3009933 },
  // Dermatología
  { id: "biopsia-dermica", nombre: "Biopsia de piel", claves: "dermato piel lunar", service_id: 441648 },
  { id: "quiste-sebaceo", nombre: "Extracción de quiste sebáceo", claves: "dermato piel", service_id: 1554222 },
  { id: "quiste-milium", nombre: "Extracción de quiste milium", claves: "dermato piel", service_id: 1554215 },
  { id: "escision-local", nombre: "Escisión local de lesión de piel", claves: "dermato piel lunar", service_id: 1554220 },
  { id: "drenaje-dermato", nombre: "Drenaje (dermatología)", claves: "dermato piel absceso forunculo", service_id: 1554219 },
  { id: "curetaje-escara", nombre: "Curetaje de escara", claves: "dermato piel", service_id: 1554218 },
  { id: "curetaje-molusco", nombre: "Curetaje de molusco", claves: "dermato piel niños", service_id: 2943756 },
  { id: "electrocoagulacion", nombre: "Electrocoagulación", claves: "dermato piel", service_id: 2155223 },
  { id: "topicacion-dermato", nombre: "Topicación (dermatología)", claves: "dermato piel", service_id: 235118 },
  { id: "topicacion-maculas", nombre: "Topicación de máculas actínicas", claves: "dermato piel manchas sol", service_id: 3009914 },
  { id: "infiltracion-dermato", nombre: "Infiltración (dermatología)", claves: "dermato piel", service_id: 957131 },
  // Traumatología
  { id: "yeso", nombre: "Colocación de yeso", claves: "traumato fractura", service_id: 235100 },
  { id: "extraccion-yeso", nombre: "Extracción de yeso", claves: "traumato fractura", service_id: 235102 },
  { id: "bota", nombre: "Bota de yeso", claves: "traumato fractura pie tobillo", service_id: 235103 },
  { id: "calza", nombre: "Calza de yeso", claves: "traumato fractura", service_id: 235105 },
  { id: "infiltracion-trauma", nombre: "Infiltración (traumatología)", claves: "traumato articulacion", service_id: 235106 },
  { id: "drenaje-hematoma", nombre: "Drenaje de hematoma", claves: "traumato golpe", service_id: 235109 },
  { id: "prp-articular", nombre: "PRP articular (plasma rico en plaquetas)", claves: "traumato rodilla articulacion plasma", service_id: 2713894 },
  { id: "sutura", nombre: "Sutura de heridas", claves: "puntos corte herida", service_id: 3010009 },
  { id: "una-encarnada", nombre: "Uña encarnada", claves: "pie uña", service_id: 972908 },
  // Urología
  { id: "biopsia-uro", nombre: "Biopsia (urología)", claves: "urologo", service_id: 441623 },
  { id: "drenaje-abscesos", nombre: "Drenaje de abscesos", claves: "urologo", service_id: 441626 },
  { id: "cuerpo-extrano", nombre: "Extracción de cuerpo extraño", claves: "urologo", service_id: 441630 },
  { id: "frenulectomia", nombre: "Frenulectomía", claves: "urologo frenillo", service_id: 441633 },
  { id: "topicacion-uro", nombre: "Topicación urológica", claves: "urologo", service_id: 580001 },
  { id: "penescopia", nombre: "Penescopía", claves: "urologo", service_id: 580003 },
  { id: "cambio-sonda", nombre: "Cambio de sonda", claves: "urologo sonda vesical", service_id: 580005 },
  { id: "recambio-sonda", nombre: "Recambio o colocación de sonda", claves: "urologo sonda vesical", service_id: 916471 },
  // Otorrino y flebología
  { id: "cauterizacion", nombre: "Cauterización (otorrinolaringología)", claves: "otorrino nariz", service_id: 247226 },
  { id: "escleroterapia-una", nombre: "Escleroterapia (una pierna)", claves: "flebologia varices venas", service_id: 567159 },
  { id: "escleroterapia-ambas", nombre: "Escleroterapia (ambas piernas)", claves: "flebologia varices venas", service_id: 2480575 },
  { id: "laser-una", nombre: "Láser de várices (una pierna)", claves: "flebologia varices venas", service_id: 2480574 },
  { id: "laser-ambas", nombre: "Láser de várices (ambas piernas)", claves: "flebologia varices venas", service_id: 2480576 },
];

// Lo que el buscador ofrece y lo único que /api/disponibilidad acepta.
export const BUSCABLES: ServicioTurno[] = MOSTRAR_PRACTICAS ? [...CATALOGO_TURNOS, ...PRACTICAS_TURNOS] : CATALOGO_TURNOS;
