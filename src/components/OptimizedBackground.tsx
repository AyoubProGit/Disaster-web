import React, { useState, useEffect } from 'react'

interface OptimizedBackgroundProps {
  className?: string
  alt?: string
}

export default function OptimizedBackground({ className = '', alt = 'Background' }: OptimizedBackgroundProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [useWebP, setUseWebP] = useState(false)
  const [useAvif, setUseAvif] = useState(false)

  useEffect(() => {
    // Détection du support des formats modernes
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Test WebP
      canvas.width = 1
      canvas.height = 1
      try {
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.fillRect(0, 0, 1, 1)
        const webpData = canvas.toDataURL('image/webp')
        setUseWebP(webpData.indexOf('data:image/webp') === 0)
      } catch (e) {
        setUseWebP(false)
      }

      // Test AVIF (approximatif)
      try {
        const avifData = canvas.toDataURL('image/avif')
        setUseAvif(avifData.indexOf('data:image/avif') === 0)
      } catch (e) {
        setUseAvif(false)
      }
    }
  }, [])

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    // Fallback vers le gradient CSS si l'image échoue
    setImageLoaded(false)
  }

  // Si pas d'image ou d'erreur, utiliser le gradient CSS
  if (!imageLoaded) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>
    )
  }

  return (
    <picture className={`absolute inset-0 ${className}`}>
      {/* AVIF - format le plus moderne et léger */}
      {useAvif && (
        <source
          srcSet="http://localhost:5001/static/background.avif"
          type="image/avif"
        />
      )}
      {/* WebP - bon compromis modernité/compatibilité */}
      {useWebP && (
        <source
          srcSet="http://localhost:5001/static/background.webp"
          type="image/webp"
        />
      )}
      {/* JPG - fallback universel */}
      <img
        src="http://localhost:5001/static/background.jpg"
        alt={alt}
        className="w-full h-full object-cover mix-blend-overlay"
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </picture>
  )
}
