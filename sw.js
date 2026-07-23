const CACHE_NAME = 'nasser-group-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
  // Nota: No cacheamos las llamadas a la API de Google Sheets 
  // para asegurar que los datos (notas, asistencia, pagos) estén siempre actualizados.
];

// 1. Instalar el Service Worker y guardar en caché los archivos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caché abierta y archivos guardados');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Interceptar peticiones: Si está en caché, lo muestra. Si no, lo pide a la red.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si es un archivo de la app (HTML, CSS, JS), usa la caché
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si es una llamada a la API (Google Sheets) o algo nuevo, ve a la red
      return fetch(event.request).catch(() => {
        // Fallback por si no hay internet en absoluto
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// 3. Limpiar cachés antiguas cuando se actualiza la versión
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});