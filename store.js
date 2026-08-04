// Almacenamiento local-first.
// localStorage es la FUENTE DE VERDAD: toda escritura entra ahí al instante, así que la app
// funciona igual en un sótano sin cobertura. Cada registro se encola además en 'pendingSync',
// que se vacía contra Supabase al abrir la app y en el evento 'online'.

// ---------------------------------------------------------------------------
// CONFIGURACIÓN DE SUPABASE — rellenar tras crear el proyecto (ver README.md).
// Si se dejan vacíos, la app funciona igual pero solo en local (sin copia en la nube).
// Vale tanto la clave antigua "anon public" (empieza por eyJ...) como la nueva
// "publishable" (empieza por sb_publishable_...).
// ---------------------------------------------------------------------------
export const SUPABASE_URL = 'https://plygeoeycaxuutzgpdis.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseWdlb2V5Y2F4dXV0emdwZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MzUyMzQsImV4cCI6MjEwMTAxMTIzNH0.6oN6a-r8x95pHuvqyz828cht4AA1SBVzcpYauFFJNwc';

// Las claves nuevas (sb_publishable_...) no son JWT: enviarlas como Bearer hace que
// PostgREST intente decodificarlas y falle. Solo las antiguas van en Authorization.
function authHeaders() {
  const h = { apikey: SUPABASE_ANON_KEY };
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) h.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  return h;
}

const K = {
  user: 'gym.user',
  accounts: 'gym.accounts',
  sets: (u) => `gym.${u}.sets`,
  body: (u) => `gym.${u}.body`,
  meso: (u) => `gym.${u}.mesocycleStart`,
  queue: 'gym.pendingSync',
  lastSync: 'gym.lastSync',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    // Cuota llena o modo privado de Safari. Avisamos en vez de perder el dato en silencio.
    console.error('No se pudo guardar en localStorage', err);
    document.dispatchEvent(new CustomEvent('gym:storage-error'));
    return false;
  }
}

export function todayISO(d = new Date()) {
  // Fecha local, no UTC: entrenar a las 22:00 no debe contar como el día siguiente.
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// --- usuario ---------------------------------------------------------------
export const getUser = () => read(K.user, null);
export const setUser = (u) => write(K.user, u);

// --- cuentas (filas de la tabla `users` cacheadas para funcionar offline) ---
// Guarda la cuenta propia y las que el admin haya abierto. La fila cacheada es
// la rutina: sin ella la app no sabe qué entrenar, por eso el primer login
// necesita red y los siguientes no.
export const getAccounts = () => read(K.accounts, {});
export const getAccount = (username) => getAccounts()[username] || null;
export function cacheAccount(row) {
  const all = getAccounts();
  all[row.username] = row;
  write(K.accounts, all);
}
export function removeAccount(username) {
  const all = getAccounts();
  delete all[username];
  write(K.accounts, all);
}

/** user_key remoto de cada cuenta cacheada, para la cola de sincronización. */
export const remoteKeys = () =>
  Object.fromEntries(Object.values(getAccounts()).map((r) => [r.username, r.remote_key]));

// --- tabla `users` en Supabase ----------------------------------------------
async function usersFetch(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users${path}`, {
    ...opts,
    headers: { ...authHeaders(), 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`users: HTTP ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

export async function fetchUserRow(username) {
  const rows = await usersFetch(`?username=eq.${encodeURIComponent(username)}&select=*`);
  return rows[0] || null;
}

/** Alta. Si el username ya existe, PostgREST devuelve 409 y esto lanza. */
export async function insertUserRow(row) {
  await usersFetch('', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
}

/** Actualización parcial: solo las columnas del patch (rutina, pin_hash...). */
export async function updateUserRow(username, patch) {
  await usersFetch(`?username=eq.${encodeURIComponent(username)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  });
}

export async function listUserRows() {
  return usersFetch('?select=*&order=created_at.asc');
}

export async function deleteUserRow(username) {
  await usersFetch(`?username=eq.${encodeURIComponent(username)}`, { method: 'DELETE' });
}

// --- mesociclo -------------------------------------------------------------
export function getMesocycleStart(u) {
  let s = read(K.meso(u), null);
  if (!s) {
    s = todayISO();
    write(K.meso(u), s);
  }
  return s;
}
export const setMesocycleStart = (u, iso) => write(K.meso(u), iso);

// --- series ----------------------------------------------------------------
export const getSets = (u) => read(K.sets(u), []);

export function getSetsFor(u, exerciseKey) {
  return getSets(u).filter((s) => s.exerciseKey === exerciseKey);
}

/** Guarda (o sobrescribe) una serie concreta de la sesión de hoy. */
export function logSet(u, { dayKey, exerciseKey, setIndex, weight, reps, rir, loggedAt }) {
  const date = loggedAt || todayISO();
  const all = getSets(u);
  const i = all.findIndex(
    (s) => s.loggedAt === date && s.exerciseKey === exerciseKey && s.setIndex === setIndex
  );
  const record = {
    clientId: i >= 0 ? all[i].clientId : uuid(),
    loggedAt: date,
    dayKey,
    exerciseKey,
    setIndex,
    weight: weight === '' || weight == null ? null : Number(weight),
    reps: reps === '' || reps == null ? null : Number(reps),
    rir: rir === '' || rir == null ? null : Number(rir),
  };
  if (i >= 0) all[i] = record;
  else all.push(record);
  write(K.sets(u), all);
  enqueue('sets_log', u, record);
  return record;
}

export function deleteSet(u, { exerciseKey, setIndex, loggedAt }) {
  const date = loggedAt || todayISO();
  const all = getSets(u).filter(
    (s) => !(s.loggedAt === date && s.exerciseKey === exerciseKey && s.setIndex === setIndex)
  );
  write(K.sets(u), all);
}

// --- peso corporal y cintura ----------------------------------------------
export const getBody = (u) =>
  read(K.body(u), []).slice().sort((a, b) => (a.loggedAt < b.loggedAt ? -1 : 1));

export function logBody(u, { weightKg, waistCm, loggedAt }) {
  const date = loggedAt || todayISO();
  const all = read(K.body(u), []);
  const i = all.findIndex((b) => b.loggedAt === date);
  const record = {
    clientId: i >= 0 ? all[i].clientId : uuid(),
    loggedAt: date,
    weightKg: weightKg === '' || weightKg == null ? null : Number(weightKg),
    waistCm: waistCm === '' || waistCm == null ? null : Number(waistCm),
  };
  if (i >= 0) all[i] = record;
  else all.push(record);
  write(K.body(u), all);
  enqueue('body_log', u, record);
  return record;
}

// --- cola de sincronización ------------------------------------------------
function enqueue(table, userKey, record) {
  const q = read(K.queue, []);
  // Una entrada por (tabla, clientId): reeditar una serie no crea una segunda pendiente.
  const i = q.findIndex((e) => e.table === table && e.record.clientId === record.clientId);
  const entry = { table, userKey, record };
  if (i >= 0) q[i] = entry;
  else q.push(entry);
  write(K.queue, q);
}

export const pendingCount = () => read(K.queue, []).length;
export const getLastSync = () => read(K.lastSync, null);
export const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function toRow(table, userKey, r, remoteKey) {
  const base = { user_key: remoteKey, logged_at: r.loggedAt, client_id: r.clientId };
  return table === 'sets_log'
    ? { ...base, day_key: r.dayKey, exercise_key: r.exerciseKey, set_index: r.setIndex, weight: r.weight, reps: r.reps, rir: r.rir }
    : { ...base, weight_kg: r.weightKg, waist_cm: r.waistCm };
}

/**
 * Vacía la cola contra Supabase. Idempotente: el upsert va por client_id, así que
 * reenviar la misma entrada nunca duplica filas.
 * Devuelve {ok, sent, error}.
 */
export async function syncNow(remoteKeys) {
  if (!isConfigured()) return { ok: false, sent: 0, error: 'sin-configurar' };
  if (!navigator.onLine) return { ok: false, sent: 0, error: 'sin-conexion' };

  const queue = read(K.queue, []);
  if (queue.length === 0) {
    write(K.lastSync, new Date().toISOString());
    return { ok: true, sent: 0 };
  }

  // Agrupamos por tabla para hacer una sola petición por tabla.
  const byTable = new Map();
  for (const e of queue) {
    const remote = remoteKeys[e.userKey];
    if (!remote) continue;
    if (!byTable.has(e.table)) byTable.set(e.table, []);
    byTable.get(e.table).push(toRow(e.table, e.userKey, e.record, remote));
  }

  const done = [];
  try {
    for (const [table, rows] of byTable) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=client_id`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(rows),
      });
      if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
      done.push(table);
    }
  } catch (err) {
    // Solo quitamos de la cola lo que sí se confirmó. El resto se reintenta.
    write(K.queue, queue.filter((e) => !done.includes(e.table)));
    return { ok: false, sent: 0, error: String(err.message || err) };
  }

  write(K.queue, []);
  write(K.lastSync, new Date().toISOString());
  return { ok: true, sent: queue.length };
}

// --- recuperar desde la nube ----------------------------------------------
async function fetchTable(table, remoteKey) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?user_key=eq.${encodeURIComponent(remoteKey)}&select=*`;
  const res = await fetch(url, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Baja lo que haya en Supabase y lo fusiona con lo local.
 * Sin esto, si un móvil pierde el localStorage los datos estarían en la nube pero
 * la app no los recuperaría nunca — que es justo para lo que sirve tener nube.
 *
 * Fusión por clientId: lo LOCAL siempre gana, porque puede tener ediciones aún sin
 * subir. De la nube solo entran las filas que aquí no existen.
 */
export async function pullFromCloud(remoteKeys) {
  if (!isConfigured()) return { ok: false, error: 'sin-configurar' };
  if (!navigator.onLine) return { ok: false, error: 'sin-conexion' };

  let nuevasSets = 0, nuevasBody = 0;
  try {
    for (const [userKey, remote] of Object.entries(remoteKeys)) {
      const sets = await fetchTable('sets_log', remote);
      const locales = getSets(userKey);
      const vistos = new Set(locales.map((s) => s.clientId));
      for (const r of sets) {
        if (vistos.has(r.client_id)) continue;
        locales.push({
          clientId: r.client_id, loggedAt: r.logged_at, dayKey: r.day_key,
          exerciseKey: r.exercise_key, setIndex: r.set_index,
          weight: r.weight == null ? null : Number(r.weight),
          reps: r.reps == null ? null : Number(r.reps),
          rir: r.rir == null ? null : Number(r.rir),
        });
        nuevasSets++;
      }
      write(K.sets(userKey), locales);

      const body = await fetchTable('body_log', remote);
      const bl = read(K.body(userKey), []);
      const vb = new Set(bl.map((b) => b.clientId));
      for (const r of body) {
        if (vb.has(r.client_id)) continue;
        bl.push({
          clientId: r.client_id, loggedAt: r.logged_at,
          weightKg: r.weight_kg == null ? null : Number(r.weight_kg),
          waistCm: r.waist_cm == null ? null : Number(r.waist_cm),
        });
        nuevasBody++;
      }
      write(K.body(userKey), bl);
    }
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
  return { ok: true, sets: nuevasSets, body: nuevasBody };
}

// --- copia de seguridad manual --------------------------------------------
export function exportAll() {
  // Lista dinámica: cualquier usuario con datos guardados en este móvil entra en la copia.
  const users = [...new Set(
    Object.keys(localStorage).map((k) => /^gym\.(.+)\.(sets|body|mesocycleStart)$/.exec(k)?.[1]).filter(Boolean)
  )];
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    data: Object.fromEntries(
      users.map((u) => [u, { sets: getSets(u), body: read(K.body(u), []), mesocycleStart: read(K.meso(u), null) }])
    ),
  };
}

export function importAll(payload) {
  if (!payload?.data) throw new Error('Archivo no reconocido');
  for (const [u, d] of Object.entries(payload.data)) {
    if (Array.isArray(d.sets)) write(K.sets(u), d.sets);
    if (Array.isArray(d.body)) write(K.body(u), d.body);
    if (d.mesocycleStart) write(K.meso(u), d.mesocycleStart);
  }
}
