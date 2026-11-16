/* muévete.pe · service worker
   - Páginas, JS y datos: primero la red (siempre lo último); si no hay conexión, la copia guardada.
   - Imágenes y fuentes: la copia guardada al instante y se actualiza por detrás.
   - Supabase y videos: no se tocan (siempre en vivo). */
const VERSION = 'muevete-v4';
const PAGINAS = ['/', '/ranking', '/mi-cuenta', '/uma-go', '/terminos-y-condiciones',
                 '/inscripciones', '/bases', '/ronda', '/campo'];
const ARCHIVOS = ['/js/ruta.js', '/js/app.js', '/js/config.js', '/js/auth.js', '/js/pie.js', '/js/menu-pill.js',
                  '/js/ranking-datos.js', '/js/inscripciones-datos.js', '/js/partidos-datos.js',
                  '/js/perfil-jugador.js', '/js/selector-fecha.js',
                  '/img/favicon-192.png', '/img/logo-muevete.png', '/img/avatar.png', '/media/fondo-poster.jpg',
                  '/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c =>
    Promise.all([...PAGINAS, ...ARCHIVOS].map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))
  ).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Página guardada que corresponde a una dirección (ej. /sombrillas/ronda1/campo3 → /campo)
function plantilla(path) {
  const p = path.replace(/\.html$/, '').split('/').filter(Boolean);
  const ult = p[p.length - 1] || '';
  if (/^campo\d+$/.test(ult)) return '/campo';
  if (/^ronda\d+$/.test(ult)) return '/ronda';
  if (!p.length) return '/';
  return '/' + ult;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google: guardadas
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(guardadaYActualiza(req)); return; }
  if (url.origin !== location.origin) return;            // Supabase, CDN, etc.
  if (url.pathname.startsWith('/media/') && url.pathname.endsWith('.mp4')) return;  // videos

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(VERSION).then(k => k.put(plantilla(url.pathname), c)); }
      return r;
    }).catch(() => caches.match(plantilla(url.pathname)).then(r => r || caches.match('/'))));
    return;
  }
  if (/\.(png|jpe?g|svg|ico|webp|gif|woff2?)$/.test(url.pathname)) { e.respondWith(guardadaYActualiza(req)); return; }
  e.respondWith(primeroRed(req));
});

function primeroRed(req) {
  return fetch(req).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(VERSION).then(k => k.put(req, c)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }));
}
function guardadaYActualiza(req) {
  return caches.match(req).then(g => {
    const red = fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(k => k.put(req, c)); }
      return r;
    }).catch(() => g);
    return g || red;
  });
}
