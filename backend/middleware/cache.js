import path from 'path'
import { CACHE_CONFIG, SECURITY_HEADERS, CORS_HEADERS } from '../config/cache.js'

/**
 * Middleware de cache optimisé pour les assets statiques
 * Respecte les règles RGESN 7.x pour l'optimisation du cache côté client
 */
export function staticCacheMiddleware(req, res, next) {
  const fileExt = path.extname(req.path).toLowerCase()
  
  // Headers CORS et COEP
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.set(key, value)
  })
  
  // Stratégies de cache selon le type de fichier
  let cacheConfig = CACHE_CONFIG.DEFAULT
  
  if (CACHE_CONFIG.BUILD_ASSETS.extensions.includes(fileExt)) {
    cacheConfig = CACHE_CONFIG.BUILD_ASSETS
  } else if (CACHE_CONFIG.MEDIA_ASSETS.extensions.includes(fileExt)) {
    cacheConfig = CACHE_CONFIG.MEDIA_ASSETS
  } else if (CACHE_CONFIG.FONT_ASSETS.extensions.includes(fileExt)) {
    cacheConfig = CACHE_CONFIG.FONT_ASSETS
  } else if (CACHE_CONFIG.DATA_ASSETS.extensions.includes(fileExt)) {
    cacheConfig = CACHE_CONFIG.DATA_ASSETS
  }
  
  // Application de la stratégie de cache
  const cacheControl = `public, max-age=${cacheConfig.maxAge}${cacheConfig.immutable ? ', immutable' : ''}`
  res.set('Cache-Control', cacheControl)
  res.set('Vary', 'Accept-Encoding')
  
  // ETag pour les assets versionnés
  if (cacheConfig.immutable) {
    res.set('ETag', `"${Date.now()}-${req.path}"`)
  }
  
  // Headers de sécurité
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.set(key, value)
  })
  
  next()
}

/**
 * Middleware de cache pour les API
 */
export function apiCacheMiddleware(req, res, next) {
  // Pas de cache pour les données dynamiques
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  
  next()
}


