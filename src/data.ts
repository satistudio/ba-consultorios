export interface MedicalService {
  id: string;
  name: string;
  specialty: string;
  type: 'Consulta' | 'Estudio realizado en BA' | 'Práctica o procedimiento' | 'Estudio derivado';
  details?: string;
}

export const BRAND_INFO = {
  name: "BA Consultorios Médicos",
  instagramUrl: "https://www.instagram.com/baconsultoriosmedicos",
  instagramHandle: "@baconsultoriosmedicos",
  address: "Almafuerte 3558, San Justo, La Matanza",
  phone: "3970-1945",
  whatsapp: "+54 9 11 6434-4822",
  whatsappUrl: "https://wa.me/5491164344822?text=Hola!%20Quiero%20pedir%20un%20turno%20en%20BA%20Consultorios%20M%C3%A9dicos.",
  schedule: "Lunes a Viernes de 8:00 a 20:00 hs, Sábados de 8:00 a 14:00 hs",
  agendaProIframeSrc: "https://agendapro.com/iframe/overview/NWlhUllReEQ2S3gyUXltTVBsNndVUT09LS03QVVJN0dNS0ZGcmtaN0crc24wRlZnPT0=--816a9932b62c947e777333b5346348291a85a97b",
  agendaProUrl: "https://baconsultorios.agendapro.com/ar"
};

export const SPECIALTIES: string[] = [
  "Alergista",
  "Cardiología",
  "Cardiología infantil",
  "Cirugía general",
  "Cirugía plástica",
  "Clínica médica",
  "Dermatología",
  "Diabetología",
  "Endocrinología de adultos",
  "Fertilidad",
  "Flebología",
  "Gastroenterología",
  "Ginecología",
  "Hematología",
  "Hepatología",
  "Infectología",
  "Kinesiología",
  "Neumonología",
  "Neumonología infantil",
  "Neurología",
  "Neurología infantil",
  "Nutrición",
  "Obstetricia",
  "Oftalmología",
  "Otorrinolaringología",
  "Pediatría",
  "Proctología",
  "Psiquiatría de adultos",
  "Reumatología",
  "Traumatología",
  "Urología",
  "Psicopedagogía",
  "Podología",
  "Cosmiatría y estética",
  "Audiometría y estudios auditivos"
];

export const SERVICES_DATA: MedicalService[] = [
  // 1. Cardiología y cardiología infantil
  { id: "c-1", name: "Electrocardiograma", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-2", name: "Consulta cardiológica con electrocardiograma", specialty: "Cardiología", type: "Consulta" },
  { id: "c-3", name: "Apto físico con evaluación cardiológica", specialty: "Cardiología", type: "Práctica o procedimiento" },
  { id: "c-4", name: "Ecocardiograma o ecodoppler cardíaco", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-5", name: "Ergometría", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-6", name: "Informe de ergometría", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-7", name: "Holter", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-8", name: "MAPA o presurometría", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-9", name: "Doppler de vasos del cuello", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-10", name: "Doppler de arterias renales", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-11", name: "Doppler arterial de miembros", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-12", name: "Doppler venoso de miembros", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-13", name: "Doppler arterial y venoso de ambos miembros", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "c-14", name: "Cardiología infantil con electrocardiograma incluido", specialty: "Cardiología infantil", type: "Consulta" },

  // 2. Ecografías generales
  { id: "e-1", name: "Ecografía abdominal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-2", name: "Ecografía hepatobiliopancreática", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-3", name: "Ecografía pleural", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-4", name: "Ecografía renal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-5", name: "Ecografía vesical", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-6", name: "Ecografía renovesical (con o sin residuo posmiccional)", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-7", name: "Ecografía renovesicoprostática", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-8", name: "Ecografía vesicoprostática (con o sin residuo posmiccional)", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-9", name: "Ecografía prostática", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-10", name: "Ecografía pelviana", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-11", name: "Ecografía transvaginal", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "e-12", name: "Ecografía mamaria", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "e-13", name: "Ecografía tiroidea", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-14", name: "Ecografía testicular", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-15", name: "Ecografía peneana", specialty: "Urología", type: "Estudio realizado en BA" },
  { id: "e-16", name: "Ecografía de partes blandas", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-17", name: "Ecografía de pared abdominal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-18", name: "Ecografía inguinal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "e-19", name: "Ecografía articular (mano, codo, rodilla, hombro o pie)", specialty: "Traumatología", type: "Estudio realizado en BA" },
  { id: "e-20", name: "Ecografía de cadera pediátrica", specialty: "Pediatría", type: "Estudio realizado en BA" },
  { id: "e-21", name: "Ecografía cerebral", specialty: "Neurología", type: "Estudio realizado en BA" },

  // 3. Estudios Doppler
  { id: "d-1", name: "Doppler abdominal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-2", name: "Doppler de aorta abdominal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-3", name: "Doppler esplenoportal", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-4", name: "Doppler renal o de arterias renales", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-5", name: "Doppler mamario", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "d-6", name: "Doppler ginecológico o transvaginal", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "d-7", name: "Doppler tiroideo", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-8", name: "Doppler testicular", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-9", name: "Doppler peneano", specialty: "Urología", type: "Estudio realizado en BA" },
  { id: "d-10", name: "Doppler de partes blandas", specialty: "Ecografía", type: "Estudio realizado en BA" },
  { id: "d-11", name: "Doppler de vasos del cuello", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "d-12", name: "Doppler arterial de miembros inferiores o superiores", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "d-13", name: "Doppler venoso de miembros inferiores o superiores", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "d-14", name: "Doppler arterial y venoso de ambos miembros", specialty: "Cardiología", type: "Estudio realizado en BA" },
  { id: "d-15", name: "Doppler articular con Power Doppler", specialty: "Traumatología", type: "Estudio realizado en BA" },

  // 4. Obstetricia
  { id: "o-1", name: "Ecografía obstétrica", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-2", name: "Ecografía obstétrica 5D", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-3", name: "Ecografía obstétrica gemelar", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-4", name: "Translucencia nucal o scan fetal", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-5", name: "Ecografía obstétrica más translucencia nucal o scan", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-6", name: "Ecografía obstétrica gemelar más translucencia nucal o scan", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-7", name: "Ecografía obstétrica más Doppler obstétrico", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-8", name: "Ecografía obstétrica gemelar más Doppler obstétrico", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-9", name: "Doppler obstétrico o fetal", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-10", name: "Doppler obstétrico gemelar", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-11", name: "Doppler obstétrico más arterias uterinas", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-12", name: "Doppler obstétrico más translucencia nucal o scan fetal", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-13", name: "Doppler obstétrico más scan fetal y arterias uterinas", specialty: "Obstetricia", type: "Estudio realizado en BA" },
  { id: "o-14", name: "Translucencia nucal o scan más arterias uterinas", specialty: "Obstetricia", type: "Estudio realizado en BA" },

  // 5. Ginecología y fertilidad
  { id: "g-1", name: "PAP (Papanicolau)", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "g-2", name: "Colposcopía", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "g-3", name: "PAP y colposcopía combinados", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "g-4", name: "Biopsia cervical", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-5", name: "Biopsia de endometrio", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-6", name: "Legrado endometrial", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-7", name: "Cepillado endometrial", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-8", name: "Drenaje de glándula de Bartolino", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-9", name: "Topicaciones ginecológicas", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-10", name: "Extracción de DIU", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-11", name: "Colocación de DIU", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-12", name: "DIU más colocación", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-13", name: "Extracción y colocación de DIU en el día", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-14", name: "Extracción de implante anticonceptivo o chip", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-15", name: "Extracción de lesión vulvar", specialty: "Ginecología", type: "Práctica o procedimiento" },
  { id: "g-16", name: "Mamografía", specialty: "Ginecología", type: "Estudio realizado en BA" },

  // 6. Neumonología
  { id: "n-1", name: "Espirometría pediátrica (desde los 5 años)", specialty: "Neumonología", type: "Estudio realizado en BA" },
  { id: "n-2", name: "Espirometría pediátrica sin informe", specialty: "Neumonología", type: "Estudio realizado en BA" },
  { id: "n-3", name: "Espirometría pediátrica informada", specialty: "Neumonología", type: "Estudio realizado en BA" },
  { id: "n-4", name: "Espirometría informada para adultos", specialty: "Neumonología", type: "Estudio realizado en BA" },

  // 7. Neurología
  { id: "neu-1", name: "Electroencefalograma simple", specialty: "Neurología", type: "Estudio realizado en BA" },
  { id: "neu-2", name: "Electroencefalograma de sueño", specialty: "Neurología", type: "Estudio realizado en BA" },
  { id: "neu-3", name: "Electroencefalograma de sueño prolongado", specialty: "Neurología", type: "Estudio realizado en BA" },
  { id: "neu-4", name: "Electroencefalograma con activación", specialty: "Neurología", type: "Estudio realizado en BA" },

  // 8. Oftalmología
  { id: "of-1", name: "Fondo de ojo bilateral", specialty: "Oftalmología", type: "Estudio realizado en BA" },
  { id: "of-2", name: "Consulta oftalmológica más fondo de ojo", specialty: "Oftalmología", type: "Consulta" },
  { id: "of-3", name: "Oftalmoscopía binocular indirecta (OBI)", specialty: "Oftalmología", type: "Estudio realizado en BA" },
  { id: "of-4", name: "Control visual", specialty: "Oftalmología", type: "Consulta" },
  { id: "of-5", name: "Fondo de ojo pediátrico", specialty: "Oftalmología", type: "Estudio realizado en BA" },

  // 9. Otorrinolaringología
  { id: "ot-1", name: "Lavado o lavaje de oído", specialty: "Otorrinolaringología", type: "Práctica o procedimiento" },
  { id: "ot-2", name: "Consulta más lavado de oído en el día", specialty: "Otorrinolaringología", type: "Consulta" },
  { id: "ot-3", name: "Cauterización nasal", specialty: "Otorrinolaringología", type: "Práctica o procedimiento" },
  { id: "ot-4", name: "Extracción de cuerpo extraño", specialty: "Otorrinolaringología", type: "Práctica o procedimiento" },
  { id: "ot-5", name: "Corte de frenillo", specialty: "Otorrinolaringología", type: "Práctica o procedimiento" },

  // 10. Audiología (Audiometría y estudios auditivos)
  { id: "au-1", name: "Audiometría", specialty: "Audiometría y estudios auditivos", type: "Estudio realizado en BA" },
  { id: "au-2", name: "Logoaudiometría", specialty: "Audiometría y estudios auditivos", type: "Estudio realizado en BA" },
  { id: "au-3", name: "Timpanometría", specialty: "Audiometría y estudios auditivos", type: "Estudio realizado en BA" },
  { id: "au-4", name: "Acufenometría", specialty: "Audiometría y estudios auditivos", type: "Estudio realizado en BA" },
  { id: "au-5", name: "Impedanciometría", specialty: "Audiometría y estudios auditivos", type: "Estudio realizado en BA" },

  // 11. Alergia
  { id: "al-1", name: "Prick test para aeroalérgenos", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-2", name: "Prick test para alimentos", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-3", name: "Prick test para látex", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-4", name: "Prick test para himenópteros e insectos", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-5", name: "Prick test para fluoresceína", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-6", name: "Prick test para penicilina", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-7", name: "Test de parche", specialty: "Alergista", type: "Práctica o procedimiento" },
  { id: "al-8", name: "Valoración de riesgo alérgico para medios de contraste", specialty: "Alergista", type: "Práctica o procedimiento" },

  // 12. Urología
  { id: "ur-1", name: "Penescopía", specialty: "Urología", type: "Estudio realizado en BA" },
  { id: "ur-2", name: "Recambio de sonda vesical", specialty: "Urología", type: "Práctica o procedimiento" },
  { id: "ur-3", name: "Extracción de sonda vesical", specialty: "Urología", type: "Práctica o procedimiento" },
  { id: "ur-4", name: "Colocación de sonda vesical", specialty: "Urología", type: "Práctica o procedimiento" },
  { id: "ur-5", name: "Topicaciones uretrales", specialty: "Urología", type: "Práctica o procedimiento" },
  { id: "ur-6", name: "Electrofulguración de verrugas por HPV", specialty: "Urología", type: "Práctica o procedimiento" },

  // 13. Traumatología
  { id: "tr-1", name: "Infiltraciones articulares", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-2", name: "Bloqueo de columna de un nivel", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-3", name: "Bloqueo de columna de dos niveles", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-4", name: "Bloqueo de columna de tres o cuatro niveles", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-5", name: "Toilette con anestesia local", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-6", name: "Drenaje de hematomas o infecciones", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-7", name: "Extracción de yeso", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-8", name: "Férula de Zimmer", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-9", name: "Bota corta para miembros inferiores", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-10", name: "Bota larga para miembros inferiores", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-11", name: "Yeso de antebrazo", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-12", name: "Yeso braquiopalmar", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-13", name: "Plasma rico en plaquetas para fracturas, tendinosis o articulaciones", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-14", name: "Retiro quirúrgico de cuerpo extraño", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-15", name: "Extracción o exéresis de ganglión", specialty: "Traumatología", type: "Práctica o procedimiento" },
  { id: "tr-16", name: "Tratamiento de uña encarnada", specialty: "Traumatología", type: "Práctica o procedimiento" },

  // 14. Dermatología
  { id: "de-1", name: "Biopsia dérmica", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-2", name: "Curetaje de escara", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-3", name: "Curetaje de verrugas", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-4", name: "Drenaje cutáneo", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-5", name: "Escisión local", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-6", name: "Extracción de quiste sebáceo", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-7", name: "Extracción de quiste de milium", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-8", name: "Exéresis de verruga o acrocordón con electrocauterio", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-9", name: "Electrocoagulación", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-10", name: "Infiltraciones dermatológicas", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-11", name: "Topicaciones con ácido tricloroacético (TCA)", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-12", name: "Tratamiento de una o dos lesiones dermatológicas", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-13", name: "Tratamiento de tres a cinco lesiones dermatológicas", specialty: "Dermatología", type: "Práctica o procedimiento" },
  { id: "de-14", name: "Tratamiento de seis a diez lesiones dermatológicas", specialty: "Dermatología", type: "Práctica o procedimiento" },

  // 15. Flebología
  { id: "fl-1", name: "Escleroterapia de una pierna", specialty: "Flebología", type: "Práctica o procedimiento" },
  { id: "fl-2", name: "Escleroterapia de ambas piernas", specialty: "Flebología", type: "Práctica o procedimiento" },
  { id: "fl-3", name: "Láser de una pierna (flebología)", specialty: "Flebología", type: "Práctica o procedimiento" },
  { id: "fl-4", name: "Láser de ambas piernas (flebología)", specialty: "Flebología", type: "Práctica o procedimiento" },
  { id: "fl-5", name: "Doppler venoso de miembros", specialty: "Flebología", type: "Estudio realizado en BA" },
  { id: "fl-6", name: "Doppler arterial de miembros", specialty: "Flebología", type: "Estudio realizado en BA" },
  { id: "fl-7", name: "Doppler arterial y venoso combinado", specialty: "Flebología", type: "Estudio realizado en BA" },

  // 16. Cirugía plástica
  { id: "cp-1", name: "Aplicación de toxina botulínica", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },
  { id: "cp-2", name: "Relleno con ácido hialurónico", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },
  { id: "cp-3", name: "Extracción de lipoma", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },
  { id: "cp-4", name: "Extracción de quiste", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },
  { id: "cp-5", name: "Curación de úlceras", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },
  { id: "cp-6", name: "Extracción de puntos", specialty: "Cirugía plástica", type: "Práctica o procedimiento" },

  // 17. Psicopedagogía y evaluaciones del neurodesarrollo
  { id: "ps-1", name: "Evaluación de coeficiente intelectual", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-2", name: "Evaluación neurocognitiva", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-3", name: "Informe de evaluación de coeficiente intelectual", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-4", name: "Informe de evaluación neurocognitiva", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-5", name: "Entrevista ADI-R con padres", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-6", name: "Evaluación ADOS con el paciente", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },
  { id: "ps-7", name: "Devolución e informe profesional neurocognitivo", specialty: "Psicopedagogía", type: "Estudio realizado en BA" },

  // 18. Podología
  { id: "po-1", name: "Consulta podológica", specialty: "Podología", type: "Consulta" },
  { id: "po-2", name: "Quiropodia o corte de uñas", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-3", name: "Tratamiento de hiperqueratosis, callos y helomas", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-4", name: "Onicocriptosis unilateral", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-5", name: "Onicocriptosis bilateral", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-6", name: "Onicomicosis (tratamiento de hongos)", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-7", name: "Tratamiento de verrugas plantares", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-8", name: "Encarrilamiento ungueal", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-9", name: "Atención especializada de pie diabético", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-10", name: "Atención de pacientes anticoagulados en podología", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-11", name: "Podología pediátrica", specialty: "Podología", type: "Práctica o procedimiento" },
  { id: "po-12", name: "Estudio de la pisada", specialty: "Podología", type: "Práctica o procedimiento" },

  // 19. Cosmiatría y estética
  { id: "cos-1", name: "Plasma rico en plaquetas capilar", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-2", name: "Plasma rico en plaquetas facial", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-3", name: "Limpieza facial profunda", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-4", name: "Mesoterapia capilar", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-5", name: "Mesoterapia facial", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-6", name: "Peeling químico/estético", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-7", name: "Radiofrecuencia facial/corporal", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },
  { id: "cos-8", name: "Dermaplaning", specialty: "Cosmiatría y estética", type: "Práctica o procedimiento" },

  // 20. Nutrición y evaluación corporal
  { id: "nu-1", name: "Consulta nutricional individual", specialty: "Nutrición", type: "Consulta" },
  { id: "nu-2", name: "Antropometría (evaluación corporal)", specialty: "Nutrición", type: "Práctica o procedimiento" },

  // 21. Kinesiología
  { id: "ki-1", name: "Consulta o sesión de kinesiología", specialty: "Kinesiología", type: "Consulta" },
  { id: "ki-2", name: "Ultrasonido terapéutico", specialty: "Kinesiología", type: "Práctica o procedimiento" },

  // 22. Diagnóstico mamario
  { id: "dm-1", name: "Ecografía mamaria", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "dm-2", name: "Doppler mamario", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "dm-3", name: "Mamografía digital", specialty: "Ginecología", type: "Estudio realizado en BA" },
  { id: "dm-4", name: "Ecografía mamaria más mamografía combinadas", specialty: "Ginecología", type: "Estudio realizado en BA" },

  // 23. Estudios derivados o gestionados externamente
  { id: "ext-1", name: "Resonancia magnética (RMN)", specialty: "Diagnóstico por Imágenes", type: "Estudio derivado", details: "Derivado por BA consultorios a centros de alta complejidad." },
  { id: "ext-2", name: "Tomografía computada (TC)", specialty: "Diagnóstico por Imágenes", type: "Estudio derivado", details: "Derivado por BA consultorios a centros de alta complejidad." },
  { id: "ext-3", name: "Densitometría ósea", specialty: "Diagnóstico por Imágenes", type: "Estudio derivado", details: "Derivado por BA consultorios a centros de alta complejidad." },

  // General specialty Consultas
  ...SPECIALTIES.filter(spec => 
    !["Cardiología", "Cardiología infantil", "Oftalmología", "Otorrinolaringología", "Podología", "Nutrición", "Kinesiología"].includes(spec)
  ).map((spec, index) => ({
    id: `gspec-${index}`,
    name: `Consulta médica de ${spec}`,
    specialty: spec,
    type: "Consulta" as const
  }))
];

// Equipo médico — mismo formato (foto, nombre+especialidad, una frase corta) para todos,
// sin biografías extensas ni superlativos, evitando favoritismo entre profesionales.
export interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  bioLine: string;
}

export const TEAM: TeamMember[] = [
  {
    id: "francos",
    name: "Dr. Héctor Francos",
    specialty: "Cardiología Infantil y Adultos",
    photoUrl: "/dr-francos-cardiologia.png",
    bioLine: "Atiende en BA desde hace años, con foco en el control y seguimiento cardiológico de la comunidad de Zona Oeste."
  }
];

// Galería de instalaciones reales — se completa con archivos que Dani confirme
// (fotos reales del consultorio, sala de espera, recepción, etc.). La sección
// no se renderiza si este array está vacío, para no mostrar espacios rotos.
export const INSTALLATION_PHOTOS: { src: string; alt: string }[] = [
  { src: "/instalacion-recepcion.jpg", alt: "Recepción de BA Consultorios Médicos" },
  { src: "/instalacion-recepcionista.jpg", alt: "Equipo administrativo de BA atendiendo en recepción" },
  { src: "/instalacion-pediatria.jpg", alt: "Pasillo de consultorios, sector pediatría" },
  { src: "/instalacion-sala-espera.jpg", alt: "Sala de espera de BA Consultorios Médicos" }
];
