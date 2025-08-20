/**
 * Configuration des stratégies de cache pour les assets statiques
 * Respecte les règles RGESN 7.x pour l'optimisation du cache côté client
 */

export const CACHE_CONFIG = {
  // Cache très long pour les assets de build (versionnés)
  BUILD_ASSETS: {
    maxAge: 31536000, // 1 an
    immutable: true,
    extensions: ['.js', '.css', '.js.map', '.css.map']
  },
  
  // Cache long pour les images et médias
  MEDIA_ASSETS: {
    maxAge: 2592000, // 1 mois
    immutable: false,
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']
  },
  
  // Cache long pour les fonts
  FONT_ASSETS: {
    maxAge: 31536000, // 1 an
    immutable: true,
    extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf']
  },
  
  // Cache modéré pour les données
  DATA_ASSETS: {
    maxAge: 86400, // 1 jour
    immutable: false,
    extensions: ['.json', '.xml', '.txt', '.csv']
  },
  
  // Cache par défaut pour les autres fichiers
  DEFAULT: {
    maxAge: 3600, // 1 heure
    immutable: false,
    extensions: []
  }
}

// Headers de sécurité et d'optimisation
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Headers CORS et COEP
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp'
}
