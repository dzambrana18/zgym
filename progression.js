// Doble progresión, mesociclo de 5 semanas y e1RM. Funciones puras, sin DOM ni almacenamiento.
// La regla es la de la sección 06 de los dos PDFs: te mueves dentro del rango de repeticiones
// hasta tocar el techo y solo entonces subes peso.

// Offset de RIR por semana del mesociclo (semanas 1..5).
// La semana 3 es la "normal" (offset 0), por eso el rir de routines.js es el de esa semana.
// Reproduce las tablas de los PDFs: Anna 3/2-3/2/1-2/4 · David 2-3/2/2/1-2/4.
export const WEEK_RIR_OFFSET = [1, 0.5, 0, -0.5, 2];

export function mesocycleWeek(startISO, todayISO) {
  const days = Math.floor((Date.parse(todayISO) - Date.parse(startISO)) / 86400000);
  if (!Number.isFinite(days) || days < 0) return 1;
  return (Math.floor(days / 7) % 5) + 1;
}

export function isDeload(week) {
  return week === 5;
}

export function targetRir(exercise, week) {
  const r = exercise.rir + (WEEK_RIR_OFFSET[week - 1] ?? 0);
  return Math.min(5, Math.max(1, r));
}

export function effectiveSets(exercise, week, isFirstOfSession) {
  if (isDeload(week)) return Math.max(1, Math.floor(exercise.sets / 2));
  // La semana 3 añade 1 serie al primer ejercicio de cada sesión (ambos PDFs).
  if (week === 3 && isFirstOfSession) return exercise.sets + 1;
  return exercise.sets;
}

// Epley. Sube aunque el peso en barra se quede quieto, que es el caso en déficit calórico.
export function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

export function fmt(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  const r = Math.round(n * 100) / 100;
  return String(r).replace('.', ',');
}

// records: [{loggedAt:'2026-07-30', setIndex, weight, reps, rir}] → sesiones, la más reciente primero
export function groupSessions(records) {
  const byDate = new Map();
  for (const r of records) {
    if (!byDate.has(r.loggedAt)) byDate.set(r.loggedAt, []);
    byDate.get(r.loggedAt).push(r);
  }
  return [...byDate.entries()]
    .map(([date, sets]) => ({
      date,
      sets: sets.slice().sort((a, b) => a.setIndex - b.setIndex),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Qué peso poner hoy en este ejercicio.
 * Devuelve { weight, reason, last, action } donde action es
 * 'start' | 'up' | 'hold' | 'load' | 'deload'.
 */
export function suggest(exercise, records, week) {
  const sessions = groupSessions(records);
  const target = targetRir(exercise, week);
  const bodyweight = exercise.unit === 'peso-corporal';

  if (sessions.length === 0) {
    return {
      weight: exercise.startLoad,
      reason: 'Primera vez: carga inicial del plan. Ajústala hasta que el RIR objetivo sea real.',
      reasonKey: 'sugStart', reasonArgs: [],
      last: null,
      action: 'start',
    };
  }

  const last = sessions[0];
  const done = last.sets.filter((s) => s.reps > 0);
  const weight = done.length
    ? Math.max(...done.map((s) => s.weight || 0))
    : exercise.startLoad;

  const repsText = done.map((s) => s.reps).join('/');
  const last_ = `${last.date} · ${repsText}${bodyweight ? '' : ` a ${fmt(weight)} kg`}`;

  if (isDeload(week)) {
    return {
      weight,
      reason: 'Semana de descarga: mismo peso, la mitad de las series y lejos del fallo.',
      reasonKey: 'sugDeload', reasonArgs: [],
      last: last_,
      action: 'deload',
    };
  }

  const hitTop = done.length > 0 && done.every((s) => s.reps >= exercise.repMax);
  // La puerta se compara contra el RIR BASE del ejercicio, no contra el modulado por la semana.
  // Si usáramos el de la semana, en la semana 1 (objetivo 3, más suave a propósito) alguien que
  // llega al tope con RIR 2 —es decir, apretando MÁS de lo pedido— vería bloqueada la subida.
  // El RIR de la semana es guía de intensidad; la progresión necesita una referencia estable.
  const gate = exercise.rir;
  // Si no se anotó el RIR no bloqueamos la progresión: las repeticiones son la señal principal.
  const rirs = done.map((s) => s.rir).filter((v) => v != null);
  const hadReserve = rirs.length === 0 || rirs.every((v) => v >= gate);

  if (!hitTop) {
    return {
      weight,
      reason: `Aún no has llegado a ${exercise.repMax} en todas las series: repite el peso e intenta sumar 1 repetición.`,
      reasonKey: 'sugHoldReps', reasonArgs: [exercise.repMax],
      last: last_,
      action: 'hold',
    };
  }
  if (!hadReserve) {
    return {
      weight,
      reason: `Llegaste al tope, pero sin margen (RIR por debajo de ${fmt(gate)}): consolida el peso una sesión más.`,
      reasonKey: 'sugHoldRir', reasonArgs: [fmt(gate)],
      last: last_,
      action: 'hold',
    };
  }

  if (exercise.increment == null) {
    return {
      weight,
      reason: bodyweight
        ? `Tope del rango completado: añade 2,5 kg de lastre o sube a ${exercise.repMax + 2} repeticiones.`
        : 'Tope del rango completado.',
      reasonKey: bodyweight ? 'sugLoadBw' : 'sugLoadPlain',
      reasonArgs: bodyweight ? [exercise.repMax + 2] : [],
      last: last_,
      action: 'load',
    };
  }

  const next = Math.max(0, Math.round((weight + exercise.increment) * 100) / 100);
  const verb = exercise.assist ? 'baja la asistencia a' : 'sube a';
  return {
    weight: next,
    reason: `Completaste ${exercise.repMax} reps en todas las series con margen, así que ${verb} ${fmt(next)} kg.`,
    reasonKey: exercise.assist ? 'sugUpAssist' : 'sugUp',
    reasonArgs: [exercise.repMax, fmt(next)],
    last: last_,
    action: 'up',
  };
}
