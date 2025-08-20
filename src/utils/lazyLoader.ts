import React, { lazy, Suspense, useEffect } from 'react'

// Composant de fallback simple sans JSX
const SimpleFallback = ({ componentName }: { componentName: string }) => {
  return React.createElement('div', {
    className: 'bg-gray-800 rounded-lg p-6 animate-pulse'
  }, [
    React.createElement('div', {
      key: 'title',
      className: 'h-4 bg-gray-700 rounded w-1/3 mb-4 mx-auto'
    }),
    React.createElement('div', {
      key: 'content',
      className: 'space-y-2'
    }, [
      React.createElement('div', { key: 'line1', className: 'h-3 bg-gray-700 rounded' }),
      React.createElement('div', { key: 'line2', className: 'h-3 bg-gray-700 rounded w-5/6 mx-auto' }),
      React.createElement('div', { key: 'line3', className: 'h-3 bg-gray-700 rounded w-4/6 mx-auto' })
    ]),
    React.createElement('div', {
      key: 'loading',
      className: 'text-center mt-4'
    }, React.createElement('div', {
      className: 'text-gray-400 text-sm'
    }, `Chargement de ${componentName}...`))
  ])
}

// Composants lazy avec Suspense
export const LazyThreeScene = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'ThreeScene' })
  }, React.createElement(lazy(() => import('../components/ThreeScene')), props))
}

export const LazyCSSBackground = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'CSSBackground' })
  }, React.createElement(lazy(() => import('../components/CSSBackground')), props))
}

export const LazyPayloadManager = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'PayloadManager' })
  }, React.createElement(lazy(() => import('../components/PayloadManager')), props))
}

export const LazyServiceWorkerManager = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'ServiceWorkerManager' })
  }, React.createElement(lazy(() => import('../components/ServiceWorkerManager')), props))
}

export const LazyUpdateNotification = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'UpdateNotification' })
  }, React.createElement(lazy(() => import('../components/UpdateNotification')), props))
}

export const LazyOfflineTest = (props: any) => {
  return React.createElement(Suspense, {
    fallback: React.createElement(SimpleFallback, { componentName: 'OfflineTest' })
  }, React.createElement(lazy(() => import('../components/OfflineTest')), props))
}

// Système de préchargement simple
class PreloadManager {
  private preloadedComponents = new Set<string>()

  async preloadComponent(componentName: string): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return
    }

    try {
      switch (componentName) {
        case 'ThreeScene':
          await import('../components/ThreeScene')
          break
        case 'CSSBackground':
          await import('../components/CSSBackground')
          break
        case 'PayloadManager':
          await import('../components/PayloadManager')
          break
        case 'ServiceWorkerManager':
          await import('../components/ServiceWorkerManager')
          break
        case 'UpdateNotification':
          await import('../components/UpdateNotification')
          break
        case 'OfflineTest':
          await import('../components/OfflineTest')
          break
      }
      
      this.preloadedComponents.add(componentName)
      console.log(`[PreloadManager] ${componentName} préchargé avec succès`)
    } catch (error) {
      console.warn(`[PreloadManager] Échec du préchargement de ${componentName}:`, error)
    }
  }

  async preloadCriticalComponents(): Promise<void> {
    const criticalComponents = ['CSSBackground', 'ThreeScene']
    console.log('[PreloadManager] Préchargement des composants critiques:', criticalComponents)

    for (const componentName of criticalComponents) {
      await this.preloadComponent(componentName)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName)
  }

  getStats() {
    const total = 6
    const preloaded = this.preloadedComponents.size
    const pending = 0

    return {
      total,
      preloaded,
      pending,
      percentage: Math.round((preloaded / total) * 100)
    }
  }
}

// Instance singleton du gestionnaire de préchargement
export const preloadManager = new PreloadManager()

// Hook pour déclencher le préchargement
export function usePreloadCriticalComponents() {
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadManager.preloadCriticalComponents()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])
}
