// Idiomas: español (base), catalán e inglés.
//
// El español vive en routines.js y nutrition.js tal cual. Las traducciones están en
// lang-ca.js y lang-en.js como diccionarios sueltos indexados por la misma clave del
// ejercicio o de la receta. Así los datos originales no se tocan y, si falta alguna
// traducción, cae al español en vez de romperse.

import { CA } from './lang-ca.js';
import { EN } from './lang-en.js';

export const LANGS = { es: 'Español', ca: 'Català', en: 'English' };
const PACKS = { ca: CA, en: EN };
const KEY = 'gym.lang';

// Este módulo también se importa desde Node en las pruebas, donde no hay
// document ni localStorage: todo acceso al navegador va protegido.
const enNavegador = typeof document !== 'undefined';

/** Idioma del sistema, si lo tenemos traducido. Si no, español. */
function detectar() {
  if (!enNavegador) return 'es';
  for (const l of navigator.languages || [navigator.language || '']) {
    const base = String(l).toLowerCase().split('-')[0];
    if (base in LANGS) return base;
  }
  return 'es';
}

let actual = (() => {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (guardado && guardado in LANGS) return guardado;
  } catch { /* sin almacenamiento: modo privado o Node */ }
  return detectar();
})();

export const getLang = () => actual;

/** Locale para formatear fechas y números. */
export const locale = () => ({ es: 'es-ES', ca: 'ca-ES', en: 'en-GB' }[actual] || 'es-ES');

export function setLang(l) {
  if (!(l in LANGS)) return;
  actual = l;
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* modo privado */ }
  if (enNavegador) document.documentElement.lang = l;
}

if (enNavegador) document.documentElement.lang = actual;

const pack = () => PACKS[actual] || null;

/** Texto de interfaz. Si falta la traducción, devuelve el español. */
export function t(clave, ...args) {
  const p = pack();
  let s = (p?.ui?.[clave]) ?? UI_ES[clave] ?? clave;
  args.forEach((v, i) => { s = s.replaceAll(`{${i}}`, v); });
  return s;
}

// --- contenido: ejercicios, días, recetas ---------------------------------
const pick = (grupo, clave, campo, porDefecto) => pack()?.[grupo]?.[clave]?.[campo] ?? porDefecto;

export const exName = (ex) => pick('ex', ex.key, 'name', ex.name);
export const exCue = (ex) => pick('ex', ex.key, 'cue', ex.cue);
export const dayName = (d) => pick('days', d.key, 'name', d.name);
export const daySubtitle = (d) => pick('days', d.key, 'subtitle', d.subtitle);
export const dayWarmup = (d) => pick('days', d.key, 'warmup', d.warmup);
export const mealName = (m) => pick('meals', m.key, 'name', m.name);
export const mealTip = (m) => pick('meals', m.key, 'tip', m.tip);
export const mealIngredients = (m) => pick('meals', m.key, 'ingredients', m.ingredients);
export const mealSteps = (m) => pick('meals', m.key, 'steps', m.steps);
export const userSubtitle = (u, user) => pick('users', u, 'subtitle', user.subtitle);
export const targetField = (u, campo, porDefecto) => pick('targets', u, campo, porDefecto);

/** Día de la semana traducido, a partir del índice 0-6 de JavaScript. */
export const weekdayName = (i) => t('wd')[i];

/** Etiqueta de la toma del día de ejemplo (Desayuno, Media mañana...). */
export const slotName = (s) => pack()?.slots?.[s] ?? s;

// ---------------------------------------------------------------------------
// Diccionario base en español. Es la referencia: lang-ca.js y lang-en.js
// tienen que tener exactamente estas mismas claves (lo comprueba el test).
// ---------------------------------------------------------------------------
export const UI_ES = {
  wd: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

  // login y alta de usuario
  loginKicker: 'Registro de entrenamiento',
  loginTitle: 'Inicia sesión',
  loginUser: 'Nombre de usuario',
  loginPin: 'PIN',
  loginBtn: 'Entrar',
  loginCreateTitle: 'Crear cuenta nueva',
  loginCreateSub: 'Responde un cuestionario de un minuto y la app te genera rutina y dieta.',
  loginNeedNet: 'La primera vez hace falta conexión',
  loginBadUser: 'No existe ese usuario',
  loginBadPin: 'PIN incorrecto',
  suTitle: 'Crea tu cuenta',
  suAccessKicker: 'Acceso',
  suName: 'Nombre y apellido',
  suUserHint: 'Sin espacios ni acentos. Es lo que usarás para entrar.',
  suPin: 'Elige un PIN (mínimo 4 caracteres, números o texto)',
  suQuizKicker: 'Cuestionario: con esto se generan tu rutina y tu dieta',
  suAge: 'Edad',
  suSex: 'Sexo',
  suSexF: 'Mujer',
  suSexM: 'Hombre',
  suHeight: 'Altura (cm)',
  suExp: 'Experiencia en el gimnasio',
  suExp0: 'Menos de 1 año',
  suExp1: 'Entre 1 y 3 años',
  suExp2: 'Más de 3 años',
  suDays: 'Días de entreno por semana',
  suGoal: 'Objetivo',
  suGoalMuscle: 'Ganar masa muscular',
  suGoalFat: 'Perder grasa',
  suGoalFit: 'Forma física general',
  suCreate: 'Crear cuenta y empezar',
  suNeedName: 'Escribe tu nombre',
  suNeedData: 'Revisa edad, peso y altura',
  suBadUser: 'Usuario no válido: 3-20 letras o números, sin espacios',
  suBadPin: 'El PIN necesita al menos 4 caracteres',
  suTaken: 'Ese nombre de usuario ya existe',
  suDone: 'Cuenta creada: esta es tu rutina',

  // administración
  adminKicker: 'Administración',
  adminTitle: 'Administración',
  adminSub: 'Usuarios, rutinas y accesos',
  adminLoading: 'Cargando usuarios…',
  adminView: 'Ver',
  adminEdit: 'Editar rutina',
  adminPin: 'Nuevo PIN',
  adminDelete: 'Borrar',
  adminNewPin: 'Nuevo PIN para {0} (mínimo 4 caracteres):',
  adminPinDone: 'PIN cambiado',
  adminConfirmDelete: '¿Borrar la cuenta de {0}? Sus registros de entrenamiento no se tocan.',
  adminDeleted: 'Cuenta borrada',
  adminSaved: 'Rutina guardada',
  adminEditSub: 'Editar rutina',
  viewingAs: 'Viendo a {0}',
  viewingExit: 'Salir',
  edRemove: 'Quitar',
  edAdd: '+ Añadir ejercicio…',
  edSave: 'Guardar rutina',
  edRepMin: 'Reps mín',
  edRepMax: 'Reps máx',
  edRest: 'Desc. (s)',
  edIncr: 'Incr. (kg)',
  edBad: 'Hay valores no válidos en la rutina',

  // navegación
  tabHome: 'Entreno',
  tabDiet: 'Dieta',
  tabProgress: 'Progreso',
  tabSettings: 'Ajustes',
  back: '‹ Atrás',

  // inicio
  mesoWeek: 'Semana del mesociclo',
  mesoOf: 'de 5',
  rirTarget: 'RIR objetivo',
  hintDeload: 'Descarga: mismo peso, la mitad de las series y lejos del fallo. No la saltes.',
  hintWeek3: 'Se añade una serie al primer ejercicio de cada sesión.',
  hintWeek4: 'Semana pico: la más dura del bloque.',
  hintDefault: 'Anota cada serie. Lo que no se anota, no progresa.',
  todayIs: 'Hoy toca {0}',
  todayDone: ' Ya la has completada, buen trabajo.',
  restDay: 'Hoy toca descansar.',
  nextSession: 'La próxima sesión es <strong>{0}</strong>, {1}.',
  tomorrow: 'mañana',
  inDays: 'en {0} días',
  restIsPlan: 'Descansar forma parte del plan: es cuando el músculo se construye.',
  neverLogged: 'Nunca registrada',
  doneToday: 'Hecha hoy',
  yesterday: 'Ayer',
  daysAgo: 'Hace {0} días',
  today: 'Hoy',
  trackingKicker: 'Seguimiento',
  bodyCard: 'Peso corporal y cintura',

  // sesión
  offPlanTitle: 'Hoy no toca esta sesión.',
  offPlanToday: 'Según el plan, hoy te toca <strong>{0}</strong>.',
  offPlanRest: 'Hoy es día de descanso en tu plan.',
  offPlanWarn: 'Puedes hacerla igual y se registrará con normalidad, pero si cambias el orden a menudo acabarás entrenando unos grupos de más y otros de menos.',
  deloadTitle: 'Semana de descarga.',
  deloadBody: 'Series reducidas a la mitad y RIR 4: mismo peso, lejos del fallo.',
  warmup: 'Calentamiento',
  colExercise: 'Ejercicio',
  colSetsReps: 'Series × Reps',
  colRir: 'RIR',
  colRest: 'Descanso',
  colStart: 'Carga inicio',
  colWeight: 'Peso',
  colReps: 'Reps',
  colSecs: 'Seg.',
  perHand: 'kg por mano',
  bodyweight: 'Peso corporal',
  nudgeHint: 'ajusta si el RIR real no cuadra',
  lastTime: 'Última vez · {0}',
  watchVideo: '▶ Ver vídeo real',
  needReps: 'Anota las repeticiones antes de marcar la serie',
  legendRir: '<strong>RIR</strong> = repeticiones en reserva',
  legendSuperset: '<strong>Superserie</strong> = los dos ejercicios seguidos sin descanso',

  // descanso
  restLabel: 'Descanso',
  restTarget: 'objetivo {0}',
  restDone: 'Descanso cumplido · a por la siguiente',
  restAdd: '+30 s',
  restSkip: 'Saltar',

  // progreso
  summary: 'Resumen',
  summaryEmpty: 'Registra unas cuantas sesiones y aquí aparecerá qué ejercicios progresan, cuáles se han parado y cuánto estás entrenando.',
  statSessions: 'sesiones en 4 semanas',
  statRising: 'ejercicios subiendo',
  statStalled: 'estancados',
  adhGood: 'Adherencia muy buena: 3-4 sesiones por semana sostenidas.',
  adhOk: 'Adherencia correcta. Con una sesión más por semana el progreso se nota antes.',
  adhBad: '<strong>Estás entrenando poco</strong> para el plan: son 4 días por semana. La constancia pesa más que cualquier ajuste de la rutina.',
  bestProgress: 'Mejor progresión: <strong>{0}</strong> (+{1} % en las últimas 3 sesiones).',
  manyStalled: '<strong>{0} ejercicios llevan varias sesiones sin subir.</strong> Si es general, casi siempre es comida o descanso, no el programa.',
  someStalled: 'Sin avance en: {0}. Prueba a bajar 5 % el peso y reconstruir.',
  bodyWeightLine: 'Peso corporal: <strong>{0} kg</strong> ({1} kg en 4 semanas).',
  waistLine: 'Cintura: <strong>{0} cm</strong> desde el primer registro.',
  summaryFoot: 'Todo esto sale de tu propio registro. Para revisarlo con calma o compartirlo, en Ajustes puedes descargar el histórico completo en JSON.',
  e1rmKicker: '1RM estimado (Epley)',
  e1rmNote: 'Sube aunque el peso en la barra se quede quieto. Es la métrica honesta en déficit calórico.',
  tonnageKicker: 'Tonelaje por sesión',
  tonnageNote: 'Peso × repeticiones sumado en todas las series.',
  history: 'Historial',
  noHistory: 'Todavía no has registrado este ejercicio.',
  colDate: 'Fecha',
  colSets: 'Series',
  needTwo: 'Hacen falta al menos dos registros para dibujar la evolución.',

  // peso corporal
  bodyTitle: 'Peso y cintura',
  bodyNote: 'Compara <strong>promedios semanales</strong>, nunca días sueltos. La cintura es el mejor indicador: si baja, vas bien aunque la báscula se atasque.',
  fieldWeight: 'Peso corporal (kg)',
  fieldWaist: 'Cintura (cm) — opcional',
  saveToday: 'Guardar de hoy',
  evolution: 'Evolución',
  legendWeight: 'Peso (kg)',
  legendWaist: 'Cintura (cm)',
  records: 'Registros',
  needOneValue: 'Escribe al menos un valor',
  saved: 'Guardado',

  // dieta
  dietTitle: 'Dieta',
  kcalDay: 'kcal/día',
  gProtein: 'g proteína',
  gCarbs: 'g carbos',
  gFat: 'g grasas',
  proteinLabel: 'Proteína:',
  sampleDay: 'Día de ejemplo',
  sampleSums: 'Suma <strong>{0} kcal</strong> y <strong>{1} g</strong> de proteína, por unos <strong>{2} €</strong> al día.',
  sampleFits: 'Cuadra con tu objetivo.',
  sampleOver: 'Se queda {0} kcal por encima: ajusta con la ración de arroz, pasta o pan.',
  sampleUnder: 'Se queda {0} kcal por debajo: ajusta con la ración de arroz, pasta o pan.',
  shoppingBtn: 'Ver lista de la compra del día',
  shoppingCopied: 'Lista copiada al portapapeles',
  shoppingTitle: 'Lista de la compra',
  allRecipes: 'Todas las recetas',
  catBreakfast: 'Desayunos',
  catLunch: 'Comidas',
  catDinner: 'Cenas',
  catSnack: 'Snacks',
  ingredients: 'Ingredientes',
  preparation: 'Preparación',
  halfPortion: '(media ración)',
  minShort: 'min',
  dietDisclaimer: 'Las calorías son estimaciones de tablas estándar y los precios son orientativos: cambian cada temporada. Sirven para acertar el objetivo con un margen del 5-10 %, que es lo que importa.',

  // ajustes
  settingsTitle: 'Ajustes',
  language: 'Idioma',
  syncKicker: 'Sincronización',
  syncLocal: 'Solo local — Supabase sin configurar',
  syncPending: '{0} registro(s) pendientes de subir',
  syncOk: 'Todo sincronizado',
  lastUpload: 'Última subida: {0}',
  btnSync: 'Sincronizar ahora',
  btnPull: 'Recuperar de la nube',
  btnExport: 'Descargar copia',
  btnImport: 'Restaurar copia',
  noCloudWarn: 'Sin Supabase configurado los datos viven solo en este móvil. <strong>Safari puede borrarlos si no abres la app en ~7 días.</strong> Descarga una copia de vez en cuando.',
  syncing: 'Sincronizando…',
  syncedN: '{0} registro(s) subidos',
  nothingPending: 'Nada pendiente',
  searchingCloud: 'Buscando en la nube…',
  recovered: 'Recuperados {0} series y {1} pesajes',
  nothingToRecover: 'No había nada nuevo que recuperar',
  errorPrefix: 'Error: {0}',
  restored: 'Copia restaurada',
  badFile: 'Archivo no válido',
  mesoKicker: 'Mesociclo',
  mesoState: 'Semana <strong>{0} de 5</strong> · empezó el {1}',
  mesoStart: 'Fecha de inicio',
  mesoReset: 'Empezar un mesociclo nuevo hoy',
  mesoResetDone: 'Mesociclo reiniciado en la semana 1',
  account: 'Cuenta',
  logout: 'Cerrar sesión',
  timerNote: '<strong>Sobre el temporizador:</strong> la cuenta es correcta aunque bloquees el móvil, pero <strong>no suena solo</strong>. iOS no permite alarmas fiables en segundo plano sin notificaciones push.',
  verChecking: 'comprobando…',
  verUpToDate: 'al día',
  verAvailable: 'hay la v{0} disponible',
  verOffline: 'sin conexión',
  updateNew: 'Hay una versión nueva <strong>(v{0})</strong>. Tienes la v{1}.',
  updateBtn: 'Actualizar',
  updating: 'Actualizando…',

  /* motivos de la sugerencia de carga: progression.js devuelve la clave */
  sugStart: 'Primera vez: carga inicial del plan. Ajústala hasta que el RIR objetivo sea real.',
  sugDeload: 'Semana de descarga: mismo peso, la mitad de las series y lejos del fallo.',
  sugHoldReps: 'Aún no has llegado a {0} en todas las series: repite el peso e intenta sumar 1 repetición.',
  sugHoldRir: 'Llegaste al tope, pero sin margen (RIR por debajo de {0}): consolida el peso una sesión más.',
  sugLoadBw: 'Tope del rango completado: añade 2,5 kg de lastre o sube a {0} repeticiones.',
  sugLoadPlain: 'Tope del rango completado.',
  sugUp: 'Completaste {0} reps en todas las series con margen, así que sube a {1} kg.',
  sugUpAssist: 'Completaste {0} reps en todas las series con margen, así que baja la asistencia a {1} kg.',

  // errores
  storageError: 'No se pudo guardar. ¿Navegación privada o memoria llena?',
  recoveredFromCloud: 'Recuperados {0} registros de la nube',
};
