import React from 'react'

interface CSSBackgroundProps {
  className?: string
}

export default function CSSBackground({ className = '' }: CSSBackgroundProps) {
  return (
    <div className={`fixed inset-0 opacity-5 pointer-events-none ${className}`}>
      {/* Gradient principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20" />
      
      {/* Motif radial subtil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      {/* Motif de grille très subtil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
    </div>
  )
}
