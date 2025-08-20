import React, { useState, useEffect, useCallback } from 'react'
import { Activity, ChevronLeft, ChevronRight, Download, Zap } from 'lucide-react'

interface PayloadData {
  id: number
  name: string
  value: number
  timestamp: number
  category: string
  status: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface PayloadResponse {
  data: PayloadData[]
  pagination: PaginationInfo
  metadata: {
    generatedAt: string
    dataSize: number
    compression: string
  }
}

export default function PayloadManager() {
  const [data, setData] = useState<PayloadData[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalCount, setTotalCount] = useState(1000)

  // Fonction optimisée pour charger les données avec pagination
  const loadData = useCallback(async (page: number, size: number, count: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `http://localhost:5001/api/payload?page=${page}&pageSize=${size}&count=${count}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: PayloadResponse = await response.json()
      setData(result.data)
      setPagination(result.pagination)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour tester le streaming
  const testStreaming = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `http://localhost:5001/api/payload/stream?count=1000`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Lecture du stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream non disponible')
      
      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        result += new TextDecoder().decode(value)
      }
      
      const parsed = JSON.parse(result)
      setData(parsed.data.slice(0, 20)) // Afficher seulement les 20 premiers
      setPagination({
        page: 1,
        pageSize: 20,
        total: parsed.metadata.total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur streaming')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour tester la compression
  const testCompression = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `http://localhost:5001/api/payload/compressed?count=500`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Compression test:', result)
      
      // Décoder les données compressées
      const decoded = Buffer.from(result.data, 'base64').toString()
      const parsed = JSON.parse(decoded)
      
      setData(parsed.data.slice(0, 20))
      setPagination({
        page: 1,
        pageSize: 20,
        total: parsed.pagination.total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur compression')
    } finally {
      setLoading(false)
    }
  }

  // Charger les données au montage et lors des changements de paramètres
  useEffect(() => {
    loadData(currentPage, pageSize, totalCount)
  }, [currentPage, pageSize, totalCount, loadData])

  // Navigation entre les pages
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      setCurrentPage(page)
    }
  }

  // Changer la taille de page
  const changePageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Retour à la première page
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-4 mb-6">
        <Activity className="w-8 h-8 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Gestion des Données Optimisée</h2>
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Taille page:</label>
          <select
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="bg-white/10 text-white border border-white/20 rounded px-3 py-1"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Total:</label>
          <select
            value={totalCount}
            onChange={(e) => setTotalCount(Number(e.target.value))}
            className="bg-white/10 text-white border border-white/20 rounded px-3 py-1"
          >
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
            <option value={5000}>5,000</option>
          </select>
        </div>

        <button
          onClick={testStreaming}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-4 py-2 rounded"
        >
          <Activity className="w-4 h-4" />
          Test Streaming
        </button>

        <button
          onClick={testCompression}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 px-4 py-2 rounded"
        >
          <Download className="w-4 h-4" />
          Test Compression
        </button>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-white text-sm">
            Page {pagination.page} sur {pagination.totalPages} 
            ({pagination.total} éléments au total)
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-white text-sm px-3">
              {pagination.page}
            </span>
            
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-white" />
          <span className="text-white ml-3">Chargement...</span>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded p-4 mb-4">
          <p className="text-red-300">Erreur: {error}</p>
        </div>
      )}

      {/* Données */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === 'active' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="text-white/70 text-sm space-y-1">
                <p>Valeur: {item.value}</p>
                <p>Catégorie: {item.category}</p>
                <p>Date: {new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {pagination && (
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <span>Page actuelle: {pagination.page}</span>
            <span>Éléments par page: {pagination.pageSize}</span>
            <span>Total: {pagination.total}</span>
            {pagination.metadata && (
              <span>Taille: {(pagination.metadata.dataSize / 1024).toFixed(1)} KB</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
