import React, { useEffect, useState } from 'react'
import { RefreshCw, X, Download } from 'lucide-react'
import { logInfo } from '../utils/logger'

interface UpdateNotificationProps {
  onUpdate: () => void
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [showNotification, setShowNotification] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logInfo('Nouveau Service Worker activé')
        setUpdateAvailable(true)
        setShowNotification(true)
      })

      // Vérifier s'il y a une mise à jour en attente
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          setUpdateAvailable(true)
          setShowNotification(true)
        }
      })
    }
  }, [])

  const handleUpdate = () => {
    onUpdate()
    setShowNotification(false)
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification || !updateAvailable) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-blue-200" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">
              Mise à jour disponible
            </h4>
            <p className="text-blue-100 text-xs mb-3">
              Une nouvelle version de l'application est disponible. Cliquez pour mettre à jour.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Mettre à jour
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-blue-200 hover:text-white px-3 py-1.5 rounded text-xs transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UpdateNotification
