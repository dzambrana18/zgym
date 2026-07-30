// Animaciones de técnica. Cada patrón de movimiento son dos posiciones (inicio ↔ final)
// que la app alterna en bucle: un "GIF" hecho con SVG + CSS.
//
// Por qué así y no GIFs de verdad: 60 ejercicios × ~500 KB serían 30 MB que romperían el
// modo offline, no puedo verificar los derechos de imágenes de terceros, y un iframe de vídeo
// necesita conexión. Esto pesa unos pocos KB, funciona sin cobertura y es dibujo propio.
//
// Se agrupa por PATRÓN de movimiento, no por ejercicio: el press de banca con barra y con
// mancuernas se ejecutan igual, así que comparten animación.
// Los enlaces "Ver técnica" a YouTube siguen ahí para quien quiera ver a una persona real.

const S = (d) => `<path d="${d}"/>`;
const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
// barra con discos, horizontal a la altura y
const BAR = (y, x1 = 30, x2 = 70) =>
  S(`M${x1} ${y} H${x2}`) + S(`M${x1 + 1} ${y - 7} V${y + 7}`) + S(`M${x2 - 1} ${y - 7} V${y + 7}`);
// mancuerna horizontal centrada en (x,y): barra con tope a cada lado, para que no
// se confunda con un simple guion cuando cuelga al final del brazo
const DB = (x, y) =>
  S(`M${x - 7} ${y} H${x + 7}`) + S(`M${x - 7} ${y - 3.5} V${y + 3.5}`) + S(`M${x + 7} ${y - 3.5} V${y + 3.5}`);
const FLOOR = S('M8 88 H92');

export const MOVES = {
  // ---------------------------------------------------------------- empujes
  'press-banca': {
    base: S('M14 66 H82') + S('M22 66 V82') + S('M74 66 V82') + C(24, 56, 6) + S('M31 60 H60') + S('M60 60 L70 72 L74 82'),
    a: S('M36 58 L44 34') + BAR(32, 28, 72),
    b: S('M36 58 L30 44 L44 50') + BAR(48, 28, 72),
  },
  'press-inclinado': {
    base: S('M16 80 L56 48') + S('M16 80 H36') + S('M22 80 V90') + C(58, 43, 6) + S('M28 74 L52 54'),
    a: S('M46 60 L54 34') + BAR(32, 34, 74),
    b: S('M46 60 L40 46 L54 48') + BAR(46, 34, 74),
  },
  'press-vertical': {
    base: C(50, 30, 6.5) + S('M50 37 V64') + S('M50 64 L42 86') + S('M50 64 L58 86'),
    a: S('M45 42 L38 20') + S('M55 42 L62 20') + BAR(18),
    b: S('M45 42 L34 40 L38 28') + S('M55 42 L66 40 L62 28') + BAR(26),
  },
  fondos: {
    base: S('M10 40 H34') + S('M66 40 H90'),
    a: C(50, 22, 6.5) + S('M50 29 V56') + S('M45 32 L30 40') + S('M55 32 L70 40') + S('M50 56 L44 74 L58 82'),
    b: C(50, 36, 6.5) + S('M50 43 V68') + S('M45 46 L31 48 L30 40') + S('M55 46 L69 48 L70 40') + S('M50 68 L44 84 L58 90'),
  },
  apertura: {
    base: S('M10 14 V84') + S('M90 14 V84') + C(50, 26, 6.5) + S('M50 33 V62') + S('M50 62 L42 86') + S('M50 62 L58 86'),
    a: S('M45 38 L20 28') + S('M55 38 L80 28'),
    b: S('M45 38 L48 52') + S('M55 38 L52 52') + S('M48 52 L20 28') + S('M52 52 L80 28'),
  },

  // ---------------------------------------------------------------- tirones
  jalon: {
    base: S('M50 4 V14') + S('M36 72 H64') + C(50, 34, 6.5) + S('M50 41 V70') + S('M50 70 L64 80 L64 90'),
    a: BAR(16, 26, 74) + S('M44 44 L34 30 L31 18') + S('M56 44 L66 30 L69 18'),
    b: BAR(44, 28, 72) + S('M44 45 L36 56 L41 45') + S('M56 45 L64 56 L59 45'),
  },
  dominada: {
    base: S('M18 12 H82'),
    a: C(50, 34, 6.5) + S('M40 14 L46 40') + S('M60 14 L54 40') + S('M50 41 V64') + S('M50 64 L44 84') + S('M50 64 L56 84'),
    b: C(50, 22, 6.5) + S('M40 14 L34 26 L44 31') + S('M60 14 L66 26 L56 31') + S('M50 29 V52') + S('M50 52 L44 74') + S('M50 52 L56 74'),
  },
  'remo-horizontal': {
    base: S('M12 74 H44') + S('M18 74 V86') + S('M40 74 V86') + C(32, 44, 6.5) + S('M32 51 V72') + S('M34 72 L60 78 L66 68'),
    a: S('M38 56 L64 58') + S('M64 52 V64') + S('M64 58 H90'),
    b: S('M38 56 L50 64 L44 56') + S('M44 50 V62') + S('M44 56 H90'),
  },
  'remo-mancuerna': {
    base: S('M52 68 H90') + C(74, 32, 6.5) + S('M69 37 L38 48') + S('M66 41 V66') + S('M38 48 L34 68 L32 84') + S('M24 86 H44'),
    a: S('M46 46 L48 66') + DB(48, 68),
    b: S('M46 46 L52 58 L48 48') + DB(48, 50),
  },
  'remo-barra': {
    base: C(72, 30, 6.5) + S('M67 35 L36 46') + S('M36 46 L34 66 L32 84') + S('M24 86 H44'),
    a: S('M52 42 V62') + BAR(64, 32, 84),
    b: S('M52 42 L46 54 L52 50') + BAR(52, 32, 84),
  },
  pullover: {
    base: S('M86 8 V82') + C(86, 14, 4) + C(46, 30, 6.5) + S('M46 37 V62') + S('M46 62 L38 86') + S('M46 62 L54 86'),
    a: S('M50 40 L70 26') + S('M70 26 L86 18'),
    b: S('M50 40 L62 58') + S('M62 58 L86 19'),
  },
  'face-pull': {
    base: S('M88 12 V88') + C(44, 26, 6.5) + S('M44 33 V62') + S('M44 62 L36 86') + S('M44 62 L52 86'),
    a: S('M49 34 L74 31') + S('M74 31 H88'),
    b: S('M49 31 L60 21') + S('M49 37 L60 33') + S('M60 27 H88'),
  },
  pajaros: {
    // tronco inclinado hacia delante: hombros por delante de la cadera
    base: C(50, 28, 6.5) + S('M40 39 H60') + S('M50 35 L52 58') + S('M52 58 L45 84') + S('M52 58 L59 84'),
    a: S('M40 39 V62') + S('M60 39 V62') + DB(40, 64) + DB(60, 64),
    b: S('M40 39 L20 34') + S('M60 39 L80 34') + S('M14 30 V40') + S('M86 30 V40'),
  },
  encogimiento: {
    base: C(50, 22, 6.5) + S('M50 34 V60') + S('M50 60 L42 86') + S('M50 60 L58 86'),
    a: S('M38 36 H62') + S('M38 36 V58') + S('M62 36 V58') + DB(38, 60) + DB(62, 60),
    b: S('M38 29 H62') + S('M38 29 V51') + S('M62 29 V51') + DB(38, 53) + DB(62, 53),
  },

  // ---------------------------------------------------------------- brazos
  'curl-biceps': {
    // hombros como línea horizontal: sin esto los brazos caen sobre el torso y no se distinguen
    base: C(50, 20, 6.5) + S('M40 31 H60') + S('M50 27 V58') + S('M50 58 L43 84') + S('M50 58 L57 84'),
    a: S('M40 31 V56') + S('M60 31 V56') + DB(40, 58) + DB(60, 58),
    b: S('M40 31 L37 47 L42 35') + S('M60 31 L63 47 L58 35') + DB(42, 33) + DB(58, 33),
  },
  'extension-triceps': {
    base: S('M84 8 V86') + C(84, 14, 4) + C(44, 24, 6.5) + S('M44 31 V60') + S('M44 60 L36 86') + S('M44 60 L52 86'),
    a: S('M50 34 L55 46 L49 35') + S('M50 34 L84 20'),
    b: S('M50 34 L55 46 L61 57') + S('M61 57 L84 20'),
  },
  'press-frances': {
    base: S('M14 70 H84') + S('M22 70 V84') + S('M76 70 V84') + C(26, 62, 6) + S('M33 66 H64') + S('M64 66 L74 78'),
    a: S('M38 64 L44 44') + BAR(42, 30, 58),
    b: S('M38 64 L44 44 L32 36') + BAR(34, 20, 48),
  },
  'elevacion-lateral': {
    base: C(50, 20, 6.5) + S('M40 31 H60') + S('M50 27 V58') + S('M50 58 L43 84') + S('M50 58 L57 84'),
    a: S('M40 31 V55') + S('M60 31 V55') + DB(40, 57) + DB(60, 57),
    b: S('M40 31 L20 38') + S('M60 31 L80 38') + S('M14 34 V44') + S('M86 34 V44'),
  },

  // ---------------------------------------------------------------- piernas
  sentadilla: {
    base: '',
    a: C(52, 20, 6.5) + S('M52 27 V54') + S('M52 54 L43 82') + S('M52 54 L61 82') + S('M38 84 H66')
      + S('M40 30 V39') + S('M64 30 V39') + BAR(30, 32, 72),
    b: C(56, 34, 6.5) + S('M54 41 L44 60') + S('M44 60 L64 65 L62 84') + S('M54 86 H72') + S('M50 45 L41 44') + BAR(44, 36, 76),
  },
  bisagra: {
    a: C(50, 20, 6.5) + S('M42 31 H58') + S('M50 27 V54') + S('M50 54 L48 84') + S('M40 86 H60')
      + S('M42 31 V56') + S('M58 31 V56') + BAR(58, 34, 66),
    b: C(70, 28, 6.5) + S('M65 33 L40 48') + S('M40 48 L42 68 L40 84') + S('M32 86 H52') + S('M58 38 L56 62') + BAR(64, 40, 76),
  },
  // Máquina de hip thrust cargada con discos (Technogym), no barra:
  // respaldo fijo detrás y almohadilla acolchada sobre la cadera.
  'hip-thrust': {
    base: S('M10 24 V72') + S('M10 52 H34') + C(18, 42, 6),
    a: S('M25 46 L52 52') + S('M52 52 L72 56 L76 82') + S('M68 84 H88')
      + S('M44 44 H64') + S('M44 44 V50') + S('M64 44 V50') + S('M54 44 V32'),
    b: S('M25 45 L54 38') + S('M54 38 L74 44 L78 82') + S('M70 84 H90')
      + S('M46 30 H66') + S('M46 30 V36') + S('M66 30 V36') + S('M56 30 V20'),
  },
  zancada: {
    base: S('M18 78 H36'),
    a: C(48, 18, 6.5) + S('M48 25 V50') + S('M48 50 L60 68 L60 84') + S('M48 50 L34 62 L26 78') + S('M43 30 L40 52') + S('M53 30 L56 52') + DB(40, 54) + DB(56, 54),
    b: C(48, 30, 6.5) + S('M48 37 V58') + S('M48 58 L64 68 L64 86') + S('M48 58 L36 72 L28 79') + S('M43 42 L40 62') + S('M53 42 L56 62') + DB(40, 64) + DB(56, 64),
  },
  prensa: {
    base: S('M8 80 L30 52') + S('M8 80 H26') + S('M14 80 V90') + C(34, 46, 6) + S('M26 72 L31 53'),
    a: S('M26 72 L58 56 L76 42') + S('M66 28 L90 52'),
    b: S('M26 72 L50 52 L58 34') + S('M48 22 L72 46'),
  },
  'curl-femoral': {
    base: S('M14 60 H68') + S('M18 60 V78') + S('M64 60 V78') + C(22, 50, 6) + S('M29 54 H60'),
    a: S('M60 54 L84 58') + C(86, 58, 5),
    b: S('M60 54 L72 56 L78 32') + C(80, 30, 5),
  },
  'extension-cuadriceps': {
    base: S('M16 60 H48') + S('M16 60 V32') + S('M20 78 V60') + S('M44 78 V60') + C(24, 26, 6) + S('M22 34 V58') + S('M26 58 H52'),
    a: S('M52 58 L57 80') + C(58, 82, 5),
    b: S('M52 58 L78 50') + C(80, 49, 5),
  },
  gemelo: {
    base: S('M30 90 H70'),
    a: C(50, 18, 6.5) + S('M40 29 H60') + S('M50 25 V52') + S('M40 29 V52') + S('M60 29 V52')
      + S('M50 52 L43 80') + S('M50 52 L57 80') + S('M37 82 H63'),
    b: C(50, 10, 6.5) + S('M40 21 H60') + S('M50 17 V44') + S('M40 21 V44') + S('M60 21 V44')
      + S('M50 44 L43 72') + S('M50 44 L57 72') + S('M39 72 L47 82') + S('M61 72 L53 82'),
  },
  abduccion: {
    base: C(50, 22, 7) + S('M50 29 V46') + S('M34 46 H66'),
    a: S('M50 46 L44 70 L44 86') + S('M50 46 L56 70 L56 86'),
    b: S('M50 46 L28 66 L22 86') + S('M50 46 L72 66 L78 86'),
  },

  // Caminata del granjero: los brazos solo cuelgan, lo que se alterna son las piernas.
  'caminata-granjero': {
    base: S('M8 92 H92') + C(50, 14, 6) + S('M38 25 H62') + S('M50 20 V50')
      + S('M38 25 V58') + S('M62 25 V58') + DB(38, 62) + DB(62, 62),
    a: S('M50 50 L40 72 L37 90') + S('M50 50 L60 70 L66 90'),
    b: S('M50 50 L60 72 L63 90') + S('M50 50 L40 70 L34 90'),
  },

  // ---------------------------------------------------------------- core
  plancha: {
    static: true,
    a: FLOOR + C(22, 52, 6.5) + S('M29 56 L58 64 L80 76') + S('M30 58 L26 76 L16 86') + S('M80 76 L86 88'),
  },
  'plancha-lateral': {
    static: true,
    a: FLOOR + C(24, 44, 6.5) + S('M31 49 L84 80') + S('M30 52 L26 86') + S('M35 47 L38 20'),
  },
  'dead-bug': {
    base: FLOOR + C(22, 76, 6.5) + S('M29 78 H60'),
    a: S('M38 78 L30 50') + S('M60 78 L70 54 L88 50') + S('M60 78 L84 84'),
    b: S('M38 78 L14 70') + S('M60 78 L86 74') + S('M60 78 L70 54 L88 50'),
  },
  crunch: {
    base: FLOOR + C(19, 70, 6.5) + S('M26 74 H54') + S('M31 74 L24 60'),
    a: S('M54 74 L80 82'),
    b: S('M54 74 L70 54 L66 36'),
  },
  'rueda-abdominal': {
    base: FLOOR,
    a: C(38, 58, 6.5) + S('M44 62 L34 80') + S('M46 64 L62 73') + C(70, 80, 8),
    b: C(30, 66, 6.5) + S('M37 70 L27 82') + S('M40 70 L74 77') + C(84, 80, 8),
  },
};

/** SVG animado del patrón. Si el ejercicio no declara uno, devuelve null. */
export function moveSvg(pattern) {
  const m = MOVES[pattern];
  if (!m) return null;
  const base = m.base || '';
  const g = (cls, body) => `<g class="${cls}" fill="none" stroke="currentColor" stroke-width="4"
      stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
  if (m.static) {
    return `<svg class="move" viewBox="0 0 100 100" role="img" aria-label="Técnica del ejercicio">${g('mv', base + m.a)}</svg>`;
  }
  return `<svg class="move" viewBox="0 0 100 100" role="img" aria-label="Técnica del ejercicio">
    ${g('mv', base)}${g('mv mv-a', m.a)}${g('mv mv-b', m.b)}</svg>`;
}
