import express from 'express'

const router = express.Router()

/**
 * Génère des données réalistes pour les tests de performance
 * @param {number} count - Nombre d'éléments à générer
 * @param {number} page - Page demandée (pour pagination)
 * @param {number} pageSize - Taille de la page
 * @returns {Object} Données paginées
 */
function generateRealisticData(count, page = 1, pageSize = 100) {
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, count)
  const actualCount = endIndex - startIndex
  
  const data = []
  for (let i = startIndex; i < endIndex; i++) {
    data.push({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      timestamp: Date.now() - Math.random() * 86400000, // 24h dans le passé
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.5 ? 'active' : 'inactive'
    })
  }
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
      hasNext: page < Math.ceil(count / pageSize),
      hasPrev: page > 1
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      dataSize: JSON.stringify(data).length,
      compression: 'gzip'
    }
  }
}

/**
 * API Payload optimisée avec pagination
 * GET /api/payload?page=1&pageSize=100&count=1000
 */
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = Math.min(parseInt(req.query.pageSize) || 100, 1000) // Max 1000 par page
  const count = Math.min(parseInt(req.query.count) || 1000, 10000) // Max 10k total
  
  // Validation des paramètres
  if (page < 1 || pageSize < 1 || count < 1) {
    return res.status(400).json({
      error: 'Invalid parameters',
      message: 'page, pageSize, and count must be positive integers'
    })
  }
  
  const result = generateRealisticData(count, page, pageSize)
  
  // Headers d'optimisation
  res.set('Content-Type', 'application/json')
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  
  res.json(result)
})

/**
 * API Payload avec streaming pour gros volumes
 * GET /api/payload/stream?count=5000
 */
router.get('/stream', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 1000, 50000) // Max 50k pour streaming
  
  if (count < 1) {
    return res.status(400).json({
      error: 'Invalid count parameter',
      message: 'count must be a positive integer'
    })
  }
  
  // Headers pour streaming
  res.set('Content-Type', 'application/json')
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Transfer-Encoding', 'chunked')
  
  // Début du JSON
  res.write('{"data":[')
  
  let isFirst = true
  const batchSize = 100
  
  for (let i = 0; i < count; i++) {
    if (i % batchSize === 0 && i > 0) {
      // Pause pour permettre au client de traiter
      setTimeout(() => {}, 1)
    }
    
    const item = {
      id: i + 1,
      name: `Stream Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      timestamp: Date.now() - Math.random() * 86400000
    }
    
    if (!isFirst) res.write(',')
    res.write(JSON.stringify(item))
    isFirst = false
  }
  
  // Fin du JSON avec métadonnées
  const metadata = {
    total: count,
    streamedAt: new Date().toISOString(),
    batchSize
  }
  
  res.write(`],"metadata":${JSON.stringify(metadata)}}`)
  res.end()
})

/**
 * API Payload avec compression et métadonnées
 * GET /api/payload/compressed?count=2000
 */
router.get('/compressed', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 1000, 20000)
  
  if (count < 1) {
    return res.status(400).json({
      error: 'Invalid count parameter',
      message: 'count must be a positive integer'
    })
  }
  
  const data = generateRealisticData(count, 1, count)
  
  // Compression manuelle pour démonstration
  const jsonString = JSON.stringify(data)
  const compressed = Buffer.from(jsonString).toString('base64')
  
  res.json({
    compressed: true,
    originalSize: jsonString.length,
    compressedSize: compressed.length,
    compressionRatio: ((1 - compressed.length / jsonString.length) * 100).toFixed(2),
    data: compressed,
    metadata: {
      compressedAt: new Date().toISOString(),
      algorithm: 'base64'
    }
  })
})

export default router
