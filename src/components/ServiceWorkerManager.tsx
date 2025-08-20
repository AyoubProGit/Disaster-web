import React, { useEffect, useState, useCallback } from 'react'
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  RefreshCw, 
  Trash2, 
  Download,
  Upload,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { logInfo, logWarn, logError } from '../utils/logger'

interface ServiceWorkerState {
  isInstalled: boolean
  isActive: boolean
  isOnline: boolean
  cacheInfo: Record<string, any>
  updateAvailable: boolean
  isUpdating: boolean
}

interface CacheStats {
  totalEntries: number
  totalSize: string
  cacheNames: string[]
}

const ServiceWorkerManager: React.FC = () => {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isInstalled: false,
    isActive: false,
    isOnline: navigator.onLine,
    cacheInfo: {},
    updateAvailable: false,
    isUpdating: false
  })

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: '0 KB',
    cacheNames: []
  })

  // Vérifier l'état du Service Worker
  const checkServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        
        if (registration) {
          setSwState(prev => ({
            ...prev,
            isInstalled: true,
            isActive: !!registration.active,
            updateAvailable: !!registration.waiting
          }))

          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            logInfo('Mise à jour du Service Worker disponible')
            setSwState(prev => ({ ...prev, updateAvailable: true }))
          })

          // Écouter les changements d'état
          if (registration.active) {
            registration.active.addEventListener('statechange', () => {
              logInfo('État du Service Worker changé:', registration.active?.state)
            })
          }
        }
      } catch (error) {
        logError('Erreur lors de la vérification du Service Worker:', error)
      }
    }
  }, [])

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      setSwState(prev => ({ ...prev, isOnline: true }))
      logInfo('Connexion réseau rétablie')
    }

    const handleOffline = () => {
      setSwState(prev => ({ ...prev, isOnline: false }))
      logWarn('Connexion réseau perdue')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialisation
  useEffect(() => {
    checkServiceWorker()
    
    // Vérifier périodiquement
    const interval = setInterval(checkServiceWorker, 30000)
    
    return () => clearInterval(interval)
  }, [checkServiceWorker])

  // Enregistrer le Service Worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        logInfo('Service Worker enregistré:', registration)
        
        await checkServiceWorker()
      } catch (error) {
        logError('Erreur lors de l\'enregistrement du Service Worker:', error)
      }
    }
  }

  // Mettre à jour le Service Worker
  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        setSwState(prev => ({ ...prev, isUpdating: true }))
        
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          // Envoyer le message de mise à jour
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          
          // Attendre l'activation
          await new Promise<void>((resolve) => {
            const handleStateChange = () => {
              if (registration.active?.state === 'activated') {
                registration.active.removeEventListener('statechange', handleStateChange)
                resolve()
              }
            }
            registration.active?.addEventListener('statechange', handleStateChange)
          })
          
          // Recharger la page
          window.location.reload()
        }
      } catch (error) {
        logError('Erreur lors de la mise à jour:', error)
        setSwState(prev => ({ ...prev, isUpdating: false }))
      }
    }
  }

  // Obtenir les informations de cache
  const getCacheInfo = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          const cacheInfo = event.data
          setSwState(prev => ({ ...prev, cacheInfo }))
          
          // Calculer les statistiques
          let totalEntries = 0
          const cacheNames = Object.keys(cacheInfo)
          
          Object.values(cacheInfo).forEach((cache: any) => {
            totalEntries += cache.size || 0
          })
          
          setCacheStats({
            totalEntries,
            totalSize: `${totalEntries} entrées`,
            cacheNames
          })
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_INFO' },
          [messageChannel.port2]
        )
      } catch (error) {
        logError('Erreur lors de la récupération des infos de cache:', error)
      }
    }
  }

  // Nettoyer le cache
  const clearCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            logInfo('Cache nettoyé avec succès')
            setCacheStats({
              totalEntries: 0,
              totalSize: '0 KB',
              cacheNames: []
            })
            setSwState(prev => ({ ...prev, cacheInfo: {} }))
          }
        }
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        )
      } catch (error) {
        logError('Erreur lors du nettoyage du cache:', error)
      }
    }
  }

  // Récupérer les infos de cache périodiquement
  useEffect(() => {
    if (swState.isActive) {
      getCacheInfo()
      
      const interval = setInterval(getCacheInfo, 10000)
      return () => clearInterval(interval)
    }
  }, [swState.isActive])

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Gestionnaire Service Worker
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            swState.isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-400">
            {swState.isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </div>

      {/* État du Service Worker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Service Worker</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Installé</span>
              <div className={`w-3 h-3 rounded-full ${
                swState.isInstalled ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Actif</span>
              <div className={`w-3 h-3 rounded-full ${
                swState.isActive ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Mise à jour</span>
              <div className={`w-3 h-3 rounded-full ${
                swState.updateAvailable ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {!swState.isInstalled && (
              <button
                onClick={registerServiceWorker}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Installer
              </button>
            )}
            
            {swState.updateAvailable && (
              <button
                onClick={updateServiceWorker}
                disabled={swState.isUpdating}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 inline mr-2 ${swState.isUpdating ? 'animate-spin' : ''}`} />
                {swState.isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            )}
          </div>
        </div>

        {/* Statistiques de cache */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Cache</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entrées</span>
              <span className="text-white">{cacheStats.totalEntries}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Caches</span>
              <span className="text-white">{cacheStats.cacheNames.length}</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={getCacheInfo}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
            
            <button
              onClick={clearCache}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Nettoyer
            </button>
          </div>
        </div>
      </div>

      {/* Détails des caches */}
      {Object.keys(swState.cacheInfo).length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Détails des caches</h4>
          <div className="space-y-2">
            {Object.entries(swState.cacheInfo).map(([cacheName, info]: [string, any]) => (
              <div key={cacheName} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                <span className="text-gray-300 text-sm">{cacheName}</span>
                <span className="text-white text-sm">{info.size || 0} entrées</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {swState.isOnline ? '100%' : '0%'}
          </div>
          <div className="text-gray-400 text-sm">Disponibilité</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {swState.isActive ? 'Activé' : 'Désactivé'}
          </div>
          <div className="text-gray-400 text-sm">Mode Offline</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {cacheStats.totalEntries}
          </div>
          <div className="text-gray-400 text-sm">Ressources cachées</div>
        </div>
      </div>
    </div>
  )
}

export default ServiceWorkerManager
