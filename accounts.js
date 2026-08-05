// Cuentas de usuario: login con PIN, alta con cuestionario y generación de rutina/dieta.
//
// La rutina de un usuario creado desde la app NO copia ejercicios: guarda referencias
// (`ref`) a los días y ejercicios del catálogo de routines.js. Así las fotos, los dibujos
// SVG y las traducciones —indexadas por esas mismas claves— funcionan sin tocar nada.
// Los usuarios originales (anna, david, jan) guardan `{"builtin":"anna"}` y su rutina
// sigue viviendo en el código; solo se materializa a JSON si el admin la edita.
//
// El PIN con la clave anon pública es teatro de seguridad (el repo es público y las
// políticas RLS dejan leer y escribir a cualquiera): el modelo de amenaza son amigos
// de gimnasio, igual que hoy. Se guarda hasheado de todos modos, y el diseño deja la
// puerta abierta a Supabase Auth real (ver README).

import { USERS, EXERCISES, DAYS } from './routines.js';
import * as db from './store.js';

// --- PIN --------------------------------------------------------------------
export async function hashPin(username, pin) {
  const data = new TextEncoder().encode(`${username}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** minúsculas, sin acentos, sin espacios: 'Joan Pérez' → 'joanperez' */
export const normalizeUsername = (s) => String(s || '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._-]/g, '');

export const validUsername = (s) => /^[a-z0-9._-]{3,20}$/.test(s);
// El PIN puede ser numérico o texto: en la práctica es una contraseña corta.
export const validPin = (s) => typeof s === 'string' && s.length >= 4 && s.length <= 20;

// --- login / alta -------------------------------------------------------------
export async function login(usernameRaw, pin) {
  const username = normalizeUsername(usernameRaw);
  let row = null;
  try {
    row = await db.fetchUserRow(username);
  } catch {
    // Sin red vale la copia cacheada: un login repetido en el gimnasio funciona offline.
    row = db.getAccount(username);
    if (!row) return { error: 'loginNeedNet' };
  }
  if (!row) return { error: 'loginBadUser' };
  if (row.pin_hash !== await hashPin(username, pin)) return { error: 'loginBadPin' };
  db.cacheAccount(row);
  db.setUser(username);
  return { row };
}

function randHex(n) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, n);
}

/** form: { name, username, pin, profile: {age, sex, weightKg, heightCm, experience, daysPerWeek, goal} } */
export async function signup(form) {
  const username = normalizeUsername(form.username);
  if (!validUsername(username)) return { error: 'suBadUser' };
  if (!validPin(form.pin)) return { error: 'suBadPin' };
  const row = {
    username,
    name: form.name.trim(),
    pin_hash: await hashPin(username, form.pin),
    is_admin: false,
    // user_key no adivinable para sets_log/body_log, como los de routines.js
    remote_key: `${username}_${randHex(6)}`,
    profile: form.profile,
    routine: generateRoutine(form.profile),
    targets: calcTargets(form.profile),
  };
  try {
    await db.insertUserRow(row);
  } catch (e) {
    const msg = String(e.message || e);
    // 409 = username ya existe (clave primaria). Sin red tampoco se puede crear cuenta.
    if (msg.includes('409')) return { error: 'suTaken' };
    return { error: 'loginNeedNet' };
  }
  db.cacheAccount(row);
  db.setUser(username);
  return { row };
}

// --- rutina: de JSON con refs al objeto que usan las vistas -------------------
export function resolveRoutine(row) {
  const r = row?.routine || {};
  if (r.builtin && USERS[r.builtin]) {
    return { ...USERS[r.builtin], name: row.name, remoteKey: row.remote_key };
  }
  return {
    name: row?.name || '',
    remoteKey: row?.remote_key,
    subtitle: r.subtitle || '',
    weekLabels: r.weekLabels || ['3', '2-3', '2', '1-2', '4'],
    days: (r.days || []).map((d) => ({
      ...(DAYS[d.ref] || {}),
      ...d,
      key: d.ref,
      // Una ref desconocida (edición mala, versión vieja del catálogo) se salta:
      // nunca puede dejar la app de alguien sin renderizar.
      exercises: (d.exercises || [])
        .map((e) => (EXERCISES[e.ref] ? { ...EXERCISES[e.ref], ...e, key: e.ref } : (console.warn('ref desconocida', e.ref), null)))
        .filter(Boolean),
    })),
  };
}

/** Los campos numéricos editables de un ejercicio, referenciando el catálogo. */
export const exOverrides = (e, extra = {}) => ({
  ref: e.key, sets: e.sets, repMin: e.repMin, repMax: e.repMax, rir: e.rir,
  restSec: e.restSec, startLoad: e.startLoad, increment: e.increment, ...extra,
});

/** Rutina resuelta (p. ej. una builtin) → JSON con refs, para poder editarla. */
export function materialize(user) {
  return {
    subtitle: user.subtitle,
    weekLabels: user.weekLabels,
    days: user.days.map((d) => ({
      ref: d.key,
      weekday: d.weekday,
      exercises: d.exercises.map((e) => exOverrides(e)),
    })),
  };
}

// --- cuestionario → rutina ----------------------------------------------------
// Las plantillas son días que YA existen en el catálogo: datos, no contenido nuevo.
export const TEMPLATES = {
  2: [['a-torso-a', 'Lunes'], ['a-pierna-a', 'Jueves']],
  3: [['a-torso-a', 'Lunes'], ['a-pierna-a', 'Miércoles'], ['a-torso-b', 'Viernes']],
  4: [['a-torso-a', 'Lunes'], ['a-pierna-a', 'Martes'], ['a-torso-b', 'Jueves'], ['a-pierna-b', 'Viernes']],
  5: [['j-pecho-a', 'Lunes'], ['j-espalda-a', 'Martes'], ['j-pierna', 'Miércoles'], ['j-pecho-b', 'Jueves'], ['j-espalda-b', 'Viernes']],
};

const GOAL_LABEL = {
  musculo: 'ganar masa muscular',
  grasa: 'perder grasa',
  forma: 'forma física general',
  resistencia: 'preparar una prueba de resistencia',
};

const SPORT_LABEL = {
  correr: 'correr', bici: 'bici', natacion: 'natación', equipo: 'deporte de equipo', otro: 'otro deporte',
};

// Deportes que ya machacan la pierna. Nadar y los de equipo cargan bastante menos.
const PIERNA_FUERA = new Set(['correr', 'bici']);

// Patrones de pierna: son los que hay que recortar cuando ya se corre o se va en bici.
const LEG = new Set(['sentadilla', 'bisagra', 'prensa', 'zancada', 'curl-femoral',
  'extension-cuadriceps', 'gemelo', 'hip-thrust', 'abduccion']);

// El core es el finalizador del día: al recortar por tiempo se conserva, se quitan accesorios.
const CORE = new Set(['plancha', 'plancha-lateral', 'dead-bug', 'crunch', 'rueda-abdominal']);

// Qué evitar según la molestia. Se quitan patrones enteros, no ejercicios sueltos: si te
// molesta la rodilla te molesta la sentadilla, venga del día que venga.
const EVITAR = {
  hombro: new Set(['press-vertical', 'fondos']),
  rodilla: new Set(['sentadilla', 'zancada']),
  lumbar: new Set(['bisagra', 'remo-barra', 'sentadilla']),
};

// Ejercicios que caben en una sesión según lo que dure. Un ejercicio son sus series por
// el descanso más el tiempo de ejecución; con estos números salen sesiones realistas.
const MAX_EJERCICIOS = { 30: 4, 45: 5, 60: 6, 75: 8 };

/** Recorta a `max` ejercicios conservando el core final y los básicos, que van primero. */
function recortar(exs, max) {
  if (exs.length <= max) return exs;
  const core = exs.filter((e) => CORE.has(e.pattern)).slice(0, 1);
  const resto = exs.filter((e) => !CORE.has(e.pattern));
  return [...resto.slice(0, Math.max(1, max - core.length)), ...core];
}

/**
 * Cuestionario → rutina. Encima de la plantilla del número de días se aplican, en este
 * orden: quitar lo que molesta, recortar a lo que dura la sesión, y bajar el volumen de
 * pierna de quien además corre o va en bici. Cada regla es independiente de las demás.
 */
export function generateRoutine(profile) {
  const { daysPerWeek, experience, goal, sport, sportDays = 0, minutes = 60, niggle } = profile;
  const beginner = experience === 'nuevo';
  const plantilla = TEMPLATES[daysPerWeek] || TEMPLATES[3];
  const fuera = EVITAR[niggle] || new Set();
  const max = MAX_EJERCICIOS[minutes] || MAX_EJERCICIOS[60];

  // Cuánto volumen de pierna se quita: la pierna ya la está entrenando fuera del gimnasio.
  const recorteP = PIERNA_FUERA.has(sport) ? (sportDays >= 4 ? 2 : sportDays >= 2 ? 1 : 0) : 0;

  const extra = sportDays > 0 && sport && sport !== 'ninguno'
    ? ` · ${sportDays} d/sem de ${SPORT_LABEL[sport] || 'otro deporte'}`
    : '';

  return {
    subtitle: `${plantilla.length} días · ${GOAL_LABEL[goal] || GOAL_LABEL.forma}${extra}`,
    // Principiante: se entrena más lejos del fallo, como Jan.
    weekLabels: beginner ? ['4', '3', '3', '2', '4'] : ['3', '2-3', '2', '1-2', '4'],
    days: plantilla.map(([ref, weekday]) => {
      // Nunca se baja de 3 ejercicios: una sesión de dos es una excusa, no un entreno.
      let exs = DAYS[ref].exercises.filter((e) => !fuera.has(e.pattern));
      if (exs.length < 3) exs = DAYS[ref].exercises;
      exs = recortar(exs, max);

      return {
        ref,
        weekday,
        exercises: exs.map((e) => {
          const pierna = LEG.has(e.pattern);
          return exOverrides(e, {
            ...(beginner ? { rir: Math.min(3, e.rir + 1) } : {}),
            // En pierna, menos series y más lejos del fallo: lo que se levanta aquí tiene
            // que dejarte entero para la salida de mañana, no al revés.
            ...(pierna && recorteP
              ? { sets: Math.max(2, e.sets - recorteP), rir: Math.min(4, e.rir + 1) }
              : {}),
          });
        }),
      };
    }),
  };
}

// --- cuestionario → objetivos de dieta ----------------------------------------
// Mifflin-St Jeor + factor de actividad por días de entreno + ajuste por objetivo.
//
// El factor va por los días TOTALES de entreno, gimnasio más deporte. Contar solo los
// del gimnasio le calculaba a alguien que corre tres días más el gasto de un sedentario,
// y comía de menos sin saber por qué.
const ACTIVITY = { 0: 1.3, 1: 1.35, 2: 1.4, 3: 1.5, 4: 1.55, 5: 1.6, 6: 1.68, 7: 1.75 };
const GOAL_KCAL = { musculo: 1.10, grasa: 0.80, forma: 1.00, resistencia: 0.92 };

// ponytail: textos de estrategia solo en español; presets por objetivo, no por persona.
const DIET_NOTES = {
  musculo: {
    estrategia: 'Superávit ligero para ganar músculo',
    detalle: 'Sin comer por encima del mantenimiento no se construye tejido nuevo. Objetivo: subir 0,2-0,4 kg al mes — por encima de eso lo que se gana es grasa.',
    proteinaNota: 'Tu proteína es el mínimo diario. Pasarte no es problema; quedarte corto sí.',
  },
  grasa: {
    estrategia: 'Déficit moderado para perder grasa',
    detalle: 'Comer por debajo del mantenimiento conservando el músculo. Objetivo: bajar 0,4-0,7 kg por semana. Si baja más rápido, come un poco más.',
    proteinaNota: 'La proteína alta es lo que protege tu masa magra en déficit, y además es lo que más sacia.',
  },
  forma: {
    estrategia: 'Mantenimiento para mejorar forma física',
    detalle: 'Comer al nivel del gasto: el objetivo es rendir en el gimnasio y consolidar el hábito, no mover la báscula.',
    proteinaNota: 'Con llegar a tu mínimo de proteína cada día es suficiente.',
  },
  resistencia: {
    estrategia: 'Déficit ligero con hidratos altos para llegar a la prueba',
    detalle: 'Bajar grasa sin quedarte sin gasolina los días de carrera. Objetivo: 0,3-0,5 kg por semana, más despacio de lo normal a propósito. Los días de tirada larga come al nivel del gasto, no en déficit.',
    proteinaNota: 'Entrenando fuerza y resistencia a la vez, la proteína es lo que evita perder músculo mientras acumulas kilómetros.',
  },
};

export function calcTargets({ sex, age, weightKg, heightCm, daysPerWeek, goal, sportDays = 0 }) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'm' ? 5 : -161);
  const dias = Math.min(7, (daysPerWeek || 3) + sportDays);
  const kcal = Math.round((bmr * (ACTIVITY[dias] ?? 1.5) * (GOAL_KCAL[goal] ?? 1)) / 50) * 50;
  const prot = Math.round(weightKg * (goal === 'grasa' ? 2.2 : goal === 'resistencia' ? 2 : 1.8));
  // Con carga de resistencia se baja la grasa para dejar sitio a los hidratos, que son
  // los que sostienen las tiradas largas.
  const fat = Math.round(weightKg * (goal === 'resistencia' ? 0.8 : 0.9));
  const carb = Math.max(0, Math.round((kcal - 4 * prot - 9 * fat) / 4));
  return { kcal, prot, fat, carb, ...(DIET_NOTES[goal] || DIET_NOTES.forma) };
}
