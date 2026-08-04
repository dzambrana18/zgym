// Genera icon-180.png e icon-512.png: el icono de la app.
//
// Se dibuja aquí en vez de exportarlo de un editor para que el icono sea reproducible y
// se pueda retocar cambiando un número (ver MARK). No usa dependencias: la única cosa
// "difícil" de un PNG es el CRC de cada chunk y la compresión, y zlib ya viene en Node.
//
//   node make-icon.mjs
//
// La marca es una mancuerna, la misma silueta que el icono de la pestaña Entreno: barra
// central, dos discos altos y dos discos bajos, todo en rectángulos redondeados. Sin
// esquinas redondeadas en la lámina (iOS aplica su propia máscara y redondear dos veces
// deja un borde sucio) y sin glow.

import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';

// --- paleta, la misma de styles.css -----------------------------------------
const PLATE_TOP = [0x14, 0x15, 0x1b];
const PLATE_BOT = [0x08, 0x08, 0x0a];
const HALO = [0x7f, 0x8c, 0xf0];       // periwinkle, la luz ambiental de la app
const HALO_MAX = 0.22;                 // opacidad de la luz en su centro
const HALO_R = 1.3;                    // radio de la luz, en lados. Ancho = lavado; corto = mancha
const INK = [0xf4, 0xf4, 0xf6];        // blanco roto de la marca

// --- MARK: geometría de la mancuerna, en fracciones del lado ----------------
// Rectángulos redondeados [centroX, centroY, ancho, alto, radio]. Todo queda dentro del
// 80 % central, que es la zona segura de un icono maskable: el extremo más lejano es
// 0,285 + 0,04 = 0,325 del centro, o sea que la marca va de 0,175 a 0,825.
const MARK = [
  [0.5, 0.5, 0.24, 0.1, 0.048],        // barra central
  [0.337, 0.5, 0.1, 0.355, 0.048],     // disco alto izquierdo
  [0.663, 0.5, 0.1, 0.355, 0.048],     // disco alto derecho
  [0.215, 0.5, 0.08, 0.225, 0.038],    // disco bajo izquierdo
  [0.785, 0.5, 0.08, 0.225, 0.038],    // disco bajo derecho
];
const SS = 3;                          // supermuestreo por eje (3x3 por píxel)

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Distancia con signo de un punto a un rectángulo redondeado. Negativa dentro. Se usa en
 * vez de pintar rectángulos porque así el supermuestreo da el antialias gratis y las
 * cinco piezas se funden en una sola silueta donde se solapan.
 */
function rrDist(px, py, cx, cy, w, h, r) {
  const dx = Math.max(Math.abs(px - cx) - (w / 2 - r), 0);
  const dy = Math.max(Math.abs(py - cy) - (h / 2 - r), 0);
  return Math.hypot(dx, dy) - r;
}

function render(S) {
  const parts = MARK.map(([cx, cy, w, h, r]) => [cx * S, cy * S, w * S, h * S, r * S]);
  const px = Buffer.alloc(S * S * 3);
  const cx = S / 2, hy = -0.1 * S, hr = HALO_R * S;   // centro y radio de la luz

  for (let y = 0; y < S; y++) {
    // fondo: degradado vertical + luz radial desde arriba
    for (let x = 0; x < S; x++) {
      const t = y / (S - 1);
      let cr = lerp(PLATE_TOP[0], PLATE_BOT[0], t);
      let cg = lerp(PLATE_TOP[1], PLATE_BOT[1], t);
      let cb = lerp(PLATE_TOP[2], PLATE_BOT[2], t);

      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - hy) / hr;
      if (d < 1) {
        // caída suave: 1-d al cuadrado, para que el halo no tenga un borde visible
        const a = HALO_MAX * (1 - d) * (1 - d);
        cr = lerp(cr, HALO[0], a);
        cg = lerp(cg, HALO[1], a);
        cb = lerp(cb, HALO[2], a);
      }

      // cobertura de la marca con supermuestreo 3x3
      let hit = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS, fy = y + (sy + 0.5) / SS;
          for (const p of parts) {
            if (rrDist(fx, fy, p[0], p[1], p[2], p[3], p[4]) <= 0) { hit++; break; }
          }
        }
      }
      if (hit) {
        const a = hit / (SS * SS);
        cr = lerp(cr, INK[0], a);
        cg = lerp(cg, INK[1], a);
        cb = lerp(cb, INK[2], a);
      }

      const i = (y * S + x) * 3;
      px[i] = Math.round(cr); px[i + 1] = Math.round(cg); px[i + 2] = Math.round(cb);
    }
  }
  return px;
}

// --- PNG --------------------------------------------------------------------
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(S, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0);
  ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8;    // 8 bits por canal
  ihdr[9] = 2;    // color type 2 = RGB sin alfa
  // Cada scanline lleva delante su byte de filtro. 0 = sin filtro: el icono son
  // degradados suaves y zlib ya los comprime bien sin complicar esto.
  const raw = Buffer.alloc(S * (S * 3 + 1));
  for (let y = 0; y < S; y++) {
    raw[y * (S * 3 + 1)] = 0;
    px.copy(raw, y * (S * 3 + 1) + 1, y * S * 3, (y + 1) * S * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const S of [180, 512]) {
  const file = `icon-${S}.png`;
  const buf = png(S, render(S));
  writeFileSync(file, buf);
  console.log(`${file}  ${S}x${S}  ${(buf.length / 1024).toFixed(1)} kB`);
}
