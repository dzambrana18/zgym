import { EXERCISES, DAYS, findDay, allExercises, videoUrl, todaysDay, nextDay, weekdayIndex } from './routines.js';
import { login, signup, resolveRoutine, materialize, normalizeUsername, validPin, hashPin, exOverrides } from './accounts.js';
import { moveSvg } from './moves.js';
import { TARGETS, MEALS, SAMPLE_DAY, mealByKey, dayTotals, shoppingList } from './nutrition.js';
import {
  t, getLang, setLang, LANGS, locale, exName, exCue, dayName, daySubtitle, dayWarmup,
  mealName, mealTip, mealIngredients, mealSteps, userSubtitle, targetField, weekdayName, slotName,
} from './i18n.js';
import * as db from './store.js';
import {
  mesocycleWeek, isDeload, targetRir, effectiveSets, e1rm, groupSessions, suggest, fmt,
} from './progression.js';

// Versión de esta copia de la app. Va emparejada con version.json, que se sirve
// SIEMPRE desde la red: si no coinciden es que el móvil tiene una copia vieja
// cacheada. progression.test.mjs comprueba que las dos no se desincronicen.
export const VERSION = '1.5.0';

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
    left < 0 ? t('restDone') : t('restTarget', restLabel(rest.total));
  // La pista se vacía con el tiempo restante: es el único movimiento continuo de la app
  // y es información real, no decoración.
  document.getElementById('rest-bar').style.width =
    `${Math.max(0, Math.min(100, (left / rest.total) * 100))}%`;
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
    return `<p class="muted">${t('needTwo')}</p>`;
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

  // Solo trazo: el relleno de área bajo la línea tapaba la rejilla y no añadía dato.
  const lines = live.map((s, i) => {
    const pts = s.points.map((p) => `${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
    const dots = s.points.map((p) => `<circle class="${i ? 'dt2' : 'dt'}" cx="${px(p.x).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="2.4"/>`).join('');
    return `<polyline class="${i ? 'ln2' : 'ln'}" points="${pts}"/>${dots}`;
  }).join('');

  const dl = new Date(minX).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
  const dr = new Date(maxX).toLocaleDateString(locale(), { day: 'numeric', month: 'short' });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
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
  // La rutina sale de la fila de cuenta cacheada: builtin (anna/david/jan, viven en
  // routines.js) o JSON con refs al catálogo (usuarios creados desde la app).
  const user = resolveRoutine(db.getAccount(u));
  const start = db.getMesocycleStart(u);
  const week = mesocycleWeek(start, db.todayISO());
  return { u, user, start, week };
}

/**
 * Lunes de la semana en curso, en ISO. La rutina se organiza por día de la semana, así
 * que la ventana natural para "¿esto ya está hecho?" es la semana de calendario.
 */
function weekStartISO() {
  const d = new Date(`${db.todayISO()}T00:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // getDay(): 0 = domingo
  return db.todayISO(d);
}

/**
 * Series registradas de una sesión desde `since` (fechas ISO, se comparan como texto).
 * Por defecto mira solo hoy, que es lo que quiere la pantalla de la sesión abierta; la
 * lista del inicio pasa el lunes, porque una sesión hecha ayer tiene que verse hecha.
 */
function dayProgress(u, day, week, since = db.todayISO()) {
  const sets = db.getSets(u).filter((s) => s.loggedAt >= since && s.dayKey === day.key && s.reps > 0);
  const total = day.exercises.reduce((n, ex, i) => n + effectiveSets(ex, week, i === 0), 0);
  // Repetir la misma sesión dos veces en la semana no puede dar más del 100 %.
  return { done: Math.min(sets.length, total), total };
}

function lastDoneText(u, day) {
  const dates = [...new Set(db.getSets(u).filter((s) => s.dayKey === day.key && s.reps > 0).map((s) => s.loggedAt))].sort();
  if (dates.length === 0) return t('neverLogged');
  const days = Math.round((Date.parse(db.todayISO()) - Date.parse(dates.at(-1))) / 86400000);
  if (days === 0) return t('doneToday');
  if (days === 1) return t('yesterday');
  return t('daysAgo', days);
}

// ---------------------------------------------------------------------------
// Vistas
// ---------------------------------------------------------------------------
function viewLogin() {
  tabsEl.hidden = true;   // sin sesión no hay navegación
  // Un móvil que viene de la versión sin login tiene gym.user pero no cuenta cacheada:
  // se le precarga su usuario y solo tiene que poner el PIN una vez.
  const previo = db.getUser();
  app.innerHTML = `
    <div class="gate">
      <img class="gate-img" src="./photos/barbell-squat-0.jpg" alt="" decoding="async">
      <header class="gate-mark">
        <h1>zgym</h1>
        <p>${t('loginKicker')}</p>
      </header>

      <div class="gate-form">
        <label class="fld">
          <span class="fld-ic" aria-hidden="true">${ICONS.user}</span>
          <input id="lg-user" placeholder="${t('loginUser')}" aria-label="${t('loginUser')}"
            autocapitalize="none" autocomplete="username" value="${esc(previo || '')}">
        </label>
        <label class="fld">
          <span class="fld-ic" aria-hidden="true">${ICONS.lock}</span>
          <input id="lg-pin" type="password" placeholder="${t('loginPin')}" aria-label="${t('loginPin')}"
            autocomplete="current-password" maxlength="20">
          <button class="fld-eye" id="lg-eye" type="button" aria-label="${t('loginShowPin')}">${ICONS.eye}</button>
        </label>

        <button class="btn primary wide" id="lg-go">${t('loginBtn')}</button>
        <button class="gate-alt" id="lg-new">
          <span>${t('loginCreateTitle')}</span>
          <small>${t('loginCreateSub')}</small>
        </button>
      </div>
    </div>`;

  // Ver el PIN: teclear a ciegas un PIN en un móvil, de pie en el gimnasio, es hostil.
  const eye = document.getElementById('lg-eye');
  eye.onclick = () => {
    const inp = document.getElementById('lg-pin');
    const ver = inp.type === 'password';
    inp.type = ver ? 'text' : 'password';
    eye.innerHTML = ver ? ICONS.eyeOff : ICONS.eye;
    eye.classList.toggle('on', ver);
    inp.focus();
  };
  document.getElementById('lg-go').onclick = async () => {
    const btn = document.getElementById('lg-go');
    btn.disabled = true;
    const r = await login(document.getElementById('lg-user').value, document.getElementById('lg-pin').value);
    if (r.error) { btn.disabled = false; toast(t(r.error)); return; }
    state.user = r.row.username;
    state.view = 'home';
    render();
    syncBoth(false);
  };
  document.getElementById('lg-new').onclick = () => { state.view = 'signup'; render(); };
}

// Formulario de alta: datos de acceso + cuestionario. Con las respuestas se genera
// la rutina (plantillas del catálogo) y los objetivos de dieta (Mifflin-St Jeor).
function viewSignup() {
  tabsEl.hidden = true;
  const sel = (id, label, opts) => `
    <div class="field"><label for="${id}">${label}</label>
      <select id="${id}" class="picker">${opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>`;
  const num = (id, label, min, max, ph = '') => `
    <div class="field"><label for="${id}">${label}</label>
      <input id="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" placeholder="${ph}"></div>`;

  app.innerHTML = `
    ${nav(t('suTitle'), t('suUserHint'))}

    <div class="gate-form flow">
      <label class="fld">
        <span class="fld-ic" aria-hidden="true">${ICONS.user}</span>
        <input id="su-name" autocomplete="name" placeholder="${t('suName')}" aria-label="${t('suName')}">
      </label>
      <label class="fld">
        <span class="fld-ic mono" aria-hidden="true">@</span>
        <input id="su-user" autocapitalize="none" autocomplete="username"
          placeholder="${t('loginUser')}" aria-label="${t('loginUser')}">
      </label>
      <label class="fld">
        <span class="fld-ic" aria-hidden="true">${ICONS.lock}</span>
        <input id="su-pin" type="password" maxlength="20" autocomplete="new-password"
          placeholder="${t('loginPin')}" aria-label="${t('suPin')}">
      </label>
    </div>

    <div class="sec-title">${t('suAboutYou')}</div>
    <div class="sec">
      ${num('su-age', t('suAge'), 14, 90)}
      ${sel('su-sex', t('suSex'), [['f', t('suSexF')], ['m', t('suSexM')]])}
      ${num('su-weight', t('fieldWeight'), 30, 250)}
      ${num('su-height', t('suHeight'), 120, 230)}
    </div>

    <div class="sec-title">${t('suTraining')}</div>
    <div class="sec">
      ${sel('su-exp', t('suExp'), [['nuevo', t('suExp0')], ['medio', t('suExp1')], ['avanzado', t('suExp2')]])}
      ${sel('su-days', t('suDays'), [['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']])}
      ${sel('su-min', t('suMinutes'), [['30', t('suMin30')], ['45', t('suMin45')], ['60', t('suMin60')], ['75', t('suMin75')]])}
      ${sel('su-sport', t('suSport'), [['ninguno', t('suSportNone')], ['correr', t('suSportRun')],
        ['bici', t('suSportBike')], ['natacion', t('suSportSwim')], ['equipo', t('suSportTeam')], ['otro', t('suSportOther')]])}
      <div id="su-sportdays-wrap" hidden>
        ${sel('su-sportdays', t('suSportDays'), [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']])}
      </div>
      ${sel('su-goal', t('suGoal'), [['musculo', t('suGoalMuscle')], ['grasa', t('suGoalFat')],
        ['forma', t('suGoalFit')], ['resistencia', t('suGoalRace')]])}
      ${sel('su-niggle', t('suNiggle'), [['ninguna', t('suNiggleNone')], ['hombro', t('suNiggleShoulder')],
        ['rodilla', t('suNiggleKnee')], ['lumbar', t('suNiggleBack')]])}
      <p class="muted" style="font-size:13px;margin:-4px 0 18px">${t('suNiggleNote')}</p>
      <button class="btn primary wide" id="su-go">${t('suCreate')}</button>
    </div>`;

  const $ = (id) => document.getElementById(id);
  $('su-days').value = '3';
  $('su-min').value = '60';
  $('su-sportdays').value = '3';
  // Los días de deporte solo tienen sentido si hace alguno: preguntar "0 días de ninguno"
  // es ruido en un formulario que ya es largo.
  const sportWrap = $('su-sportdays-wrap');
  $('su-sport').onchange = () => { sportWrap.hidden = $('su-sport').value === 'ninguno'; };
  // Sugerencia de username a partir del nombre, solo mientras no lo hayan tocado
  let userTouched = false;
  $('su-user').oninput = () => { userTouched = true; };
  $('su-name').oninput = () => { if (!userTouched) $('su-user').value = normalizeUsername($('su-name').value); };

  $('su-go').onclick = async () => {
    const nv = (id) => Number($(id).value);
    const sport = $('su-sport').value;
    const profile = {
      age: nv('su-age'), sex: $('su-sex').value, weightKg: nv('su-weight'), heightCm: nv('su-height'),
      experience: $('su-exp').value, daysPerWeek: nv('su-days'), goal: $('su-goal').value,
      minutes: nv('su-min'), sport, sportDays: sport === 'ninguno' ? 0 : nv('su-sportdays'),
      niggle: $('su-niggle').value,
    };
    if (!$('su-name').value.trim()) { toast(t('suNeedName')); return; }
    if (!(profile.age >= 14 && profile.age <= 90) || !(profile.weightKg >= 30 && profile.weightKg <= 250)
      || !(profile.heightCm >= 120 && profile.heightCm <= 230)) { toast(t('suNeedData')); return; }
    const btn = $('su-go');
    btn.disabled = true;
    const r = await signup({ name: $('su-name').value, username: $('su-user').value, pin: $('su-pin').value, profile });
    if (r.error) { btn.disabled = false; toast(t(r.error)); return; }
    state.user = r.row.username;
    state.view = 'home';
    toast(t('suDone'));
    render();
    sync(true);
  };
  document.getElementById('back').onclick = () => { state.view = 'home'; render(); };
}

/**
 * El bloque protagonista de Entreno: la sesión de hoy. Antes esto eran tres piezas
 * compitiendo por el primer scroll (hero del mesociclo + aviso de hoy + lista de días);
 * ahora manda lo único que se hace desde aquí, y el mesociclo baja a una tira de contexto.
 */
/** Primer ejercicio de la sesión que tenga foto: es la imagen que representa el día. */
const dayPhoto = (day) => day.exercises.find((e) => e.photo)?.photo || null;

function nowCard(u, user, week) {
  const hoy = todaysDay(user);
  if (!hoy) {
    const sig = nextDay(user);
    return `<div class="now rest">
      <span class="now-lb">${t('today')}</span>
      <div class="now-h"><h2>${esc(t('restDay'))}</h2></div>
      <p>${sig
        ? t('nextSession', esc(dayName(sig.day)), sig.enDias === 1 ? t('tomorrow') : t('inDays', sig.enDias)) + ' '
        : ''}${t('restIsPlan')}</p>
    </div>`;
  }
  const p = dayProgress(u, hoy, week);
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  const hecha = p.total > 0 && p.done >= p.total;
  const foto = dayPhoto(hoy);
  // La foto va a sangre con un degradado encima: las fotos de técnica ya viajan con la
  // app (photos/), así que no cuesta ni un byte de red ni rompe el modo offline.
  return `<button class="now shot" data-day="${hoy.key}">
    ${foto ? `<img class="now-img" src="./photos/${foto}-0.jpg" alt="" loading="eager" decoding="async">` : ''}
    <span class="now-body">
      <span class="now-lb">${t('today')} · ${esc(weekdayName(weekdayIndex(hoy)))}</span>
      <span class="now-h">
        <h2>${esc(dayName(hoy))}</h2>
        <span class="chev" aria-hidden="true">${ICONS.chev}</span>
      </span>
      ${hecha ? `<span class="now-note">${esc(t('todayDone').trim())}</span>` : ''}
      <span class="now-prog">
        <span class="n">${p.done}/${p.total}</span>
        <span class="now-track"><i style="width:${pct}%"></i></span>
      </span>
    </span>
  </button>`;
}

function viewHome() {
  const { u, user, week } = ctx();
  const dl = isDeload(week);
  const hoy = todaysDay(user);
  const lastBody = db.getBody(u).at(-1);
  const lunes = weekStartISO();

  // Progreso de cada sesión en la SEMANA en curso, no solo hoy: una sesión hecha ayer
  // tiene que verse hecha, y así al final de semana se ve de un golpe qué falta.
  const semana = user.days.map((d) => ({ d, p: dayProgress(u, d, week, lunes) }));
  const entrenados = semana.filter((x) => x.p.done > 0).length;
  const faltan = semana.length - entrenados;

  app.innerHTML = `
    ${lead(user.name, userSubtitle(u, user))}
    ${nowCard(u, user, week)}

    <div class="wk">
      <div class="wk-top">
        <span class="wk-lb">${t('weekKicker')}</span>
        <span class="wk-n">${entrenados}<em>/${semana.length}</em> · ${faltan === 0 ? t('weekAllDone') : t('weekLeft', faltan)}</span>
      </div>
      <div class="wk-days">
        ${semana.map(({ d, p }) => {
          const inicial = weekdayName(weekdayIndex(d)).slice(0, 2);
          const hecho = p.done > 0;
          return `<span class="wk-d ${hecho ? 'done' : ''} ${hoy?.key === d.key ? 'now' : ''}"
            title="${esc(dayName(d))}">${hecho ? ICONS.check : esc(inicial)}</span>`;
        }).join('')}
      </div>
    </div>

    <div class="meso ${dl ? 'deload' : ''}">
      <div class="meso-row">
        <span class="meso-rir">${t('mesoWeek')}</span>
        <span class="meso-track" aria-hidden="true">${[1, 2, 3, 4, 5]
          .map((w) => `<i class="meso-seg ${w < week ? 'done' : w === week ? 'cur' : ''}"></i>`).join('')}</span>
        <span class="meso-n">${week}<em>/5</em></span>
      </div>
      <p class="meso-hint">${dl ? t('hintDeload')
        : week === 3 ? t('hintWeek3')
        : week === 4 ? t('hintWeek4')
        : t('hintDefault')} · RIR ${esc(user.weekLabels[week - 1])}</p>
    </div>

    <div class="list" style="margin-top:22px">
      ${semana.map(({ d, p }) => {
        const esHoy = hoy?.key === d.key;
        const estado = p.done >= p.total ? 'on' : p.done > 0 ? 'part' : '';
        return `<button class="row-i ${esHoy ? 'today' : ''}" data-day="${d.key}">
          <span class="row-i-main">
            <span class="kicker">${esc(weekdayName(weekdayIndex(d)))}${esHoy ? ` <em class="chip-hoy">${t('today')}</em>` : ''}</span>
            <strong>${esc(dayName(d))}</strong>
            <small>${esc(daySubtitle(d))}</small>
          </span>
          <span class="row-i-side">
            <b class="n ${estado}">${p.done}/${p.total}</b>
            <small>${esc(lastDoneText(u, d))}</small>
          </span>
          <span class="chev" aria-hidden="true">${ICONS.chev}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="sec-title">${t('trackingKicker')}</div>
    <div class="list">
      <button class="row-i" data-go="body">
        <span class="row-i-main">
          <strong>${t('bodyCard')}</strong>
          <small>${lastBody?.weightKg ? fmt(lastBody.weightKg) + ' kg' : t('neverLogged')}</small>
        </span>
        <span class="chev" aria-hidden="true">${ICONS.chev}</span>
      </button>
    </div>`;

  app.querySelectorAll('[data-day]').forEach((b) => {
    b.onclick = () => { state.dayKey = b.dataset.day; state.view = 'day'; state.open = null; state.override = {}; state.draft = {}; render(); };
  });
  app.querySelector('[data-go="body"]').onclick = () => { state.view = 'body'; render(); };
  wireTabs('home');
}

/**
 * Cabecera de pantalla raíz: título grande dentro del flujo, sin barra fija. Las cuatro
 * pantallas de primer nivel no necesitan una barra pegajosa porque el dock siempre está
 * ahí; quitarla devuelve media pantalla a la tipografía.
 */
function lead(title, sub) {
  return `<div class="lead">
    <h1>${esc(title)}</h1>
    ${sub ? `<span class="sub">${esc(sub)}</span>` : ''}
  </div>`;
}

/** Cabecera de segundo nivel. Aquí sí es fija: es el único camino de vuelta. */
function nav(title, meta) {
  return `<div class="nav">
      <button class="back" id="back" aria-label="${t('back')}">${ICONS.back}</button>
      <h1>${esc(title)}</h1>
    </div>
    ${meta ? `<p class="meta">${esc(meta)}</p>` : ''}`;
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
  // chevrones de la cabecera y de las filas navegables
  back: svgIcon('<path d="M15 5l-7 7 7 7"/>'),
  chev: svgIcon('<path d="M9 5l7 7-7 7"/>'),
  check: svgIcon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  // iconos de los campos de acceso: son la etiqueta permanente del campo, así que el
  // texto guía puede desaparecer al escribir sin que se pierda de qué campo se trata
  user: svgIcon('<circle cx="12" cy="8" r="3.4"/><path d="M4.6 20c1.3-3.6 4-5.4 7.4-5.4s6.1 1.8 7.4 5.4"/>'),
  lock: svgIcon('<rect x="4.5" y="10.4" width="15" height="9.6" rx="2.6"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>'),
  eye: svgIcon('<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/>'),
  eyeOff: svgIcon(`<path d="M4 4l16 16"/>
     <path d="M9.7 6.9A9.8 9.8 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a17 17 0 0 1-2.9 3.4"/>
     <path d="M6.5 8.6A17 17 0 0 0 2.5 12S6 17.5 12 17.5c.9 0 1.7-.1 2.4-.3"/>
     <path d="M9.6 11.5a2.8 2.8 0 0 0 3.8 3.8"/>`),
};

// La barra se construye UNA vez y vive fuera de #app; en cada vista solo cambia
// qué pestaña está marcada. Así el elemento fijo nunca se destruye ni se recrea.
const TAB_ITEMS = [['home', 'tabHome'], ['diet', 'tabDiet'], ['progress', 'tabProgress'], ['settings', 'tabSettings']];
const tabsEl = document.getElementById('tabs');

tabsEl.innerHTML = TAB_ITEMS.map(([k]) =>
  `<button data-tab="${k}"><span class="ic">${ICONS[k]}</span><span class="lb"></span></button>`).join('');

// Las etiquetas se actualizan por texto, nunca reconstruyendo la barra: recrear un
// elemento fijo con backdrop-filter es justo lo que descolocaba la barra en iOS.
function tabLabels() {
  TAB_ITEMS.forEach(([k, clave]) => {
    const el = tabsEl.querySelector(`[data-tab="${k}"] .lb`);
    if (el) el.textContent = t(clave);
  });
}
tabLabels();

tabsEl.querySelectorAll('[data-tab]').forEach((b) => {
  b.onclick = () => { state.view = b.dataset.tab; state.open = null; state.meal = null; render(); };
});

function setTab(active) {
  tabsEl.hidden = false;
  tabLabels();
  tabsEl.querySelectorAll('[data-tab]').forEach((b) => {
    b.classList.toggle('on', b.dataset.tab === active);
  });
}

function wireTabs(active) {
  setTab(active);
  const back = document.getElementById('back');
  if (back) back.onclick = () => { state.view = 'home'; state.open = null; render(); };
}

function viewDay() {
  const { u, user, week } = ctx();
  const day = findDay(user, state.dayKey);
  if (!day) { state.view = 'home'; return render(); }
  const today = db.todayISO();

  // Aviso si esta no es la sesión que toca hoy. No bloquea: solo avisa.
  const hoy = todaysDay(user);
  const fuera = !hoy || hoy.key !== day.key;
  const avisoDia = !fuera ? '' : `<div class="note warn">
    <strong>${t('offPlanTitle')}</strong>
    ${hoy ? t('offPlanToday', esc(dayName(hoy))) : t('offPlanRest')}
    ${t('offPlanWarn')}
  </div>`;

  app.innerHTML = `
    ${nav(dayName(day), `${daySubtitle(day)} · ${t('mesoWeek')} ${week} · RIR ${user.weekLabels[week - 1]}`)}
    ${avisoDia}
    ${isDeload(week) ? `<div class="note warn"><strong>${t('deloadTitle')}</strong> ${t('deloadBody')}</div>` : ''}
    <div id="ex-list">${day.exercises.map((ex, i) => exerciseCard(u, day, ex, i, week, today)).join('')}</div>
    <details class="blk">
      <summary>${t('warmup')}</summary>
      <p class="cue">${esc(dayWarmup(day))}</p>
    </details>`;

  wireDay(u, day, week, today);
  wireTabs('home');
}

/**
 * Demostración de técnica: dos fotos reales (inicio y final) alternándose como un GIF.
 * Si alguna no carga —sin conexión y aún sin cachear— se cae al dibujo SVG, que pesa
 * unos pocos KB y sí viaja siempre con la app.
 */
function tecnica(ex) {
  const svg = moveSvg(ex.pattern) || '';
  if (!ex.photo) return svg;
  return `<div class="ph" data-ph="${ex.key}">
    <img src="./photos/${ex.photo}-0.jpg" alt="" loading="lazy" decoding="async" class="ph-a">
    <img src="./photos/${ex.photo}-1.jpg" alt="" loading="lazy" decoding="async" class="ph-b">
    <div class="ph-fb" hidden>${svg}</div>
  </div>`;
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
  const unitTxt = ex.unit === 'kg-por-mano' ? t('perHand') : 'kg';

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
      ${bw ? '' : `<td><input type="number" inputmode="decimal" step="0.5" min="0" data-f="weight" value="${vW}" aria-label="${t('colWeight')} ${k + 1}"></td>`}
      <td><input type="number" inputmode="numeric" min="0" data-f="reps" value="${vR}" placeholder="${ex.repMin}-${ex.repMax}" aria-label="${t('colReps')} ${k + 1}"></td>
      <td><input type="number" inputmode="numeric" min="0" max="5" step="0.5" data-f="rir" value="${vI}" placeholder="${fmt(target)}" aria-label="RIR ${k + 1}"></td>
      <td style="width:48px"><button class="tick ${done ? 'on' : ''}" data-tick="${k}" aria-label="${t('saved')} ${k + 1}">✓</button></td>
    </tr>`;
  }).join('');

  return `<div class="ex ${doneCount >= nSets ? 'is-done' : ''}" data-ex="${ex.key}">
    <button class="ex-head" data-toggle="${ex.key}" aria-expanded="${isOpen}">
      <span class="ex-thumb">
        <span class="ex-idx">${String(i + 1).padStart(2, '0')}</span>
        ${ex.photo ? `<img src="./photos/${ex.photo}-0.jpg" alt="" loading="lazy" decoding="async">` : ''}
      </span>
      <span class="ex-name">${esc(exName(ex))}
        <span class="ex-spec">${nSets} × ${ex.timed ? `${ex.repMin}-${ex.repMax}″` : `${ex.repMin}-${ex.repMax}`} · RIR ${fmt(target)} · ${restLabel(ex.restSec)}</span>
      </span>
      <span class="ex-state ${doneCount >= nSets ? 'done' : ''}">${doneCount}/${nSets}</span>
    </button>

    ${isOpen ? `<div class="ex-body">
      <div class="suggest">
        <div class="suggest-in">
          <div class="load ${bw ? 'txt' : ''}">${bw ? t('bodyweight') : `${fmt(w)} <small>${unitTxt}</small>`}</div>
          <div class="why">${t(s.reasonKey, ...(s.reasonArgs || []))}</div>
          ${s.last ? `<div class="last">${t('lastTime', esc(s.last))}</div>` : ''}
          ${bw ? '' : `<div class="nudge">
            <button data-nudge="-1" aria-label="${t('colWeight')} −">−</button>
            <button data-nudge="1" aria-label="${t('colWeight')} +">+</button>
            <span>${t('nudgeHint')}</span>
          </div>`}
        </div>
      </div>
      <table class="sets">
        <thead><tr><th>#</th>${bw ? '' : `<th>${t('colWeight')}</th>`}<th>${ex.timed ? t('colSecs') : t('colReps')}</th><th>RIR</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tech">
        ${tecnica(ex)}
        <p class="cue">${esc(exCue(ex))}</p>
        <a class="vid" href="${videoUrl(ex)}" target="_blank" rel="noopener">${t('watchVideo')}</a>
      </div>
    </div>` : ''}
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

  // Si una foto no carga (sin conexión y sin cachear), enseñamos el dibujo
  card.querySelectorAll('.ph img').forEach((img) => {
    img.onerror = () => {
      const cont = img.closest('.ph');
      cont.querySelectorAll('img').forEach((x) => { x.hidden = true; });
      cont.querySelector('.ph-fb').hidden = false;
    };
  });

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
      if (!reps) { toast(t('needReps')); return; }
      const weight = openEx.unit === 'peso-corporal' ? 0 : get('weight');
      captureDraft(openEx.key);
      db.logSet(u, { dayKey: day.key, exerciseKey: openEx.key, setIndex: idx, weight, reps, rir: get('rir') });
      startRest(openEx.restSec, `${exName(openEx)} · ${idx + 1}`);
      render();
      sync(true);
    };
  });
}

/**
 * Lectura del histórico en lenguaje llano: qué sube, qué está parado y cuánto entrenas.
 * Es lo que sirve para decidir si hay que tocar el plan.
 */
/**
 * Ejercicios de la rutina sin repetir. Un mismo ejercicio puede estar en dos días (Jan
 * hace la misma sesión de empuje lunes y jueves), y su histórico es uno solo: contarlo
 * dos veces inflaría el resumen y lo duplicaría en el selector de Progreso.
 */
const uniqueExercises = (user) => [...new Map(allExercises(user).map((e) => [e.key, e])).values()];

function summarize(u, user) {
  const list = uniqueExercises(user);
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

function viewSummary(u, user) {
  const s = summarize(u, user);
  if (s.totalSesiones === 0) {
    return `<div class="blk"><p class="muted">${t('summaryEmpty')}</p></div>`;
  }
  const li = (x) => `<li>${x}</li>`;
  return `<div class="blk" style="padding-top:0">
    <div class="dat">
      <div><span class="n">${s.recientes}</span><em>${t('statSessions')}</em></div>
      <div><span class="n">${s.subiendo.length}</span><em>${t('statRising')}</em></div>
      <div><span class="n ${s.parados.length ? 'warnv' : ''}">${s.parados.length}</span><em>${t('statStalled')}</em></div>
    </div>
    <ul class="bullets">
      ${s.recientes >= 14 ? li(t('adhGood')) : s.recientes >= 8 ? li(t('adhOk')) : li(t('adhBad'))}
      ${s.subiendo.length ? li(t('bestProgress', esc(exName(s.subiendo[0].ex)), Math.round(s.subiendo[0].pct))) : ''}
      ${s.parados.length >= 3
        ? li(t('manyStalled', s.parados.length))
        : s.parados.length ? li(t('someStalled', s.parados.map((p) => esc(exName(p.ex))).join(', '))) : ''}
      ${s.peso ? li(t('bodyWeightLine', fmt(Math.round(s.peso.actual * 10) / 10), (s.peso.delta >= 0 ? '+' : '') + fmt(Math.round(s.peso.delta * 10) / 10))) : ''}
      ${s.cintura != null ? li(t('waistLine', (s.cintura <= 0 ? '' : '+') + fmt(Math.round(s.cintura * 10) / 10))) : ''}
    </ul>
    <p class="muted" style="margin:16px 0 0;font-size:13px">${t('summaryFoot')}</p>
  </div>`;
}

function viewProgress() {
  const { u, user } = ctx();
  const list = uniqueExercises(user);
  if (list.length === 0) { state.view = 'home'; return render(); }
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

  // El selector agrupa por día, pero un ejercicio que está en dos días se lista una
  // sola vez, en el primero donde aparece. Un día que se queda sin nada propio no sale.
  const vistos = new Set();
  const grupos = user.days.map((d) => {
    const exs = d.exercises.filter((e) => !vistos.has(e.key));
    exs.forEach((e) => vistos.add(e.key));
    return { d, exs };
  }).filter((g) => g.exs.length > 0);

  app.innerHTML = `
    ${lead(t('tabProgress'), user.name)}
    ${viewSummary(u, user)}

    <div class="sec-title">${t('e1rmKicker')}</div>
    <select class="picker" id="ex-pick">
      ${grupos.map(({ d, exs }) => `<optgroup label="${esc(dayName(d))}">
        ${exs.map((e) => `<option value="${e.key}" ${e.key === key ? 'selected' : ''}>${esc(exName(e))}</option>`).join('')}
      </optgroup>`).join('')}
    </select>

    <div class="blk">
      <h3 class="blk-t" style="margin-top:0">${esc(exName(ex))}</h3>
      <p class="muted" style="margin:6px 0 0">${t('e1rmNote')}</p>
      ${chart([{ points }])}
    </div>

    ${volume.length > 1 ? `<div class="blk">
      <div class="kicker">${t('tonnageKicker')}</div>
      <p class="muted" style="margin:6px 0 0">${t('tonnageNote')}</p>
      ${chart([{ points: volume }])}
    </div>` : ''}

    <div class="sec-title">${t('history')}</div>
    <div class="sec">
      ${sessions.length === 0 ? `<p class="muted">${t('noHistory')}</p>` : `
      <table class="hist">
        <thead><tr><th>${t('colDate')}</th><th>${t('colSets')}</th><th>${t('colWeight')}</th><th>e1RM</th></tr></thead>
        <tbody>${sessions.slice().reverse().slice(0, 12).map((ses) => {
          const d = ses.sets.filter((s) => s.reps > 0);
          const wmax = Math.max(0, ...d.map((s) => s.weight || 0));
          const best = Math.max(0, ...d.map((s) => e1rm(s.weight, s.reps)));
          return `<tr>
            <td>${new Date(ses.date).toLocaleDateString(locale(), { day: '2-digit', month: 'short' })}</td>
            <td>${d.map((s) => s.reps).join('/') || '—'}</td>
            <td>${wmax ? fmt(wmax) + ' kg' : '—'}</td>
            <td>${best ? fmt(Math.round(best * 10) / 10) : '—'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>`}
    </div>`;

  document.getElementById('ex-pick').onchange = (e) => { state.exKey = e.target.value; render(); };
  wireTabs('progress');
}

function viewBody() {
  const { u, user } = ctx();
  const rows = db.getBody(u);
  const wPoints = rows.filter((r) => r.weightKg).map((r) => ({ x: Date.parse(r.loggedAt), y: r.weightKg }));
  const cPoints = rows.filter((r) => r.waistCm).map((r) => ({ x: Date.parse(r.loggedAt), y: r.waistCm }));

  app.innerHTML = `
    ${nav(t('bodyTitle'), '')}
    <div class="note">${t('bodyNote')}</div>

    <div class="sec">
      <div class="field"><label for="bw">${t('fieldWeight')}</label>
        <input id="bw" type="number" inputmode="decimal" step="0.1" placeholder="${rows.at(-1)?.weightKg ?? ''}"></div>
      <div class="field"><label for="wc">${t('fieldWaist')}</label>
        <input id="wc" type="number" inputmode="decimal" step="0.5" placeholder="${rows.at(-1)?.waistCm ?? ''}"></div>
      <button class="btn primary wide" id="save-body">${t('saveToday')}</button>
    </div>

    <div class="sec-title">${t('evolution')}</div>
    <div class="blk" style="padding-top:0">
      ${chart([{ points: wPoints }, { points: cPoints }])}
      <div class="legend">
        <span><i class="swatch" style="background:var(--acc)"></i>${t('legendWeight')}</span>
        <span><i class="swatch" style="background:var(--fg2)"></i>${t('legendWaist')}</span>
      </div>
    </div>

    ${rows.length ? `<div class="sec-title">${t('records')}</div>
      <table class="hist">
        <thead><tr><th>${t('colDate')}</th><th>${t('legendWeight')}</th><th>${t('legendWaist')}</th></tr></thead>
        <tbody>${rows.slice().reverse().slice(0, 14).map((r) => `<tr>
          <td>${new Date(r.loggedAt).toLocaleDateString(locale(), { day: '2-digit', month: 'short' })}</td>
          <td>${r.weightKg ? fmt(r.weightKg) + ' kg' : '—'}</td>
          <td>${r.waistCm ? fmt(r.waistCm) + ' cm' : '—'}</td>
        </tr>`).join('')}</tbody>
      </table>` : ''}`;

  document.getElementById('save-body').onclick = () => {
    const w = document.getElementById('bw').value;
    const c = document.getElementById('wc').value;
    if (!w && !c) { toast(t('needOneValue')); return; }
    db.logBody(u, { weightKg: w, waistCm: c });
    toast(t('saved'));
    render();
    sync(true);
  };
  wireTabs('home');
}

const CATS = [['desayuno', 'catBreakfast'], ['comida', 'catLunch'], ['cena', 'catDinner'], ['snack', 'catSnack']];

function viewDiet() {
  const { u, user } = ctx();
  // Usuarios creados desde la app: objetivos calculados del cuestionario, en su fila.
  // Los originales no tienen `targets` en la fila y caen a los de nutrition.js.
  const tg = db.getAccount(u)?.targets || TARGETS[u];
  const tot = dayTotals(u);
  const difKcal = Math.round(tot.kcal - tg.kcal);
  const conEjemplo = (SAMPLE_DAY[u] || []).length > 0;

  const mealCard = (m, slot, half) => {
    const abierto = state.meal === m.key;
    const f = half ? 0.5 : 1;
    return `<div class="meal ${abierto ? 'open' : ''}" data-meal="${m.key}">
      <button class="ex-head" data-openmeal="${m.key}" aria-expanded="${abierto}">
        <span class="ex-name">${slot ? `<span class="slot">${esc(slotName(slot))}</span>` : ''}${esc(mealName(m))}${half ? ` <em class="muted">${t('halfPortion')}</em>` : ''}
          <span class="ex-spec">${Math.round(m.kcal * f)} kcal · ${Math.round(m.prot * f)} ${t('gProtein')} · ${m.min} ${t('minShort')} · ≈${fmt(Math.round(m.price * f * 100) / 100)} €</span>
        </span>
        <span class="ex-state">${abierto ? '−' : '+'}</span>
      </button>
      ${abierto ? `
        <div class="recipe">
          <h4>${t('ingredients')}</h4>
          <ul>${mealIngredients(m).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
          <h4>${t('preparation')}</h4>
          <ol>${mealSteps(m).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
          ${m.tip ? `<p class="tip">${esc(mealTip(m))}</p>` : ''}
        </div>` : ''}
    </div>`;
  };

  app.innerHTML = `
    ${lead(t('dietTitle'), targetField(u, 'estrategia', tg.estrategia))}

    <div class="figure">
      <span class="big">${tg.kcal} <small>${t('kcalDay')}</small></span>
      <p>${esc(targetField(u, 'detalle', tg.detalle))}</p>
    </div>

    <div class="dat">
      <div><span class="n">${tg.prot}</span><em>${t('gProtein')}</em></div>
      <div><span class="n">${tg.carb}</span><em>${t('gCarbs')}</em></div>
      <div><span class="n">${tg.fat}</span><em>${t('gFat')}</em></div>
    </div>

    <div class="note"><strong>${t('proteinLabel')}</strong> ${esc(targetField(u, 'proteinaNota', tg.proteinaNota))}</div>

    ${conEjemplo ? `
    <div class="sec-title">${t('sampleDay')}</div>
    <p class="muted">${t('sampleSums', Math.round(tot.kcal), Math.round(tot.prot), fmt(Math.round(tot.price * 100) / 100))}
      ${Math.abs(difKcal) <= 120 ? t('sampleFits')
        : difKcal > 0 ? t('sampleOver', difKcal) : t('sampleUnder', -difKcal)}</p>

    <div class="list" style="margin-top:18px">
      ${SAMPLE_DAY[u].map((it) => mealCard(mealByKey(it.key), it.slot, it.half)).join('')}
    </div>

    <button class="btn wide" id="lista" style="margin-top:22px">${t('shoppingBtn')}</button>` : ''}

    ${CATS.map(([c, label]) => `
      <div class="sec-title">${t(label)}</div>
      <div class="list">${MEALS.filter((m) => m.cat === c).map((m) => mealCard(m, null, false)).join('')}</div>
    `).join('')}

    <div class="note">${t('dietDisclaimer')}</div>`;

  app.querySelectorAll('[data-openmeal]').forEach((b) => {
    b.onclick = () => { state.meal = state.meal === b.dataset.openmeal ? null : b.dataset.openmeal; render(); };
  });
  const lista = document.getElementById('lista');
  if (lista) lista.onclick = () => {
    const l = shoppingList(u);
    navigator.clipboard?.writeText(t('shoppingTitle') + '\n\n' + l.map((i) => '- ' + i).join('\n'))
      .then(() => toast(t('shoppingCopied'))).catch(() => {});
  };
  wireTabs('diet');
}

function viewSettings() {
  const { u, user, start, week } = ctx();
  const pend = db.pendingCount();
  const last = db.getLastSync();

  app.innerHTML = `
    ${lead(t('settingsTitle'), `@${u}`)}

    <div class="sec-title">${t('language')}</div>
    <div class="list">
      <div class="row-i static">
        <span class="row-i-main"><strong>${t('language')}</strong></span>
        <span class="row-i-side seg" role="group">
          ${Object.entries(LANGS).map(([k, n]) =>
            `<button class="seg-btn ${getLang() === k ? 'on' : ''}" data-lang="${k}">${n}</button>`).join('')}
        </span>
      </div>
    </div>

    <div class="sec-title">${t('syncKicker')}</div>
    <div class="list">
      <div class="row-i static">
        <span class="row-i-main">
          <strong>${!db.isConfigured() ? t('syncLocal') : pend ? t('syncPending', pend) : t('syncOk')}</strong>
          ${last ? `<small>${t('lastUpload', new Date(last).toLocaleString(locale()))}</small>` : ''}
        </span>
        <span class="sync-dot ${!db.isConfigured() ? '' : pend ? 'wait' : 'ok'}" aria-hidden="true"></span>
      </div>
      <button class="row-i" id="do-sync" ${db.isConfigured() ? '' : 'disabled'}>
        <span class="row-i-main"><strong>${t('btnSync')}</strong></span>
      </button>
      <button class="row-i" id="do-pull" ${db.isConfigured() ? '' : 'disabled'}>
        <span class="row-i-main"><strong>${t('btnPull')}</strong></span>
      </button>
      <button class="row-i" id="do-export">
        <span class="row-i-main"><strong>${t('btnExport')}</strong></span>
      </button>
      <button class="row-i" id="do-import">
        <span class="row-i-main"><strong>${t('btnImport')}</strong></span>
      </button>
    </div>
    <input type="file" id="file" accept="application/json" hidden>
    ${!db.isConfigured() ? `<div class="note warn">${t('noCloudWarn')}</div>` : ''}

    <div class="sec-title">${t('mesoKicker')}</div>
    <div class="list">
      <div class="row-i static">
        <span class="row-i-main">
          <strong>${t('mesoState', week,
            new Date(start).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' }))}</strong>
        </span>
      </div>
      <label class="row-i" for="meso">
        <span class="row-i-main"><strong>${t('mesoStart')}</strong></span>
        <input type="date" id="meso" value="${start}" class="date-in">
      </label>
      <button class="row-i" id="reset-meso">
        <span class="row-i-main"><strong>${t('mesoReset')}</strong></span>
      </button>
    </div>

    ${db.getAccount(db.getUser())?.is_admin ? `<div class="sec-title">${t('adminKicker')}</div>
    <div class="list">
      <button class="row-i" id="go-admin">
        <span class="row-i-main"><strong>${t('adminTitle')}</strong><small>${t('adminSub')}</small></span>
        <span class="chev" aria-hidden="true">${ICONS.chev}</span>
      </button>
    </div>` : ''}

    <div class="sec-title">${t('account')}</div>
    <div class="list">
      <button class="row-i" id="logout">
        <span class="row-i-main"><strong>${t('logout')}</strong></span>
      </button>
    </div>

    <div class="note">${t('timerNote')}</div>

    <p class="ver">zgym v${VERSION} · <span id="ver-estado">${t('verChecking')}</span></p>`;

  document.getElementById('do-sync').onclick = async () => {
    toast(t('syncing'));
    const r = await sync(false);
    toast(r.ok ? (r.sent ? t('syncedN', r.sent) : t('nothingPending')) : t('errorPrefix', r.error));
    render();
  };

  document.getElementById('do-pull').onclick = async () => {
    toast(t('searchingCloud'));
    const r = await db.pullFromCloud(remoteKeys());
    if (!r.ok) { toast(t('errorPrefix', r.error)); return; }
    toast(r.sets || r.body ? t('recovered', r.sets, r.body) : t('nothingToRecover'));
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
      toast(t('restored'));
      render();
    } catch (err) {
      toast(t('badFile'));
    }
  };

  document.getElementById('meso').onchange = (e) => {
    if (e.target.value) { db.setMesocycleStart(u, e.target.value); render(); }
  };
  document.getElementById('reset-meso').onclick = () => {
    db.setMesocycleStart(u, db.todayISO());
    toast(t('mesoResetDone'));
    render();
  };
  document.getElementById('logout').onclick = () => {
    // Solo cierra la sesión: los datos y la cuenta cacheada se quedan, así el
    // siguiente login del mismo usuario funciona incluso sin cobertura.
    state.user = null; db.setUser(null); state.view = 'home'; render();
  };
  const goAdmin = document.getElementById('go-admin');
  if (goAdmin) goAdmin.onclick = () => { state.view = 'admin'; render(); };

  app.querySelectorAll('[data-lang]').forEach((b) => {
    b.onclick = () => { setLang(b.dataset.lang); render(); };
  });

  // Estado de la versión, comprobado contra el servidor en el momento
  fetch('./version.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((d) => {
      const el = document.getElementById('ver-estado');
      if (!el) return;
      if (d.version === VERSION) { el.textContent = t('verUpToDate'); el.style.color = 'var(--acc)'; }
      else { el.textContent = t('verAvailable', d.version); el.style.color = 'var(--warn)'; }
    })
    .catch(() => {
      const el = document.getElementById('ver-estado');
      if (el) el.textContent = t('verOffline');
    });

  wireTabs('settings');
}

// ---------------------------------------------------------------------------
// Administración. Solo la ve quien tiene is_admin en su fila. Es un control de
// interfaz, no de seguridad: con la clave anon pública las políticas RLS no pueden
// distinguir usuarios de todos modos (ver README).
// ---------------------------------------------------------------------------
function viewAdmin() {
  app.innerHTML = `
    ${nav(t('adminTitle'), t('adminSub'))}
    <div id="adm"><p class="muted" style="padding-top:20px">${t('adminLoading')}</p></div>`;
  wireTabs('settings');

  db.listUserRows().then((rows) => {
    const box = document.getElementById('adm');
    if (!box || state.view !== 'admin') return;
    box.innerHTML = rows.map((r) => `
      <div class="blk">
        <h2 class="blk-t" style="margin-top:0">${esc(r.name)}</h2>
        <p class="muted" style="margin:4px 0 0">@${esc(r.username)}${r.is_admin ? ' · admin' : ''} ·
          ${new Date(r.created_at).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <div class="btn-row" style="margin-top:16px">
          <button class="btn" data-see="${esc(r.username)}">${t('adminView')}</button>
          <button class="btn" data-edit="${esc(r.username)}">${t('adminEdit')}</button>
          <button class="btn" data-pin="${esc(r.username)}">${t('adminPin')}</button>
          ${r.username === db.getUser() ? '' : `<button class="btn" data-del="${esc(r.username)}">${t('adminDelete')}</button>`}
        </div>
      </div>`).join('');

    const rowOf = (b) => rows.find((r) => r.username === b.dataset.see || r.username === b.dataset.edit || r.username === b.dataset.pin || r.username === b.dataset.del);

    box.querySelectorAll('[data-see]').forEach((b) => {
      b.onclick = () => {
        const r = rowOf(b);
        db.cacheAccount(r);
        state.user = r.username;   // impersonación en memoria: al recargar vuelves a ser tú
        state.view = 'home';
        render();
        db.pullFromCloud({ [r.username]: r.remote_key }).then((res) => {
          if (res.ok && (res.sets || res.body) && state.user === r.username) render();
        });
      };
    });

    box.querySelectorAll('[data-edit]').forEach((b) => {
      b.onclick = () => {
        const r = rowOf(b);
        db.cacheAccount(r);
        state.editUser = r.username;
        // Una rutina builtin se materializa a JSON con refs la primera vez que se edita
        state.editDraft = r.routine?.builtin ? materialize(resolveRoutine(r)) : structuredClone(r.routine);
        state.view = 'editRoutine';
        render();
      };
    });

    box.querySelectorAll('[data-pin]').forEach((b) => {
      b.onclick = async () => {
        const r = rowOf(b);
        const pin = prompt(t('adminNewPin', r.name));
        if (pin == null) return;
        if (!validPin(pin)) { toast(t('suBadPin')); return; }
        try {
          await db.updateUserRow(r.username, { pin_hash: await hashPin(r.username, pin) });
          toast(t('adminPinDone'));
        } catch (e) { toast(t('errorPrefix', String(e.message || e))); }
      };
    });

    box.querySelectorAll('[data-del]').forEach((b) => {
      b.onclick = async () => {
        const r = rowOf(b);
        if (!confirm(t('adminConfirmDelete', r.name))) return;
        try {
          await db.deleteUserRow(r.username);
          db.removeAccount(r.username);
          toast(t('adminDeleted'));
          render();
        } catch (e) { toast(t('errorPrefix', String(e.message || e))); }
      };
    });
  }).catch((e) => {
    const box = document.getElementById('adm');
    if (box) box.innerHTML = `<div class="note warn">${esc(t('errorPrefix', String(e.message || e)))}</div>`;
  });
}

/** Lee los inputs del editor hacia el borrador antes de re-renderizar o guardar. */
function captureEditor() {
  const draft = state.editDraft;
  app.querySelectorAll('.ed-ex').forEach((box) => {
    const e = draft?.days[box.dataset.di]?.exercises[box.dataset.ei];
    if (!e) return;
    box.querySelectorAll('[data-f]').forEach((inp) => {
      e[inp.dataset.f] = inp.value === '' ? null : Number(inp.value);
    });
  });
}

function viewRoutineEditor() {
  const row = db.getAccount(state.editUser);
  const draft = state.editDraft;
  if (!row || !draft) { state.view = 'admin'; return render(); }

  const edNum = (f, label, v) => `
    <label>${label}<input type="number" step="any" data-f="${f}" value="${v ?? ''}"></label>`;

  const catalogo = Object.values(EXERCISES)
    .map((e) => ({ key: e.key, nombre: exName(e) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  app.innerHTML = `
    ${nav(row.name, t('adminEditSub'))}
    ${draft.days.map((d, di) => {
      const base = DAYS[d.ref] || { key: d.ref, name: d.ref };
      return `<div class="blk">
        <div class="kicker">${esc(d.weekday)}</div>
        <h2 class="blk-t">${esc(dayName(base))}</h2>
        ${d.exercises.map((e, ei) => {
          const cat = EXERCISES[e.ref] || { key: e.ref, name: e.ref };
          return `<div class="ed-ex" data-di="${di}" data-ei="${ei}">
            <div class="row">
              <strong style="min-width:0">${esc(exName(cat))}</strong>
              <button class="btn sm" data-rm style="flex:0 0 auto">${t('edRemove')}</button>
            </div>
            <div class="ed-grid">
              ${edNum('sets', t('colSets'), e.sets)}
              ${edNum('repMin', t('edRepMin'), e.repMin)}
              ${edNum('repMax', t('edRepMax'), e.repMax)}
              ${edNum('rir', 'RIR', e.rir)}
              ${edNum('restSec', t('edRest'), e.restSec)}
              ${edNum('startLoad', t('colStart'), e.startLoad)}
              ${edNum('increment', t('edIncr'), e.increment)}
            </div>
          </div>`;
        }).join('')}
        <select class="picker" data-add="${di}" style="margin-top:14px">
          <option value="">${t('edAdd')}</option>
          ${catalogo.map((c) => `<option value="${esc(c.key)}">${esc(c.nombre)}</option>`).join('')}
        </select>
      </div>`;
    }).join('')}
    <button class="btn primary wide" id="ed-save">${t('edSave')}</button>`;

  app.querySelectorAll('[data-rm]').forEach((b) => {
    b.onclick = () => {
      captureEditor();
      const box = b.closest('.ed-ex');
      draft.days[box.dataset.di].exercises.splice(Number(box.dataset.ei), 1);
      render();
    };
  });

  app.querySelectorAll('[data-add]').forEach((s) => {
    s.onchange = () => {
      const cat = EXERCISES[s.value];
      if (!cat) return;
      captureEditor();
      draft.days[s.dataset.add].exercises.push(exOverrides(cat));
      render();
    };
  });

  document.getElementById('ed-save').onclick = async () => {
    captureEditor();
    for (const d of draft.days) {
      for (const e of d.exercises) {
        const nums = [e.sets, e.repMin, e.repMax, e.rir, e.restSec, e.startLoad];
        if (nums.some((v) => v == null || Number.isNaN(v)) || e.sets < 1 || e.repMin < 1 || e.repMax < e.repMin) {
          toast(t('edBad')); return;
        }
      }
    }
    try {
      await db.updateUserRow(state.editUser, { routine: draft });
      db.cacheAccount({ ...row, routine: draft });
      toast(t('adminSaved'));
      state.view = 'admin';
      render();
    } catch (e) { toast(t('errorPrefix', String(e.message || e))); }
  };

  wireTabs('settings');
  // El botón atrás del editor vuelve a la lista de usuarios, no al inicio
  const back = document.getElementById('back');
  if (back) back.onclick = () => { state.view = 'admin'; render(); };
}

// ---------------------------------------------------------------------------
const remoteKeys = () => db.remoteKeys();

async function sync(silent) {
  if (!db.isConfigured()) return { ok: false, error: 'sin-configurar' };
  const r = await db.syncNow(remoteKeys());
  if (!silent && !r.ok && r.error !== 'sin-configurar') console.warn('sync', r.error);
  return r;
}

/** Sube lo pendiente y baja lo que falte. Al arrancar, para que un móvil nuevo se llene solo. */
async function syncBoth(silent) {
  const up = await sync(true);
  const down = await db.pullFromCloud(remoteKeys());
  if (down.ok && (down.sets || down.body) && !silent) {
    toast(t('recoveredFromCloud', down.sets));
    render();
  }
  return { up, down };
}

// Al cambiar de pantalla hay que volver arriba. Si no, iOS conserva el scroll de la
// pantalla anterior y, cuando la nueva es más corta, la barra inferior fija se queda
// flotando con un hueco negro debajo hasta que tocas el scroll.
// Solo en cambio de vista: al re-renderizar tras marcar una serie hay que quedarse donde estás.
let lastView = null;
function render() {
  // Sin sesión (o sin la fila de cuenta cacheada) no hay nada que entrenar: login.
  if (!state.user || !db.getAccount(state.user)) {
    return (state.view === 'signup' ? viewSignup : viewLogin)();
  }
  ({
    home: viewHome, day: viewDay, diet: viewDiet, progress: viewProgress, body: viewBody,
    settings: viewSettings, admin: viewAdmin, editRoutine: viewRoutineEditor,
  }[state.view] || viewHome)();

  // Banner fijo mientras el admin está viendo la cuenta de otra persona.
  if (state.user !== db.getUser()) {
    const { user } = ctx();
    app.insertAdjacentHTML('afterbegin', `<div class="note warn" style="display:flex;align-items:center;gap:12px;justify-content:space-between">
      <span><strong>${t('viewingAs', esc(user.name))}</strong></span>
      <button class="btn" id="imp-exit" style="flex:0 0 auto">${t('viewingExit')}</button>
    </div>`);
    document.getElementById('imp-exit').onclick = () => {
      state.user = db.getUser(); state.view = 'admin'; render();
    };
  }

  const viewId = `${state.view}:${state.dayKey || ''}`;
  if (viewId !== lastView) {
    lastView = viewId;
    window.scrollTo(0, 0);
    // Entrada de pantalla. #app no se destruye entre vistas, así que hay que quitar la
    // clase y forzar un reflow para que el navegador relance el keyframe.
    app.classList.remove('in');
    void app.offsetWidth;
    app.classList.add('in');
  }
}

// ---------------------------------------------------------------------------
// Control de versión. La app pregunta al servidor qué versión hay publicada; si no
// coincide con la suya, este móvil está usando una copia cacheada y hay que refrescarla.
// ---------------------------------------------------------------------------
async function checkVersion() {
  try {
    const res = await fetch('./version.json', { cache: 'no-store' });
    if (!res.ok) return;
    const remota = (await res.json()).version;
    if (!remota || remota === VERSION) return;
    const bar = document.getElementById('update');
    bar.querySelector('.upd-txt').innerHTML = t('updateNew', esc(remota), VERSION);
    document.getElementById('upd-go').textContent = t('updateBtn');
    bar.hidden = false;
  } catch {
    /* sin conexión: se comprueba en la próxima apertura */
  }
}

document.getElementById('upd-go').onclick = async () => {
  const btn = document.getElementById('upd-go');
  btn.textContent = t('updating');
  btn.disabled = true;
  try {
    for (const k of await caches.keys()) await caches.delete(k);
    const regs = await navigator.serviceWorker?.getRegistrations?.() ?? [];
    for (const r of regs) await r.unregister();
  } catch { /* da igual: recargamos de todas formas */ }
  location.reload();
};
document.getElementById('upd-x').onclick = () => { document.getElementById('update').hidden = true; };

document.addEventListener('gym:storage-error', () =>
  toast(t('storageError')));
addEventListener('online', () => syncBoth(false));

/**
 * Refresco silencioso de la propia fila de cuenta: así una rutina editada por el
 * admin llega al móvil del usuario en la siguiente apertura con red.
 */
async function refreshAccount() {
  const u = db.getUser();
  if (!u || !db.isConfigured() || !navigator.onLine) return;
  try {
    const row = await db.fetchUserRow(u);
    if (!row) {
      // La cuenta ya no existe (borrada por el admin): fuera de la sesión.
      db.removeAccount(u); db.setUser(null); state.user = null;
    } else {
      db.cacheAccount(row);
    }
    render();
  } catch { /* sin red: se reintenta en la próxima apertura */ }
}

render();
syncBoth(false);
refreshAccount();
checkVersion();
