import { USERS, findDay, allExercises, videoUrl, todaysDay, nextDay } from './routines.js';
import { moveSvg } from './moves.js';
import { TARGETS, MEALS, SAMPLE_DAY, mealByKey, dayTotals, shoppingList } from './nutrition.js';
import * as db from './store.js';
import {
  mesocycleWeek, isDeload, targetRir, effectiveSets, e1rm, groupSessions, suggest, fmt,
} from './progression.js';

const app = document.getElementById('app');
const state = { user: db.getUser(), view: 'home', dayKey: null, open: null, exKey: null, meal: null, override: {}, draft: {} };

// Lo que hay escrito en los inputs pero aún sin guardar. Sin esto, marcar una serie
// re-renderiza la tarjeta y se perderían las repeticiones ya escritas en las otras filas.
function captureDraft(exKey) {
  const card = app.querySelector(`[data-ex="${exKey}"]`);
  if (!card) return;
  const d = {};
  card.querySelectorAll('.sets tbody tr').forEach((tr) => {
    d[tr.dataset.set] = {
      weight: tr.querySelector('[data-f="weight"]')?.value ?? '',
      reps: tr.querySelector('[data-f="reps"]')?.value ?? '',
      rir: tr.querySelector('[data-f="rir"]')?.value ?? '',
    };
  });
  state.draft[exKey] = d;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mmss = (s) => `${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, '0')}`;
const restLabel = (s) => (s % 60 === 0 ? `${s / 60}′` : `${Math.floor(s / 60)}′${s % 60}″`);

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

// ---------------------------------------------------------------------------
// Temporizador de descanso.
// Se calcula por diferencia de timestamp, no contando ticks: así la cuenta sigue
// siendo correcta aunque iOS congele la pestaña o se bloquee la pantalla.
// No suena solo — sin push no hay alarma fiable en iOS con la pantalla apagada.
// ---------------------------------------------------------------------------
const rest = { until: 0, total: 0, label: '' };
const restEl = document.getElementById('rest');

function startRest(seconds, label) {
  rest.until = Date.now() + seconds * 1000;
  rest.total = seconds;
  rest.label = label;
  restEl.hidden = false;
  tickRest();
}
function stopRest() { rest.until = 0; restEl.hidden = true; }
function tickRest() {
  if (!rest.until) return;
  const left = Math.round((rest.until - Date.now()) / 1000);
  document.getElementById('rest-count').textContent = (left < 0 ? '+' : '') + mmss(left);
  document.getElementById('rest-label').textContent = rest.label;
  document.getElementById('rest-sub').textContent =
    left < 0 ? 'Descanso cumplido · a por la siguiente' : `objetivo ${restLabel(rest.total)}`;
  restEl.classList.toggle('over', left < 0);
  if (left === 0 && navigator.vibrate) navigator.vibrate([160, 90, 160]);
}
setInterval(tickRest, 500);
document.getElementById('rest-skip').onclick = stopRest;
document.getElementById('rest-add').onclick = () => { if (rest.until) { rest.until += 30000; rest.total += 30; tickRest(); } };

// ---------------------------------------------------------------------------
// Gráfico de línea en SVG. Sin librerías: para dos gráficos no se justifica una
// dependencia, y encima habría que cachearla para el modo offline.
// ---------------------------------------------------------------------------
function chart(series) {
  const live = series.filter((s) => s.points.length > 0);
  if (live.length === 0 || live.every((s) => s.points.length < 2)) {
    return `<p class="muted">Hacen falta al menos dos registros para dibujar la evolución.</p>`;
  }
  const W = 320, H = 150, PL = 40, PR = 6, PT = 10, PB = 20;
  // Las cifras grandes (tonelaje) se redondean a entero: con decimales el eje se solapa con el trazo.
  const axis = (y) => (Math.abs(y) >= 100 ? String(Math.round(y)) : fmt(Math.round(y * 10) / 10));
  const all = live.flatMap((s) => s.points);
  const xs = all.map((p) => p.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  let minY = Math.min(...all.map((p) => p.y)), maxY = Math.max(...all.map((p) => p.y));
  if (maxY === minY) { maxY += 1; minY -= 1; }
  const pad = (maxY - minY) * 0.12;
  minY -= pad; maxY += pad;
  const px = (x) => PL + (maxX === minX ? (W - PL - PR) / 2 : ((x - minX) / (maxX - minX)) * (W - PL - PR));
  const py = (y) => PT + (1 - (y - minY) / (maxY - minY)) * (H - PT - PB);

  const grid = [maxY, (maxY + minY) / 2, minY]
    .map((y) => `<line class="gr" x1="${PL}" y1="${py(y).toFixed(1)}" x2="${W - PR}" y2="${py(y).toFixed(1)}"/>
       <text class="tx" x="0" y="${(py(y) + 3.5).toFixed(1)}">${axis(y)}</text>`)
    .join('');

  // id único por gráfico: varios <svg> en la misma página no pueden compartir el id del degradado
  const gid = 'g' + Math.random().toString(36).slice(2, 9);

  const lines = live.map((s, i) => {
    const pts = s.points.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
    const dots = s.points.map((p) => `<circle class="${i ? 'dt2' : 'dt'}" cx="${px(p.x).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="2.6"/>`).join('');
    // Relleno de área con degradado solo bajo la serie principal (Kinetic Noir)
    const area = i === 0
      ? `<polygon fill="url(#${gid})" points="${pts} ${(W - PR).toFixed(1)},${(H - PB).toFixed(1)} ${PL},${(H - PB).toFixed(1)}"/>`
      : '';
    return `${area}<polyline class="${i ? 'ln2' : 'ln'}" points="${pts}"/>${dots}`;
  }).join('');

  const dl = new Date(minX).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const dr = new Date(maxX).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#c3f400" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#c3f400" stop-opacity="0"/>
    </linearGradient></defs>
    ${grid}${lines}
    <text class="tx" x="${PL}" y="${H - 5}">${dl}</text>
    <text class="tx" x="${W - PR}" y="${H - 5}" text-anchor="end">${dr}</text>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Contexto del usuario
// ---------------------------------------------------------------------------
function ctx() {
  const u = state.user;
  const user = USERS[u];
  const start = db.getMesocycleStart(u);
  const week = mesocycleWeek(start, db.todayISO());
  return { u, user, start, week };
}

function dayProgress(u, day, week) {
  const today = db.todayISO();
  const sets = db.getSets(u).filter((s) => s.loggedAt === today && s.dayKey === day.key && s.reps > 0);
  const total = day.exercises.reduce((n, ex, i) => n + effectiveSets(ex, week, i === 0), 0);
  return { done: sets.length, total };
}

function lastDoneText(u, day) {
  const dates = [...new Set(db.getSets(u).filter((s) => s.dayKey === day.key && s.reps > 0).map((s) => s.loggedAt))].sort();
  if (dates.length === 0) return 'Nunca registrada';
  const days = Math.round((Date.parse(db.todayISO()) - Date.parse(dates.at(-1))) / 86400000);
  if (days === 0) return 'Hecha hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

// ---------------------------------------------------------------------------
// Vistas
// ---------------------------------------------------------------------------
function viewChooser() {
  app.innerHTML = `
    <div class="chooser">
      <div class="head">
        <div class="kicker">Registro de entrenamiento</div>
        <h1>¿Quién entrena?</h1>
      </div>
      ${Object.entries(USERS).map(([k, v]) => `
        <button class="card tap" data-pick="${k}">
          <h2>${esc(v.name)}</h2>
          <p class="muted" style="margin:8px 0 0">${esc(v.subtitle)}</p>
        </button>`).join('')}
    </div>`;
  app.querySelectorAll('[data-pick]').forEach((b) => {
    b.onclick = () => { state.user = b.dataset.pick; db.setUser(state.user); state.view = 'home'; render(); };
  });
}

/** Qué toca hoy según el calendario del plan. */
function hoyBanner(u) {
  const hoy = todaysDay(u);
  if (hoy) {
    const p = dayProgress(u, hoy, mesocycleWeek(db.getMesocycleStart(u), db.todayISO()));
    return `<div class="note today-note">
      <strong>Hoy toca ${esc(hoy.name)}</strong> — ${esc(hoy.subtitle)}.
      ${p.done >= p.total && p.total > 0 ? ' Ya la has completado, buen trabajo.' : ''}
    </div>`;
  }
  const sig = nextDay(u);
  return `<div class="note">
    <strong>Hoy toca descansar.</strong> ${sig
      ? `La próxima sesión es <strong>${esc(sig.day.name)}</strong>, ${sig.enDias === 1 ? 'mañana' : `en ${sig.enDias} días`}.`
      : ''} Descansar forma parte del plan: es cuando el músculo se construye.
  </div>`;
}

function viewHome() {
  const { u, user, week } = ctx();
  const dl = isDeload(week);
  const hoy = todaysDay(u);
  const body = db.getBody(u);
  const lastBody = body.at(-1);

  app.innerHTML = `
    ${header(user.name, user.subtitle, false)}
    <div class="week ${dl ? 'deload' : ''}">
      <div class="row">
        <div>
          <div class="lbl">Semana del mesociclo</div>
          <div class="big">${week} <span style="font-size:15px;opacity:.8">de 5</span></div>
        </div>
        <div style="text-align:right">
          <div class="lbl">RIR objetivo</div>
          <div class="big">${esc(user.weekLabels[week - 1])}</div>
        </div>
      </div>
      <div class="week-grid">${[1, 2, 3, 4, 5].map((w) => `<div class="week-dot ${w <= week ? 'on' : ''}"></div>`).join('')}</div>
      <div class="hint">${dl
        ? 'Descarga: mismo peso, la mitad de las series y lejos del fallo. No la saltes.'
        : week === 3 ? 'Se añade una serie al primer ejercicio de cada sesión.'
        : week === 4 ? 'Semana pico: la más dura del bloque.'
        : 'Anota cada serie. Lo que no se anota, no progresa.'}</div>
    </div>

    ${hoyBanner(u)}

    ${user.days.map((d) => {
      const p = dayProgress(u, d, week);
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      const esHoy = hoy?.key === d.key;
      return `<button class="card tap ${esHoy ? 'today' : ''}" data-day="${d.key}">
        <div class="row">
          <div style="min-width:0">
            <div class="kicker">${esc(d.weekday)}${esHoy ? ' <span class="chip-hoy">Hoy</span>' : ''}</div>
            <h2>${esc(d.name)}</h2>
            <p class="muted" style="margin:3px 0 0">${esc(d.subtitle)}</p>
          </div>
          <div style="text-align:right;flex:0 0 auto">
            <div class="muted" style="font-size:12px">${esc(lastDoneText(u, d))}</div>
            <div class="n" style="font-size:19px;color:${pct ? 'var(--lime)' : 'var(--outline)'}">${p.done}/${p.total}</div>
          </div>
        </div>
      </button>`;
    }).join('')}

    <button class="card tap" data-go="body">
      <div class="row">
        <div>
          <div class="kicker">Seguimiento</div>
          <h2>Peso corporal y cintura</h2>
        </div>
        <div class="n" style="text-align:right;font-size:19px;color:var(--lime)">
          ${lastBody?.weightKg ? fmt(lastBody.weightKg) + ' kg' : '—'}
        </div>
      </div>
    </button>
    ${tabs('home')}`;

  app.querySelectorAll('[data-day]').forEach((b) => {
    b.onclick = () => { state.dayKey = b.dataset.day; state.view = 'day'; state.open = null; state.override = {}; state.draft = {}; render(); };
  });
  app.querySelector('[data-go="body"]').onclick = () => { state.view = 'body'; render(); };
  wireTabs();
}

function header(title, sub, back) {
  return `<div class="top">
    ${back ? '<button class="back" id="back">‹ Atrás</button>' : ''}
    <h1>${esc(title)}<span class="sub">${esc(sub)}</span></h1>
  </div>`;
}

// Iconos de la barra inferior. SVG en vez de glifos de texto: los símbolos tipográficos
// (☰ ◍ ◔) se ven distintos en cada dispositivo y no encajan con el trazo fino del diseño.
const svgIcon = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  // mancuerna
  home: svgIcon('<path d="M3 9.5v5M6.5 6.5v11M17.5 6.5v11M21 9.5v5M6.5 12h11"/>'),
  // manzana con hoja
  diet: svgIcon(`<path d="M12 21.2c-2.9 0-5-3.4-5-7 0-3.3 1.9-5 3.9-4.6.7.15 1.5.15 2.2 0 2-.4 3.9 1.3 3.9 4.6 0 3.6-2.1 7-5 7Z"/>
     <path d="M12 9.6V6.4"/>
     <path d="M12.6 6.9c1.3-2.2 4-2.4 4-2.4s-.3 2.7-2.6 3.2"/>`),
  // línea de progreso ascendente
  progress: svgIcon('<path d="M4 19.5h16"/><path d="M5 15.5l4.5-4.5 3 3L19 6.5"/><path d="M14.8 6.5H19v4.2"/>'),
  // controles deslizantes
  settings: svgIcon('<path d="M3.5 7.5h12.2M20.5 7.5h.2M8.2 16.5h12.3M3.5 16.5h.2"/><circle cx="18" cy="7.5" r="2.2"/><circle cx="6" cy="16.5" r="2.2"/>'),
};

function tabs(active) {
  const items = [['home', 'Entreno'], ['diet', 'Dieta'], ['progress', 'Progreso'], ['settings', 'Ajustes']];
  return `<nav class="tabs">${items.map(([k, l]) =>
    `<button data-tab="${k}" class="${active === k ? 'on' : ''}"><span class="ic">${ICONS[k]}</span>${l}</button>`).join('')}</nav>`;
}

function wireTabs() {
  app.querySelectorAll('[data-tab]').forEach((b) => {
    b.onclick = () => { state.view = b.dataset.tab; state.open = null; state.meal = null; render(); };
  });
  const back = document.getElementById('back');
  if (back) back.onclick = () => { state.view = 'home'; state.open = null; render(); };
}

function viewDay() {
  const { u, user, week } = ctx();
  const day = findDay(u, state.dayKey);
  if (!day) { state.view = 'home'; return render(); }
  const today = db.todayISO();

  // Aviso si esta no es la sesión que toca hoy. No bloquea: solo avisa.
  const hoy = todaysDay(u);
  const fuera = !hoy || hoy.key !== day.key;
  const avisoDia = !fuera ? '' : `<div class="note warn">
    <strong>Hoy no toca esta sesión.</strong> ${hoy
      ? `Según el plan, hoy te toca <strong>${esc(hoy.name)}</strong>.`
      : 'Hoy es día de descanso en tu plan.'}
    Puedes hacerla igual y se registrará con normalidad, pero si cambias el orden a menudo
    acabarás entrenando unos grupos de más y otros de menos.
  </div>`;

  app.innerHTML = `
    ${header(day.name, `${day.subtitle} · semana ${week} · RIR ${user.weekLabels[week - 1]}`, true)}
    ${avisoDia}
    ${isDeload(week) ? '<div class="note warn"><strong>Semana de descarga.</strong> Series reducidas a la mitad y RIR 4: mismo peso, lejos del fallo.</div>' : ''}
    <div id="ex-list">${day.exercises.map((ex, i) => exerciseCard(u, day, ex, i, week, today)).join('')}</div>
    <details class="card">
      <summary style="font-weight:600;cursor:pointer">Calentamiento</summary>
      <p class="cue">${esc(day.warmup)}</p>
    </details>
    ${tabs('home')}`;

  wireDay(u, day, week, today);
  wireTabs();
}

function exerciseCard(u, day, ex, i, week, today) {
  const nSets = effectiveSets(ex, week, i === 0);
  const history = db.getSetsFor(u, ex.key).filter((s) => s.loggedAt !== today);
  const s = suggest(ex, history, week);
  const target = targetRir(ex, week);
  const logged = db.getSets(u).filter((r) => r.loggedAt === today && r.exerciseKey === ex.key);
  const doneCount = logged.filter((r) => r.reps > 0).length;
  const isOpen = state.open === ex.key;
  const bw = ex.unit === 'peso-corporal';
  const w = state.override[ex.key] ?? s.weight;
  const unitTxt = ex.unit === 'kg-por-mano' ? 'kg por mano' : 'kg';

  const draft = state.draft[ex.key] || {};
  const rows = Array.from({ length: nSets }, (_, k) => {
    const r = logged.find((x) => x.setIndex === k);
    const done = r && r.reps > 0;
    const d = draft[k] || {};
    // Prioridad: lo guardado > lo escrito sin guardar > la sugerencia
    const vW = r?.weight ?? (d.weight !== '' && d.weight != null ? d.weight : w ?? '');
    const vR = r?.reps ?? d.reps ?? '';
    const vI = r?.rir ?? d.rir ?? '';
    return `<tr class="${done ? 'done' : ''}" data-set="${k}">
      <td>${k + 1}</td>
      ${bw ? '' : `<td><input type="number" inputmode="decimal" step="0.5" min="0" data-f="weight" value="${vW}" aria-label="Peso serie ${k + 1}"></td>`}
      <td><input type="number" inputmode="numeric" min="0" data-f="reps" value="${vR}" placeholder="${ex.repMin}-${ex.repMax}" aria-label="Repeticiones serie ${k + 1}"></td>
      <td><input type="number" inputmode="numeric" min="0" max="5" step="0.5" data-f="rir" value="${vI}" placeholder="${fmt(target)}" aria-label="RIR serie ${k + 1}"></td>
      <td style="width:48px"><button class="tick ${done ? 'on' : ''}" data-tick="${k}" aria-label="Guardar serie ${k + 1}">✓</button></td>
    </tr>`;
  }).join('');

  return `<div class="card ${doneCount >= nSets ? 'is-done' : ''}" data-ex="${ex.key}">
    <button class="ex-head" data-toggle="${ex.key}" aria-expanded="${isOpen}">
      <span class="ex-idx">${i + 1}</span>
      <span class="ex-name">${esc(ex.name)}
        <span class="ex-spec">${nSets} × ${ex.timed ? `${ex.repMin}-${ex.repMax}″` : `${ex.repMin}-${ex.repMax}`} · RIR ${fmt(target)} · ${restLabel(ex.restSec)}</span>
      </span>
      <span class="ex-state ${doneCount >= nSets ? 'done' : ''}">${doneCount}/${nSets}</span>
    </button>

    ${isOpen ? `
      <div class="suggest">
        <div class="n">${bw ? 'Peso corporal' : `${fmt(w)} <small>${unitTxt}</small>`}</div>
        <div class="why">${esc(s.reason)}</div>
        ${s.last ? `<div class="last">Última vez · ${esc(s.last)}</div>` : ''}
        ${bw ? '' : `<div class="nudge">
          <button data-nudge="-1" aria-label="Bajar peso">−</button>
          <button data-nudge="1" aria-label="Subir peso">+</button>
          <span class="muted" style="font-size:12px">ajusta si el RIR real no cuadra</span>
        </div>`}
      </div>
      <table class="sets">
        <thead><tr><th>#</th>${bw ? '' : '<th>Peso</th>'}<th>${ex.timed ? 'Seg.' : 'Reps'}</th><th>RIR</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tech">
        ${moveSvg(ex.pattern) || ''}
        <div class="tech-txt">
          <p class="cue">${esc(ex.cue)}</p>
          <a class="vid" href="${videoUrl(ex)}" target="_blank" rel="noopener">▶ Ver vídeo real</a>
        </div>
      </div>
    ` : ''}
  </div>`;
}

function wireDay(u, day, week, today) {
  app.querySelectorAll('[data-toggle]').forEach((b) => {
    b.onclick = () => { state.open = state.open === b.dataset.toggle ? null : b.dataset.toggle; render(); };
  });

  const openEx = day.exercises.find((e) => e.key === state.open);
  if (!openEx) return;
  const card = app.querySelector(`[data-ex="${state.open}"]`);
  if (!card) return;

  card.querySelectorAll('[data-nudge]').forEach((b) => {
    b.onclick = () => {
      const step = Math.abs(openEx.increment || 2.5) * Number(b.dataset.nudge);
      const cur = state.override[openEx.key] ?? suggest(openEx, db.getSetsFor(u, openEx.key).filter((s) => s.loggedAt !== today), week).weight;
      state.override[openEx.key] = Math.max(0, Math.round((cur + step) * 100) / 100);
      captureDraft(openEx.key);
      // El nuevo peso debe verse en todas las filas sin guardar, así que soltamos el peso
      // del borrador pero conservamos repeticiones y RIR ya escritos.
      Object.values(state.draft[openEx.key] || {}).forEach((d) => { d.weight = ''; });
      render();
    };
  });

  card.querySelectorAll('[data-tick]').forEach((btn) => {
    btn.onclick = () => {
      const tr = btn.closest('tr');
      const idx = Number(btn.dataset.tick);
      const get = (f) => tr.querySelector(`[data-f="${f}"]`)?.value ?? '';
      const reps = get('reps');
      if (!reps) { toast('Anota las repeticiones antes de marcar la serie'); return; }
      const weight = openEx.unit === 'peso-corporal' ? 0 : get('weight');
      captureDraft(openEx.key);
      db.logSet(u, { dayKey: day.key, exerciseKey: openEx.key, setIndex: idx, weight, reps, rir: get('rir') });
      startRest(openEx.restSec, `${openEx.name} · serie ${idx + 1}`);
      render();
      sync(true);
    };
  });
}

/**
 * Lectura del histórico en lenguaje llano: qué sube, qué está parado y cuánto entrenas.
 * Es lo que sirve para decidir si hay que tocar el plan.
 */
function summarize(u) {
  const list = allExercises(u);
  const sets = db.getSets(u).filter((s) => s.reps > 0);
  const dates = [...new Set(sets.map((s) => s.loggedAt))].sort();

  const subiendo = [], parados = [];
  for (const ex of list) {
    const ses = groupSessions(sets.filter((s) => s.exerciseKey === ex.key));
    if (ses.length < 3) continue;
    const peso = (s) => Math.max(0, ...s.sets.map((x) => x.weight || 0));
    const best = (s) => Math.max(0, ...s.sets.map((x) => e1rm(x.weight, x.reps)));
    // e1RM incluye las repeticiones: en peso corporal el peso no cambia pero el e1RM sí
    const ref = ex.unit === 'peso-corporal'
      ? (s) => Math.max(0, ...s.sets.map((x) => x.reps || 0))
      : best;
    const ahora = ref(ses[0]), antes = ref(ses[Math.min(2, ses.length - 1)]);
    if (antes > 0 && ahora > antes * 1.01) subiendo.push({ ex, pct: (ahora / antes - 1) * 100 });
    else if (antes > 0 && ahora <= antes) parados.push({ ex, sesiones: ses.length, peso: peso(ses[0]) });
  }
  subiendo.sort((a, b) => b.pct - a.pct);

  // sesiones de las últimas 4 semanas
  const hace28 = Date.parse(db.todayISO()) - 28 * 86400000;
  const recientes = dates.filter((d) => Date.parse(d) >= hace28).length;

  const body = db.getBody(u).filter((b) => b.weightKg);
  let peso = null;
  if (body.length >= 2) {
    const viejo = body.find((b) => Date.parse(b.loggedAt) >= hace28) || body[0];
    peso = { delta: body.at(-1).weightKg - viejo.weightKg, actual: body.at(-1).weightKg };
  }
  const cint = db.getBody(u).filter((b) => b.waistCm);
  const cintura = cint.length >= 2 ? cint.at(-1).waistCm - cint[0].waistCm : null;

  return { subiendo, parados, recientes, totalSesiones: dates.length, peso, cintura };
}

function viewSummary(u) {
  const s = summarize(u);
  if (s.totalSesiones === 0) {
    return `<div class="card"><div class="kicker">Resumen</div>
      <p class="muted" style="margin:8px 0 0">Registra unas cuantas sesiones y aquí aparecerá qué ejercicios
      progresan, cuáles se han parado y cuánto estás entrenando.</p></div>`;
  }
  const li = (t) => `<li>${t}</li>`;
  return `<div class="card">
    <div class="kicker">Resumen</div>
    <div class="stats">
      <div><span class="n">${s.recientes}</span><em>sesiones en 4 semanas</em></div>
      <div><span class="n">${s.subiendo.length}</span><em>ejercicios subiendo</em></div>
      <div><span class="n ${s.parados.length ? 'warnv' : ''}">${s.parados.length}</span><em>estancados</em></div>
    </div>
    <ul class="bullets">
      ${s.recientes >= 14 ? li('Adherencia muy buena: 3-4 sesiones por semana sostenidas.')
        : s.recientes >= 8 ? li('Adherencia correcta. Con una sesión más por semana el progreso se nota antes.')
        : li('<strong>Estás entrenando poco</strong> para el plan: son 4 días por semana. La constancia pesa más que cualquier ajuste de la rutina.')}
      ${s.subiendo.length ? li(`Mejor progresión: <strong>${esc(s.subiendo[0].ex.name)}</strong> (+${Math.round(s.subiendo[0].pct)} % en las últimas 3 sesiones).`) : ''}
      ${s.parados.length >= 3
        ? li(`<strong>${s.parados.length} ejercicios llevan varias sesiones sin subir.</strong> Si es general, casi siempre es comida o descanso, no el programa.`)
        : s.parados.length ? li(`Sin avance en: ${s.parados.map((p) => esc(p.ex.name)).join(', ')}. Prueba a bajar 5 % el peso y reconstruir.`) : ''}
      ${s.peso ? li(`Peso corporal: <strong>${fmt(Math.round(s.peso.actual * 10) / 10)} kg</strong> (${s.peso.delta >= 0 ? '+' : ''}${fmt(Math.round(s.peso.delta * 10) / 10)} kg en 4 semanas).`) : ''}
      ${s.cintura != null ? li(`Cintura: <strong>${s.cintura <= 0 ? '' : '+'}${fmt(Math.round(s.cintura * 10) / 10)} cm</strong> desde el primer registro.`) : ''}
    </ul>
    <p class="muted" style="margin:12px 0 0;font-size:13px">Todo esto sale de tu propio registro. Para revisarlo
    con calma o compartirlo, en Ajustes puedes descargar el histórico completo en JSON.</p>
  </div>`;
}

function viewProgress() {
  const { u, user } = ctx();
  const list = allExercises(u);
  const key = state.exKey && list.some((e) => e.key === state.exKey) ? state.exKey : list[0].key;
  state.exKey = key;
  const ex = list.find((e) => e.key === key);
  const sessions = groupSessions(db.getSetsFor(u, key)).slice().reverse();

  const points = sessions.map((ses) => {
    const best = ses.sets.filter((s) => s.reps > 0).reduce((m, s) => Math.max(m, e1rm(s.weight, s.reps)), 0);
    return { x: Date.parse(ses.date), y: Math.round(best * 10) / 10 };
  }).filter((p) => p.y > 0);

  const volume = sessions.map((ses) => ({
    x: Date.parse(ses.date),
    y: ses.sets.reduce((n, s) => n + (s.weight || 0) * (s.reps || 0), 0),
  })).filter((p) => p.y > 0);

  app.innerHTML = `
    ${header('Progreso', user.name, false)}
    ${viewSummary(u)}
    <select class="picker" id="ex-pick">
      ${USERS[u].days.map((d) => `<optgroup label="${esc(d.name)}">
        ${d.exercises.map((e) => `<option value="${e.key}" ${e.key === key ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}
      </optgroup>`).join('')}
    </select>

    <div class="card">
      <div class="kicker">1RM estimado (Epley)</div>
      <h3>${esc(ex.name)}</h3>
      <p class="muted" style="margin:4px 0 0">Sube aunque el peso en la barra se quede quieto. Es la métrica honesta en déficit calórico.</p>
      ${chart([{ points }])}
    </div>

    ${volume.length > 1 ? `<div class="card">
      <div class="kicker">Tonelaje por sesión</div>
      <p class="muted" style="margin:0">Peso × repeticiones sumado en todas las series.</p>
      ${chart([{ points: volume }])}
    </div>` : ''}

    <div class="card">
      <div class="kicker">Historial</div>
      ${sessions.length === 0 ? '<p class="muted" style="margin:8px 0 0">Todavía no has registrado este ejercicio.</p>' : `
      <table class="hist">
        <thead><tr><th>Fecha</th><th>Series</th><th>Peso</th><th>e1RM</th></tr></thead>
        <tbody>${sessions.slice().reverse().slice(0, 12).map((ses) => {
          const d = ses.sets.filter((s) => s.reps > 0);
          const wmax = Math.max(0, ...d.map((s) => s.weight || 0));
          const best = Math.max(0, ...d.map((s) => e1rm(s.weight, s.reps)));
          return `<tr>
            <td>${new Date(ses.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</td>
            <td>${d.map((s) => s.reps).join('/') || '—'}</td>
            <td>${wmax ? fmt(wmax) + ' kg' : '—'}</td>
            <td>${best ? fmt(Math.round(best * 10) / 10) : '—'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>`}
    </div>
    ${tabs('progress')}`;

  document.getElementById('ex-pick').onchange = (e) => { state.exKey = e.target.value; render(); };
  wireTabs();
}

function viewBody() {
  const { u } = ctx();
  const rows = db.getBody(u);
  const wPoints = rows.filter((r) => r.weightKg).map((r) => ({ x: Date.parse(r.loggedAt), y: r.weightKg }));
  const cPoints = rows.filter((r) => r.waistCm).map((r) => ({ x: Date.parse(r.loggedAt), y: r.waistCm }));

  app.innerHTML = `
    ${header('Peso y cintura', USERS[u].name, true)}
    <div class="note">Compara <strong>promedios semanales</strong>, nunca días sueltos. La cintura es el mejor
    indicador: si baja, vas bien aunque la báscula se atasque.</div>

    <div class="card">
      <div class="field"><label for="bw">Peso corporal (kg)</label>
        <input id="bw" type="number" inputmode="decimal" step="0.1" placeholder="${rows.at(-1)?.weightKg ?? ''}"></div>
      <div class="field"><label for="wc">Cintura (cm) — opcional</label>
        <input id="wc" type="number" inputmode="decimal" step="0.5" placeholder="${rows.at(-1)?.waistCm ?? ''}"></div>
      <button class="btn primary wide" id="save-body">Guardar de hoy</button>
    </div>

    <div class="card">
      <div class="kicker">Evolución</div>
      ${chart([{ points: wPoints }, { points: cPoints }])}
      <div class="legend">
        <span><i class="swatch" style="background:var(--lime)"></i>Peso (kg)</span>
        <span><i class="swatch" style="background:var(--fg-var)"></i>Cintura (cm)</span>
      </div>
    </div>

    ${rows.length ? `<div class="card"><div class="kicker">Registros</div>
      <table class="hist">
        <thead><tr><th>Fecha</th><th>Peso</th><th>Cintura</th></tr></thead>
        <tbody>${rows.slice().reverse().slice(0, 14).map((r) => `<tr>
          <td>${new Date(r.loggedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</td>
          <td>${r.weightKg ? fmt(r.weightKg) + ' kg' : '—'}</td>
          <td>${r.waistCm ? fmt(r.waistCm) + ' cm' : '—'}</td>
        </tr>`).join('')}</tbody>
      </table></div>` : ''}
    ${tabs('home')}`;

  document.getElementById('save-body').onclick = () => {
    const w = document.getElementById('bw').value;
    const c = document.getElementById('wc').value;
    if (!w && !c) { toast('Escribe al menos un valor'); return; }
    db.logBody(u, { weightKg: w, waistCm: c });
    toast('Guardado');
    render();
    sync(true);
  };
  wireTabs();
}

const CATS = [['desayuno', 'Desayunos'], ['comida', 'Comidas'], ['cena', 'Cenas'], ['snack', 'Snacks']];

function viewDiet() {
  const { u, user } = ctx();
  const t = TARGETS[u];
  const tot = dayTotals(u);
  const difKcal = Math.round(tot.kcal - t.kcal);

  const mealCard = (m, slot, half) => {
    const abierto = state.meal === m.key;
    const f = half ? 0.5 : 1;
    return `<div class="card meal ${abierto ? 'open' : ''}" data-meal="${m.key}">
      <button class="ex-head" data-openmeal="${m.key}" aria-expanded="${abierto}">
        <span class="ex-name">${slot ? `<span class="slot">${esc(slot)}</span>` : ''}${esc(m.name)}${half ? ' <em class="muted">(media ración)</em>' : ''}
          <span class="ex-spec">${Math.round(m.kcal * f)} kcal · ${Math.round(m.prot * f)} g proteína · ${m.min} min · ≈${fmt(Math.round(m.price * f * 100) / 100)} €</span>
        </span>
        <span class="ex-state">${abierto ? '−' : '+'}</span>
      </button>
      ${abierto ? `
        <div class="recipe">
          <h4>Ingredientes</h4>
          <ul>${m.ingredients.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
          <h4>Preparación</h4>
          <ol>${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          ${m.tip ? `<p class="tip">${esc(m.tip)}</p>` : ''}
        </div>` : ''}
    </div>`;
  };

  app.innerHTML = `
    ${header('Dieta', user.name, false)}

    <div class="week">
      <div class="lbl">${esc(t.estrategia)}</div>
      <div class="big">${t.kcal} <span style="font-size:15px">kcal/día</span></div>
      <div class="macros">
        <div><span class="n">${t.prot}</span><em>g proteína</em></div>
        <div><span class="n">${t.carb}</span><em>g carbos</em></div>
        <div><span class="n">${t.fat}</span><em>g grasas</em></div>
      </div>
      <div class="hint">${esc(t.detalle)}</div>
    </div>

    <div class="note"><strong>Proteína:</strong> ${esc(t.proteinaNota)}</div>

    <div class="card">
      <div class="kicker">Día de ejemplo</div>
      <p class="muted" style="margin:4px 0 0">Suma <strong>${Math.round(tot.kcal)} kcal</strong> y
      <strong>${Math.round(tot.prot)} g</strong> de proteína, por unos <strong>${fmt(Math.round(tot.price * 100) / 100)} €</strong> al día.
      ${Math.abs(difKcal) <= 120
        ? 'Cuadra con tu objetivo.'
        : `Se queda ${difKcal > 0 ? `${difKcal} kcal por encima` : `${-difKcal} kcal por debajo`}: ajusta con la ración de arroz, pasta o pan.`}</p>
    </div>

    ${SAMPLE_DAY[u].map((it) => mealCard(mealByKey(it.key), it.slot, it.half)).join('')}

    <div class="card">
      <button class="btn wide" id="lista">Ver lista de la compra del día</button>
    </div>

    <div class="sec-title">Todas las recetas</div>
    ${CATS.map(([c, label]) => `
      <div class="kicker" style="margin:16px 0 8px">${label}</div>
      ${MEALS.filter((m) => m.cat === c).map((m) => mealCard(m, null, false)).join('')}
    `).join('')}

    <div class="note" style="margin-top:16px">
      Las calorías son estimaciones de tablas estándar y los precios son orientativos: cambian
      cada temporada. Sirven para acertar el objetivo con un margen del 5-10 %, que es lo que importa.
    </div>
    ${tabs('diet')}`;

  app.querySelectorAll('[data-openmeal]').forEach((b) => {
    b.onclick = () => { state.meal = state.meal === b.dataset.openmeal ? null : b.dataset.openmeal; render(); };
  });
  document.getElementById('lista').onclick = () => {
    const l = shoppingList(u);
    toast(`${l.length} productos — mira la ficha de cada receta`);
    navigator.clipboard?.writeText('Lista de la compra\n\n' + l.map((i) => '- ' + i).join('\n'))
      .then(() => toast('Lista copiada al portapapeles')).catch(() => {});
  };
  wireTabs();
}

function viewSettings() {
  const { u, user, start, week } = ctx();
  const pend = db.pendingCount();
  const last = db.getLastSync();

  app.innerHTML = `
    ${header('Ajustes', user.name, false)}

    <div class="card">
      <div class="kicker">Sincronización</div>
      <div class="sync" style="margin:6px 0 10px">
        <span class="dot ${!db.isConfigured() ? '' : pend ? 'wait' : 'ok'}"></span>
        ${!db.isConfigured()
          ? 'Solo local — Supabase sin configurar'
          : pend ? `${pend} registro(s) pendientes de subir` : 'Todo sincronizado'}
      </div>
      ${last ? `<p class="muted" style="margin:0 0 10px">Última subida: ${new Date(last).toLocaleString('es-ES')}</p>` : ''}
      <div class="btn-row">
        <button class="btn" id="do-sync" ${db.isConfigured() ? '' : 'disabled'}>Sincronizar ahora</button>
        <button class="btn" id="do-export">Descargar copia</button>
        <button class="btn" id="do-import">Restaurar copia</button>
      </div>
      <input type="file" id="file" accept="application/json" hidden>
      ${!db.isConfigured() ? `<div class="note warn" style="margin:12px 0 0">Sin Supabase configurado los datos viven
        solo en este móvil. <strong>Safari puede borrarlos si no abres la app en ~7 días.</strong> Descarga una copia de vez en cuando.</div>` : ''}
    </div>

    <div class="card">
      <div class="kicker">Mesociclo</div>
      <p class="muted" style="margin:4px 0 10px">Semana <strong>${week} de 5</strong> · empezó el
        ${new Date(start).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div class="field"><label for="meso">Fecha de inicio</label>
        <input id="meso" type="date" value="${start}"></div>
      <button class="btn wide" id="reset-meso">Empezar un mesociclo nuevo hoy</button>
    </div>

    <div class="card">
      <div class="kicker">Cuenta</div>
      <button class="btn wide ghost" id="switch">Cambiar de usuario</button>
    </div>

    <div class="note">
      <strong>Sobre el temporizador:</strong> la cuenta es correcta aunque bloquees el móvil, pero
      <strong>no suena solo</strong>. iOS no permite alarmas fiables en segundo plano sin notificaciones push.
    </div>
    ${tabs('settings')}`;

  document.getElementById('do-sync').onclick = async () => {
    toast('Sincronizando…');
    const r = await sync(false);
    toast(r.ok ? (r.sent ? `${r.sent} registro(s) subidos` : 'Nada pendiente') : `Error: ${r.error}`);
    render();
  };

  document.getElementById('do-export').onclick = () => {
    const blob = new Blob([JSON.stringify(db.exportAll(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `entreno-${db.todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const file = document.getElementById('file');
  document.getElementById('do-import').onclick = () => file.click();
  file.onchange = async () => {
    const f = file.files?.[0];
    if (!f) return;
    try {
      db.importAll(JSON.parse(await f.text()));
      toast('Copia restaurada');
      render();
    } catch (err) {
      toast('Archivo no válido');
    }
  };

  document.getElementById('meso').onchange = (e) => {
    if (e.target.value) { db.setMesocycleStart(u, e.target.value); render(); }
  };
  document.getElementById('reset-meso').onclick = () => {
    db.setMesocycleStart(u, db.todayISO());
    toast('Mesociclo reiniciado en la semana 1');
    render();
  };
  document.getElementById('switch').onclick = () => {
    state.user = null; db.setUser(null); state.view = 'home'; render();
  };
  wireTabs();
}

// ---------------------------------------------------------------------------
async function sync(silent) {
  if (!db.isConfigured()) return { ok: false, error: 'sin-configurar' };
  const remoteKeys = Object.fromEntries(Object.entries(USERS).map(([k, v]) => [k, v.remoteKey]));
  const r = await db.syncNow(remoteKeys);
  if (!silent && !r.ok && r.error !== 'sin-configurar') console.warn('sync', r.error);
  return r;
}

// Al cambiar de pantalla hay que volver arriba. Si no, iOS conserva el scroll de la
// pantalla anterior y, cuando la nueva es más corta, la barra inferior fija se queda
// flotando con un hueco negro debajo hasta que tocas el scroll.
// Solo en cambio de vista: al re-renderizar tras marcar una serie hay que quedarse donde estás.
let lastView = null;
function render() {
  if (!state.user || !USERS[state.user]) return viewChooser();
  ({ home: viewHome, day: viewDay, diet: viewDiet, progress: viewProgress, body: viewBody, settings: viewSettings }[state.view] || viewHome)();
  const viewId = `${state.view}:${state.dayKey || ''}`;
  if (viewId !== lastView) {
    lastView = viewId;
    window.scrollTo(0, 0);
  }
}

document.addEventListener('gym:storage-error', () =>
  toast('No se pudo guardar. ¿Navegación privada o memoria llena?'));
addEventListener('online', () => sync(true));

render();
sync(true);
