import React, { useState, useEffect } from 'react'
import { TestTube, CheckCircle, XCircle } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

const OfflineTest: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const runOfflineTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tests: Array<() => Promise<TestResult>> = [
      testServiceWorkerRegistration,
      testCacheStorage,
      testOfflineNavigation,
      testOfflineAPI,
      testCacheStrategies
    ]

    for (const test of tests) {
      try {
        const startTime = performance.now()
        const result = await test()
        const duration = performance.now() - startTime
        
        setTestResults(prev => [...prev, { ...result, duration }])
        
        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: 'Test inconnu',
          status: 'error',
          message: `Erreur: ${error}`
        }])
      }
    }

    setIsRunning(false)
  }

  const testServiceWorkerRegistration = async (): Promise<TestResult> => {
    if (!('serviceWorker' in navigator)) {
      return {
        name: 'Service Worker Support',
        status: 'error',
        message: 'Service Worker non supporté par le navigateur'
      }
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      
      if (registration && registration.active) {
        return {
          name: 'Service Worker Actif',
          status: 'success',
          message: 'Service Worker installé et actif'
        }
      } else {
        return {
          name: 'Service Worker Actif',
          status: 'error',
          message: 'Service Worker non installé ou inactif'
        }
      }
    } catch (error) {
      return {
        name: 'Service Worker Actif',
        status: 'error',
        message: `Erreur: ${error}`
      }
    }
  }

  const testCacheStorage = async (): Promise<TestResult> => {
    if (!('caches' in window)) {
      return {
        name: 'Cache Storage',
        status: 'error',
        message: 'Cache Storage non supporté'
      }
    }

    try {
      const cacheNames = await caches.keys()
      const hasDisasterWebCache = cacheNames.some(name => 
        name.includes('disaster-web')
      )

      if (hasDisasterWebCache) {
        return {
          name: 'Cache Storage',
          status: 'success',
          message: `Caches trouvés: ${cacheNames.length}`
        }
      } else {
        return {
          name: 'Cache Storage',
          status: 'error',
          message: 'Aucun cache Disaster Web trouvé'
        }
      }
    } catch (error) {
      return {
        name: 'Cache Storage',
        status: 'error',
        message: `Erreur: ${error}`
      }
    }
  }

  const testOfflineNavigation = async (): Promise<TestResult> => {
    try {
      // Tester la navigation vers une page en cache
      const response = await fetch('/', { 
        method: 'HEAD',
        cache: 'force-cache'
      })

      if (response.ok) {
        return {
          name: 'Navigation Offline',
          status: 'success',
          message: 'Page principale accessible en cache'
        }
      } else {
        return {
          name: 'Navigation Offline',
          status: 'error',
          message: 'Page principale non accessible en cache'
        }
      }
    } catch (error) {
      return {
        name: 'Navigation Offline',
        status: 'error',
        message: `Erreur: ${error}`
      }
    }
  }

  const testOfflineAPI = async (): Promise<TestResult> => {
    try {
      // Simuler une requête API
      const response = await fetch('/api/server', { 
        method: 'GET',
        cache: 'force-cache'
      })

      if (response.ok) {
        return {
          name: 'API Offline',
          status: 'success',
          message: 'API accessible en cache'
        }
      } else {
        return {
          name: 'API Offline',
          status: 'error',
          message: 'API non accessible en cache'
        }
      }
    } catch (error) {
      return {
        name: 'API Offline',
        status: 'error',
        message: `Erreur: ${error}`
      }
    }
  }

  const testCacheStrategies = async (): Promise<TestResult> => {
    try {
      // Tester différentes stratégies de cache
      const tests = [
        { url: '/', strategy: 'stale-while-revalidate' },
        { url: '/static/big.css', strategy: 'cache-first' },
        { url: '/api/server', strategy: 'network-first' }
      ]

      let successCount = 0
      for (const test of tests) {
        try {
          const response = await fetch(test.url, { cache: 'force-cache' })
          if (response.ok) successCount++
        } catch {
          // Ignorer les erreurs pour ce test
        }
      }

      if (successCount > 0) {
        return {
          name: 'Stratégies de Cache',
          status: 'success',
          message: `${successCount}/${tests.length} stratégies fonctionnelles`
        }
      } else {
        return {
          name: 'Stratégies de Cache',
          status: 'error',
          message: 'Aucune stratégie de cache fonctionnelle'
        }
      }
    } catch (error) {
      return {
        name: 'Stratégies de Cache',
        status: 'error',
        message: `Erreur: ${error}`
      }
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <TestTube className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-500/10'
      case 'error':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-yellow-500 bg-yellow-500/10'
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <TestTube className="w-5 h-5 text-purple-400" />
          Tests de Fonctionnement Offline
        </h3>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-400">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      </div>

      {/* Bouton de test */}
      <div className="text-center">
        <button
          onClick={runOfflineTests}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <TestTube className="w-5 h-5" />
          {isRunning ? 'Tests en cours...' : 'Lancer les tests offline'}
        </button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-white">Résultats des tests</h4>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h5 className="font-medium text-white">{result.name}</h5>
                    <p className="text-sm text-gray-300">{result.message}</p>
                  </div>
                </div>
                
                {result.duration && (
                  <span className="text-sm text-gray-400">
                    {result.duration.toFixed(0)}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {testResults.length}
            </div>
            <div className="text-gray-400 text-sm">Tests effectués</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {testResults.filter(r => r.status === 'success').length}
            </div>
            <div className="text-gray-400 text-sm">Tests réussis</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {testResults.filter(r => r.status === 'error').length}
            </div>
            <div className="text-gray-400 text-sm">Tests échoués</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">Instructions de test</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Cliquez sur "Lancer les tests offline" pour vérifier le fonctionnement</li>
          <li>• Les tests vérifient le Service Worker, le cache et les stratégies offline</li>
          <li>• Pour tester en mode offline, désactivez votre connexion réseau</li>
          <li>• Les tests simulent différents scénarios d'utilisation offline</li>
        </ul>
      </div>
    </div>
  )
}

export default OfflineTest
