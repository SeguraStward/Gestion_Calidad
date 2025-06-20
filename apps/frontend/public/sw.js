// Service Worker para caché de API optimizado
const CACHE_NAME = 'una-gc-api-cache-v1'
const API_CACHE_NAME = 'una-gc-api-data-v1'

// URLs que queremos cachear
const STATIC_URLS = ['/', '/manifest.json']

// Patrones de API que queremos cachear
const API_PATTERNS = [
  /\/api\/campuses/,
  /\/api\/faculties/,
  /\/api\/schools/,
  /\/api\/courses/,
  /\/api\/classrooms/,
  /\/api\/academic-cycles/,
  /\/api\/regional-centers/
]

// Tiempo de vida del caché en milisegundos
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 días
  api: 15 * 60 * 1000, // 15 minutos (matching React Query staleTime)
  dynamic: 5 * 60 * 1000 // 5 minutos para datos más dinámicos
}

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return
  }

  // Estrategia para APIs
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Estrategia para recursos estáticos
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request))
  }
})

function isApiRequest(request) {
  return API_PATTERNS.some((pattern) => pattern.test(request.url))
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)
  const cachedResponse = await cache.match(request)

  // Verificar si el caché es válido
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('sw-cached-time')
    if (cachedTime) {
      const age = Date.now() - parseInt(cachedTime)
      const maxAge = getCacheMaxAge(request.url)

      if (age < maxAge) {
        console.log('Serving from cache:', request.url)
        return cachedResponse
      }
    }
  }

  try {
    console.log('Fetching from network:', request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Clonar la respuesta para poder cachearla
      const responseToCache = networkResponse.clone()

      // Agregar timestamp al header
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...Object.fromEntries(responseToCache.headers.entries()),
          'sw-cached-time': Date.now().toString()
        }
      })

      // Cachear la respuesta
      cache.put(request, responseWithTimestamp)
    }

    return networkResponse
  } catch (error) {
    console.log('Network failed, serving stale cache if available:', request.url)

    // Si falla la red, servir caché stale si existe
    if (cachedResponse) {
      return cachedResponse
    }

    // Si no hay caché, devolver respuesta de error
    return new Response(JSON.stringify({ error: 'Network error and no cache available' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('Static resource failed to load:', request.url)
    return new Response('Resource not available', { status: 404 })
  }
}

function getCacheMaxAge(url) {
  // Datos que cambian poco - caché más largo
  if (url.includes('/campuses') || url.includes('/faculties') || url.includes('/schools') || url.includes('/classrooms')) {
    return CACHE_DURATION.api
  }

  // Datos más dinámicos - caché más corto
  if (url.includes('/academic-loads') || url.includes('/final-reports')) {
    return CACHE_DURATION.dynamic
  }

  // Por defecto
  return CACHE_DURATION.api
}

// Limpiar cachés antiguos periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      })
    )
  }
})
