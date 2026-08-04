// Service worker mínimo: cachea el shell para que la app abra sin cobertura en el gimnasio.
// Todas las rutas son RELATIVAS porque en GitHub Pages la app vive en un subdirectorio
// (usuario.github.io/gym/), no en la raíz del dominio.

// Subir la versión al añadir archivos: fuerza a reconstruir la caché en los móviles.
const CACHE = 'gym-v7';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './accounts.js',
  './store.js',
  './routines.js',
  './progression.js',
  './i18n.js',
  './lang-ca.js',
  './lang-en.js',
  './moves.js',
  './nutrition.js',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-512.png',
  // Las demás fotos se cachean al verlas (network-first), pero esta sale en la pantalla
  // de acceso, que es la primera: tiene que estar desde el primer arranque.
  './photos/barbell-squat-0.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    // addAll falla entero si un archivo falta; añadimos uno a uno para ser tolerantes.
    caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  // Las peticiones a Supabase nunca se cachean: las gestiona la cola de store.js.
  if (!request.url.startsWith(self.location.origin)) return;
  // version.json siempre a red y sin guardar: es el testigo que delata una copia vieja.
  // Si se cacheara, la app compararía su versión contra su propia caché y nunca detectaría nada.
  if (new URL(request.url).pathname.endsWith('/version.json')) return;

  // Network-first con caída a caché: así un push nuevo se ve al recargar con datos,
  // pero la app sigue abriendo sin conexión.
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html')))
  );
});
