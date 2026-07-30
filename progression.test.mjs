// Comprobación de la lógica de progresión.  Ejecutar:  node progression.test.mjs
import assert from 'node:assert/strict';
import fsSync from 'node:fs';
import {
  mesocycleWeek, isDeload, targetRir, effectiveSets, e1rm, groupSessions, suggest,
} from './progression.js';
import { USERS, allExercises } from './routines.js';
import { MOVES, moveSvg } from './moves.js';

const banca = { key: 'x', sets: 4, repMin: 6, repMax: 8, rir: 2, startLoad: 77.5, unit: 'kg', increment: 2.5 };
const set = (setIndex, weight, reps, rir, loggedAt = '2026-07-20') => ({ setIndex, weight, reps, rir, loggedAt });

// --- semana del mesociclo -------------------------------------------------
assert.equal(mesocycleWeek('2026-07-01', '2026-07-01'), 1, 'día 0 → semana 1');
assert.equal(mesocycleWeek('2026-07-01', '2026-07-07'), 1, 'día 6 → semana 1');
assert.equal(mesocycleWeek('2026-07-01', '2026-07-08'), 2, 'día 7 → semana 2');
assert.equal(mesocycleWeek('2026-07-01', '2026-08-04'), 5, 'día 34 → semana 5');
assert.equal(mesocycleWeek('2026-07-01', '2026-08-05'), 1, 'día 35 → vuelve a semana 1');
assert.equal(mesocycleWeek('2026-07-01', '2026-06-20'), 1, 'fecha anterior al inicio → semana 1');
assert.equal(mesocycleWeek('basura', '2026-07-01'), 1, 'fecha inválida → semana 1');
assert.ok(isDeload(5) && !isDeload(4));

// --- RIR objetivo por semana ---------------------------------------------
assert.equal(targetRir(banca, 1), 3);
assert.equal(targetRir(banca, 3), 2);
assert.equal(targetRir(banca, 4), 1.5);
assert.equal(targetRir(banca, 5), 4, 'la descarga sube el RIR a 4');
// Nunca por debajo de 1: el plan no entrena al fallo.
assert.equal(targetRir({ ...banca, rir: 1 }, 4), 1, 'clamp inferior en 1');
assert.equal(targetRir({ ...banca, rir: 4 }, 5), 5, 'clamp superior en 5');

// --- series efectivas ----------------------------------------------------
assert.equal(effectiveSets(banca, 2, true), 4);
assert.equal(effectiveSets(banca, 3, true), 5, 'semana 3 suma 1 serie al primer ejercicio');
assert.equal(effectiveSets(banca, 3, false), 4, '...pero solo al primero');
assert.equal(effectiveSets(banca, 5, true), 2, 'descarga: mitad de series');
assert.equal(effectiveSets({ ...banca, sets: 3 }, 5, false), 1, 'descarga de 3 series → 1');
assert.equal(effectiveSets({ ...banca, sets: 2 }, 5, false), 1, 'nunca 0 series');

// --- e1RM ----------------------------------------------------------------
assert.equal(Math.round(e1rm(77.5, 8)), 98, '77,5 × 8 ≈ 98 kg de 1RM');
assert.equal(e1rm(0, 8), 0);
assert.equal(e1rm(80, 0), 0);

// --- agrupación por sesión, más reciente primero -------------------------
const g = groupSessions([
  set(1, 70, 8, 2, '2026-07-10'), set(0, 70, 8, 2, '2026-07-10'), set(0, 75, 6, 2, '2026-07-17'),
]);
assert.equal(g.length, 2);
assert.equal(g[0].date, '2026-07-17', 'la sesión más reciente va primera');
assert.deepEqual(g[0].sets.map((s) => s.setIndex), [0]);
assert.deepEqual(g[1].sets.map((s) => s.setIndex), [0, 1], 'las series se ordenan por índice');

// --- sugerencia de carga -------------------------------------------------
assert.deepEqual(
  (({ weight, action }) => ({ weight, action }))(suggest(banca, [], 3)),
  { weight: 77.5, action: 'start' },
  'sin histórico usa la carga inicial'
);

// Tope del rango en TODAS las series y con reserva → sube el incremento
let s = suggest(banca, [set(0, 77.5, 8, 2), set(1, 77.5, 8, 2), set(2, 77.5, 8, 2), set(3, 77.5, 8, 2)], 3);
assert.equal(s.action, 'up');
assert.equal(s.weight, 80, '77,5 + 2,5 = 80');
assert.match(s.last, /8\/8\/8\/8/);

// Una sola serie por debajo del tope → mantiene
s = suggest(banca, [set(0, 77.5, 8, 2), set(1, 77.5, 8, 2), set(2, 77.5, 8, 2), set(3, 77.5, 7, 2)], 3);
assert.equal(s.action, 'hold');
assert.equal(s.weight, 77.5);

// Llega al tope pero sin reserva (RIR 0 < objetivo 2) → consolida
s = suggest(banca, [set(0, 77.5, 8, 0), set(1, 77.5, 8, 0)], 3);
assert.equal(s.action, 'hold');

// Sin RIR anotado no se bloquea la progresión
s = suggest(banca, [set(0, 77.5, 8, null), set(1, 77.5, 8, null)], 3);
assert.equal(s.action, 'up');

// El mismo histórico en semana de descarga NO sube el peso
s = suggest(banca, [set(0, 77.5, 8, 2), set(1, 77.5, 8, 2), set(2, 77.5, 8, 2), set(3, 77.5, 8, 2)], 5);
assert.equal(s.action, 'deload');
assert.equal(s.weight, 77.5);

// Sin margen (RIR 1 < base 2) se consolida el peso, en cualquier semana
assert.equal(suggest(banca, [set(0, 77.5, 8, 1), set(1, 77.5, 8, 1)], 4).action, 'hold');

// La semana 1 pide RIR 3 (más suave a propósito). Quien llega al tope con RIR 2 ha apretado MÁS
// de lo pedido: la subida NO debe bloquearse. La puerta va contra el RIR base, no el de la semana.
for (const week of [1, 2, 3, 4]) {
  const r = suggest(banca, [set(0, 77.5, 8, 2), set(1, 77.5, 8, 2), set(2, 77.5, 8, 2), set(3, 77.5, 8, 2)], week);
  assert.equal(r.action, 'up', `semana ${week}: tope + margen debe subir el peso`);
  assert.equal(r.weight, 80, `semana ${week}: 77,5 → 80`);
}
assert.ok(targetRir(banca, 1) > targetRir(banca, 4), 'el RIR de la semana sigue siendo guía visible');

// Máquina de asistencia: progresar es BAJAR kilos
const asistida = { ...banca, increment: -2.5, assist: true, startLoad: 31, repMax: 10 };
s = suggest(asistida, [set(0, 31, 10, 2), set(1, 31, 10, 2)], 3);
assert.equal(s.weight, 28.5, 'la asistencia baja de 31 a 28,5');
assert.match(s.reason, /baja la asistencia/);

// Peso corporal: no hay kilos que subir, se sugiere lastre
const dominadas = { ...banca, unit: 'peso-corporal', increment: null, startLoad: 0, repMax: 8, rir: 1 };
s = suggest(dominadas, [set(0, 0, 8, 1), set(1, 0, 8, 1)], 3);
assert.equal(s.action, 'load');
assert.match(s.reason, /lastre/);
assert.ok(!s.last.includes('kg'), 'en peso corporal no se muestran kilos');

// Series anotadas a 0 reps (saltadas) no cuentan como tope alcanzado
s = suggest(banca, [set(0, 77.5, 8, 2), set(1, 0, 0, null)], 3);
assert.equal(s.action, 'up', 'las series vacías se ignoran');

// --- integridad de los datos de rutina -----------------------------------
for (const [uk, user] of Object.entries(USERS)) {
  assert.equal(user.weekLabels.length, 5, `${uk}: 5 etiquetas de semana`);
  assert.equal(user.days.length, 4, `${uk}: 4 días`);
  const keys = new Set();
  for (const ex of allExercises(uk)) {
    assert.ok(!keys.has(ex.key), `${uk}: clave duplicada ${ex.key}`);
    keys.add(ex.key);
    assert.ok(ex.name && ex.cue && ex.video, `${uk}/${ex.key}: falta texto`);
    assert.ok(ex.sets > 0 && ex.repMin > 0 && ex.repMax >= ex.repMin, `${uk}/${ex.key}: rango de reps inválido`);
    assert.ok(['kg', 'kg-por-mano', 'peso-corporal'].includes(ex.unit), `${uk}/${ex.key}: unidad ${ex.unit}`);
    assert.ok(ex.rir >= 1 && ex.rir <= 4, `${uk}/${ex.key}: rir ${ex.rir}`);
    assert.ok(ex.restSec >= 30, `${uk}/${ex.key}: descanso ${ex.restSec}`);
    if (ex.unit === 'peso-corporal') assert.equal(ex.increment, null, `${uk}/${ex.key}: peso corporal sin incremento`);
    else assert.ok(ex.increment !== 0 && ex.increment != null, `${uk}/${ex.key}: falta incremento`);
    // Todo ejercicio necesita su animación de técnica
    assert.ok(MOVES[ex.pattern], `${uk}/${ex.key}: patrón inexistente (${ex.pattern})`);
    assert.match(moveSvg(ex.pattern), /^<svg/, `${uk}/${ex.key}: la animación no genera SVG`);
    // Toda foto declarada debe existir en disco, con sus dos fotogramas
    if (ex.photo) {
      for (const i of [0, 1]) {
        const f = `photos/${ex.photo}-${i}.jpg`;
        assert.ok(fsSync.existsSync(f), `${uk}/${ex.key}: falta ${f}`);
      }
    }    // Toda sugerencia inicial debe ser calculable en las 5 semanas
    for (let w = 1; w <= 5; w++) assert.ok(suggest(ex, [], w).weight >= 0);
  }
  // Cada día debe cerrar con un ejercicio de core
  const CORE = new Set(['plancha', 'plancha-lateral', 'dead-bug', 'crunch', 'rueda-abdominal']);
  for (const d of user.days) {
    assert.ok(CORE.has(d.exercises.at(-1).pattern), `${uk}/${d.key}: el último ejercicio no es de core`);
  }
}
assert.equal(allExercises('anna').length, 33, 'Anna: 33 ejercicios');
assert.equal(allExercises('david').length, 32, 'David: 32 ejercicios');

// Material que el gimnasio no tiene: no debe quedar ni rastro
const todos = [...allExercises('anna'), ...allExercises('david')];
// Se mira el NOMBRE, no la explicación: un cue puede mencionar el pec-deck para decir
// justamente que ese ejercicio lo sustituye, y eso es correcto.
for (const ex of todos) {
  const n = `${ex.name} ${ex.video}`.toLowerCase();
  assert.ok(!/pec[- +]?deck/.test(n), `${ex.key}: sigue prescribiendo el pec-deck`);
  assert.ok(!n.includes('colgado'), `${ex.key}: sigue habiendo elevación de piernas colgado`);
  assert.ok(!n.includes('femoral sentad'), `${ex.key}: curl femoral sentado, tiene que ser tumbado`);
  assert.ok(!/sobre la cabeza|por encima de la cabeza/.test(n), `${ex.key}: tríceps desde abajo`);
}
// No hay patrones dibujados que nadie use
const usados = new Set(todos.map((e) => e.pattern));
assert.deepEqual(Object.keys(MOVES).filter((k) => !usados.has(k)), [], 'patrones de animación sin usar');

// --- idiomas ---------------------------------------------------------------
// Los tres diccionarios tienen que cubrir exactamente lo mismo. Si no, la app
// mezclaría idiomas: textos en español apareciendo dentro de la versión inglesa.
{
  const { UI_ES } = await import('./i18n.js');
  const { CA } = await import('./lang-ca.js');
  const { EN } = await import('./lang-en.js');
  const { USERS, allExercises } = await import('./routines.js');
  const { MEALS, SAMPLE_DAY } = await import('./nutrition.js');

  const clavesUI = Object.keys(UI_ES).sort();
  for (const [nombre, pack] of [['ca', CA], ['en', EN]]) {
    assert.deepEqual(Object.keys(pack.ui).sort(), clavesUI,
      `${nombre}: las claves de interfaz no coinciden con el español`);
    for (const k of clavesUI) {
      const a = UI_ES[k], b = pack.ui[k];
      assert.equal(typeof b, typeof a, `${nombre}.ui.${k}: tipo distinto`);
      if (Array.isArray(a)) assert.equal(b.length, a.length, `${nombre}.ui.${k}: longitud distinta`);
      else assert.ok(String(b).trim().length > 0, `${nombre}.ui.${k}: vacío`);
      // Los marcadores {0}, {1}... deben conservarse o la frase saldrá incompleta
      const ph = (s) => (String(s).match(/\{\d\}/g) || []).sort().join(',');
      if (!Array.isArray(a)) assert.equal(ph(b), ph(a), `${nombre}.ui.${k}: marcadores {n} distintos`);
    }
  }

  const ejercicios = [...allExercises('anna'), ...allExercises('david')];
  const dias = Object.values(USERS).flatMap((u) => u.days);
  for (const [nombre, pack] of [['ca', CA], ['en', EN]]) {
    for (const ex of ejercicios) {
      const tr = pack.ex[ex.key];
      assert.ok(tr, `${nombre}: falta el ejercicio ${ex.key}`);
      assert.ok(tr.name?.trim() && tr.cue?.trim(), `${nombre}/${ex.key}: nombre o explicación vacíos`);
    }
    for (const d of dias) {
      const tr = pack.days[d.key];
      assert.ok(tr?.name && tr?.subtitle && tr?.warmup, `${nombre}: día ${d.key} incompleto`);
    }
    for (const m of MEALS) {
      const tr = pack.meals[m.key];
      assert.ok(tr, `${nombre}: falta la receta ${m.key}`);
      assert.equal(tr.ingredients.length, m.ingredients.length, `${nombre}/${m.key}: nº de ingredientes distinto`);
      assert.equal(tr.steps.length, m.steps.length, `${nombre}/${m.key}: nº de pasos distinto`);
      assert.equal(Boolean(tr.tip), Boolean(m.tip), `${nombre}/${m.key}: el consejo sobra o falta`);
    }
    for (const u of Object.keys(USERS)) {
      assert.ok(pack.users[u]?.subtitle, `${nombre}: falta el subtítulo de ${u}`);
      for (const c of ['estrategia', 'detalle', 'proteinaNota']) {
        assert.ok(pack.targets[u]?.[c], `${nombre}: falta targets.${u}.${c}`);
      }
    }
    // Las etiquetas de las tomas del día de ejemplo
    const slots = [...new Set(Object.values(SAMPLE_DAY).flat().map((i) => i.slot))];
    for (const s of slots) assert.ok(pack.slots[s], `${nombre}: falta la toma "${s}"`);
    assert.equal(pack.ui.wd.length, 7, `${nombre}: faltan días de la semana`);
  }
  console.log(`   idiomas: es + ca + en · ${clavesUI.length} textos de interfaz, ${ejercicios.length} ejercicios, ${MEALS.length} recetas`);
}

// --- versión ---------------------------------------------------------------
// La constante de app.js y version.json TIENEN que ir a la par: si se desincronizan,
// la app avisaría de una actualización que no existe (o peor, no avisaría de la que sí).
{
  const fs = await import('node:fs');
  const enApp = /export const VERSION = '([^']+)'/.exec(fs.readFileSync('app.js', 'utf8'))?.[1];
  const json = JSON.parse(fs.readFileSync('version.json', 'utf8'));
  assert.ok(enApp, 'no se encuentra la constante VERSION en app.js');
  assert.match(enApp, /^\d+\.\d+\.\d+$/, `formato de versión raro: ${enApp}`);
  assert.equal(json.version, enApp, `version.json (${json.version}) != app.js (${enApp})`);
  assert.match(json.date, /^\d{4}-\d{2}-\d{2}$/, 'falta la fecha de la versión');
  // version.json no puede estar en la caché del service worker o la comprobación no sirve
  const sw = fs.readFileSync('sw.js', 'utf8');
  assert.ok(!/'\.\/version\.json'/.test(sw.split('self.addEventListener')[0]),
    'version.json no debe estar en el SHELL cacheado');
  assert.ok(sw.includes("endsWith('/version.json')"), 'el sw debe excluir version.json de la caché');
  console.log(`   versión ${enApp} (${json.date})`);
}

console.log('OK — todas las comprobaciones pasan');
