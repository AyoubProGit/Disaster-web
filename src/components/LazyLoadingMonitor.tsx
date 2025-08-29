import React, { useState, useEffect } from 'react'
import { 
  Eye, 
  EyeOff, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Zap,
  Loader
} from 'lucide-react'
import { preloadManager } from '../utils/lazyLoader'

interface ComponentStatus {
  name: string
  status: 'not-loaded' | 'loading' | 'loaded' | 'error'
  loadTime?: number
  size?: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  preloaded: boolean
}

const LazyLoadingMonitor: React.FC = () => {
  const [componentStatuses, setComponentStatuses] = useState<ComponentStatus[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [preloadStats, setPreloadStats] = useState(preloadManager.getStats())

  // Configuration des composants
  const components = [
    { name: 'CSSBackground', priority: 'critical' as const },
    { name: 'ThreeScene', priority: 'high' as const },
    { name: 'PayloadManager', priority: 'medium' as const },
    { name: 'ServiceWorkerManager', priority: 'low' as const },
    { name: 'UpdateNotification', priority: 'low' as const },
    { name: 'OfflineTest', priority: 'low' as const }
  ]

  // Simuler le statut des composants
  useEffect(() => {
    const updateStatuses = () => {
      const newStatuses = components.map(component => {
        const isPreloaded = preloadManager.isPreloaded(component.name)
        
        // Simuler différents états de chargement
        let status: ComponentStatus['status'] = 'not-loaded'
        let loadTime: number | undefined
        let size: number | undefined

        if (isPreloaded) {
          status = 'loaded'
          loadTime = Math.random() * 1000 + 200 // 200-1200ms
          size = Math.random() * 50 + 10 // 10-60KB
        } else if (Math.random() > 0.7) {
          status = 'loading'
          loadTime = Math.random() * 500 + 100 // 100-600ms
        }

        return {
          name: component.name,
          status,
          loadTime,
          size,
          priority: component.priority,
          preloaded: isPreloaded
        }
      })

      setComponentStatuses(newStatuses)
    }

    updateStatuses()

    if (autoRefresh) {
      const interval = setInterval(() => {
        updateStatuses()
        setPreloadStats(preloadManager.getStats())
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Forcer le préchargement
  const forcePreload = async () => {
    await preloadManager.preloadCriticalComponents()
    setPreloadStats(preloadManager.getStats())
  }

  // Obtenir l'icône de statut
  const getStatusIcon = (status: ComponentStatus['status']) => {
    switch (status) {
      case 'loaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'loading':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority: ComponentStatus['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 border-red-500'
      case 'high':
        return 'text-orange-400 border-orange-500'
      case 'medium':
        return 'text-yellow-400 border-yellow-500'
      case 'low':
        return 'text-blue-400 border-blue-500'
    }
  }

  // Obtenir la couleur de statut
  const getStatusColor = (status: ComponentStatus['status']) => {
    switch (status) {
      case 'loaded':
        return 'border-green-500 bg-green-500/10'
      case 'loading':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'error':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  // Calculer les statistiques globales
  const globalStats = {
    total: componentStatuses.length,
    loaded: componentStatuses.filter(c => c.status === 'loaded').length,
    loading: componentStatuses.filter(c => c.status === 'loading').length,
    notLoaded: componentStatuses.filter(c => c.status === 'not-loaded').length,
    averageLoadTime: componentStatuses
      .filter(c => c.loadTime)
      .reduce((sum, c) => sum + (c.loadTime || 0), 0) / 
      componentStatuses.filter(c => c.loadTime).length || 0
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Moniteur de Lazy Loading
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Masquer détails' : 'Afficher détails'}
          </button>
          
          <button
            onClick={forcePreload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Forcer préchargement
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {globalStats.total}
          </div>
          <div className="text-gray-400 text-sm">Composants</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {globalStats.loaded}
          </div>
          <div className="text-gray-400 text-sm">Chargés</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {globalStats.loading}
          </div>
          <div className="text-gray-400 text-sm">En cours</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {globalStats.averageLoadTime.toFixed(0)}ms
          </div>
          <div className="text-gray-400 text-sm">Temps moyen</div>
        </div>
      </div>

      {/* Statistiques de préchargement */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Préchargement Intelligent
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {preloadStats.preloaded}
            </div>
            <div className="text-gray-400 text-sm">Préchargés</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {preloadStats.pending}
            </div>
            <div className="text-gray-400 text-sm">En attente</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {preloadStats.percentage}%
            </div>
            <div className="text-gray-400 text-sm">Progression</div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progression</span>
            <span>{preloadStats.preloaded}/{preloadStats.total}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${preloadStats.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Détails des composants */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">État des composants</h4>
          
          {componentStatuses.map((component) => (
            <div
              key={component.name}
              className={`border rounded-lg p-4 ${getStatusColor(component.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(component.status)}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-white">{component.name}</h5>
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(component.priority)}`}>
                        {component.priority}
                      </span>
                      {component.preloaded && (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                          Préchargé
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-300 mt-1">
                      {component.status === 'loaded' && component.loadTime && (
                        <span>Temps de chargement: {component.loadTime.toFixed(0)}ms</span>
                      )}
                      {component.status === 'loaded' && component.size && (
                        <span className="ml-2">Taille: {component.size.toFixed(1)}KB</span>
                      )}
                      {component.status === 'not-loaded' && (
                        <span>En attente de chargement</span>
                      )}
                      {component.status === 'loading' && (
                        <span>Chargement en cours...</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {component.status === 'loaded' ? '✅' : 
                     component.status === 'loading' ? '⏳' : 
                     component.status === 'error' ? '❌' : '⏸️'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="autoRefresh" className="text-gray-300 text-sm">
            Actualisation automatique
          </label>
        </div>
        
        <div className="text-xs text-gray-400">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Informations sur le lazy loading */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">Comment ça marche</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>Priorité Critique</strong> : Chargement immédiat (CSSBackground)</li>
          <li>• <strong>Priorité Haute</strong> : Préchargement automatique (ThreeScene)</li>
          <li>• <strong>Priorité Moyenne</strong> : Chargement à la demande (PayloadManager)</li>
          <li>• <strong>Priorité Basse</strong> : Chargement différé (ServiceWorker, Tests)</li>
          <li>• <strong>Préchargement intelligent</strong> : Anticipation des besoins utilisateur</li>
        </ul>
      </div>
    </div>
  )
}

export default LazyLoadingMonitor
