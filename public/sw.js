/**
 * Service Worker pour cache offline et architecture modulaire
 * Respecte les règles RGESN 2.1 - Architecture modulaire et évolutive
 */

const CACHE_NAME = 'disaster-web-v1.0.0'
const STATIC_CACHE = 'disaster-web-static-v1.0.0'
const DYNAMIC_CACHE = 'disaster-web-dynamic-v1.0.0'
const API_CACHE = 'disaster-web-api-v1.0.0'

// Stratégies de cache selon le type de ressource
const CACHE_STRATEGIES = {
  // Assets statiques : Cache-first avec mise à jour en arrière-plan
  STATIC: 'cache-first',
  // API dynamiques : Network-first avec fallback cache
  API: 'network-first',
  // Pages HTML : Stale-while-revalidate
  HTML: 'stale-while-revalidate',
  // Images et médias : Cache-first avec expiration
  MEDIA: 'cache-first-expiring'
}

// Ressources critiques à mettre en cache immédiatement
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/index.css',
  '/src/main.tsx',
  '/src/App.tsx'
]

// Ressources statiques avec cache long
const STATIC_RESOURCES = [
  '/static/big.css',
  '/static/big.js',
  '/static/large.jpg'
]

// Patterns d'API à mettre en cache
const API_PATTERNS = [
  '/api/server',
  '/api/payload'
]

// Taille maximale du cache (50MB)
const MAX_CACHE_SIZE = 50 * 1024 * 1024

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cache statique ouvert')
        return cache.addAll(CRITICAL_RESOURCES)
      })
      .then(() => {
        console.log('[SW] Ressources critiques mises en cache')
        // Activation immédiate
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error)
      })
  )
})

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Nettoyer les anciens caches
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Anciens caches nettoyés')
        // Prendre le contrôle de toutes les pages
        return self.clients.claim()
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'activation:', error)
      })
  )
})

/**
 * Interception des requêtes
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return
  
  // Ignorer les requêtes de développement
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return
  
  // Déterminer la stratégie de cache
  const strategy = getCacheStrategy(url, request)
  
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      event.respondWith(cacheFirst(request, STATIC_CACHE))
      break
    case CACHE_STRATEGIES.API:
      event.respondWith(networkFirst(request, API_CACHE))
      break
    case CACHE_STRATEGIES.HTML:
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE))
      break
    case CACHE_STRATEGIES.MEDIA:
      event.respondWith(cacheFirstExpiring(request, DYNAMIC_CACHE))
      break
    default:
      event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  }
})

/**
 * Détermine la stratégie de cache selon l'URL
 */
function getCacheStrategy(url, request) {
  // Assets statiques
  if (STATIC_RESOURCES.some(resource => url.pathname.includes(resource))) {
    return CACHE_STRATEGIES.STATIC
  }
  
  // API
  if (API_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    return CACHE_STRATEGIES.API
  }
  
  // HTML
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    return CACHE_STRATEGIES.HTML
  }
  
  // Images et médias
  if (['image', 'media'].includes(request.destination)) {
    return CACHE_STRATEGIES.MEDIA
  }
  
  // Par défaut : network-first
  return CACHE_STRATEGIES.API
}

/**
 * Stratégie Cache-First pour les ressources statiques
 */
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Erreur cache-first:', error)
    return new Response('Erreur de cache', { status: 500 })
  }
}

/**
 * Stratégie Network-First pour les API
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache')
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Réseau indisponible', { status: 503 })
  }
}

/**
 * Stratégie Stale-While-Revalidate pour les pages HTML
 */
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    // Retourner immédiatement la version en cache si disponible
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    
    return cachedResponse || fetchPromise
  } catch (error) {
    console.error('[SW] Erreur stale-while-revalidate:', error)
    return fetch(request)
  }
}

/**
 * Stratégie Cache-First avec expiration pour les médias
 */
async function cacheFirstExpiring(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Vérifier l'âge du cache
      const cacheDate = cachedResponse.headers.get('sw-cache-date')
      if (cacheDate) {
        const age = Date.now() - new Date(cacheDate).getTime()
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 jours
        
        if (age < maxAge) {
          return cachedResponse
        }
      }
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      const responseWithDate = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cache-date': new Date().toISOString()
        }
      })
      cache.put(request, responseWithDate.clone())
      return responseWithDate
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Erreur cache-first-expiring:', error)
    return new Response('Erreur de cache média', { status: 500 })
  }
}

/**
 * Gestion des messages du client
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'GET_CACHE_INFO':
      getCacheInfo().then((info) => {
        event.ports[0].postMessage(info)
      })
      break
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true })
      })
      break
    default:
      console.log('[SW] Message non reconnu:', type)
  }
})

/**
 * Récupère les informations sur les caches
 */
async function getCacheInfo() {
  const cacheNames = await caches.keys()
  const cacheInfo = {}
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    cacheInfo[cacheName] = {
      size: keys.length,
      keys: keys.map(key => key.url)
    }
  }
  
  return cacheInfo
}

/**
 * Nettoie tous les caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
  console.log('[SW] Tous les caches ont été nettoyés')
}

/**
 * Gestion des erreurs globales
 */
self.addEventListener('error', (event) => {
  console.error('[SW] Erreur globale:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Promesse rejetée non gérée:', event.reason)
})

console.log('[SW] Service Worker chargé et prêt')
