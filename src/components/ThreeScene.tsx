/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { throttle } from 'lodash-es'

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialisation de la scène Three.js
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1_000)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth || 640, canvas.clientHeight || 480)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Éclairage
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(25, 25, 25)
    scene.add(dir)

    // Création des cubes
    for (let cubeIndex = 0; cubeIndex < 20; cubeIndex++) {
      const mat = new THREE.MeshPhongMaterial({ 
        color: Math.random() * 0xffffff, 
        shininess: 80 
      })
      const geo = new THREE.BoxGeometry(
        1 + Math.random(), 
        1 + Math.random(), 
        1 + Math.random()
      )
      const cube = new THREE.Mesh(geo, mat)
      cube.position.set(
        (Math.random() - 0.5) * 50, 
        (Math.random() - 0.5) * 50, 
        (Math.random() - 0.5) * 50
      )
      scene.add(cube)
    }

    // Animation
    let animationId: number | undefined
    const animate = () => {
      let meshIndex = 0
      scene.traverse((o: THREE.Object3D) => {
        if (o instanceof THREE.Mesh) {
          o.rotation.x += 0.002 * ((meshIndex % 3) + 1)
          o.rotation.y += 0.003 * ((meshIndex % 4) + 1)
        }
        meshIndex++
      })
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }
    
    // Démarrer l'animation
    animationId = requestAnimationFrame(animate)

    // Gestion du redimensionnement
    const onResize = throttle(() => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }, 200)
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize)
      if (animationId !== undefined) {
        cancelAnimationFrame(animationId)
      }
      renderer.dispose()
      scene.traverse((o: THREE.Object3D) => {
        if (o instanceof THREE.Mesh) {
          if (o.geometry) o.geometry.dispose()
          if (o.material) {
            Array.isArray(o.material) 
              ? o.material.forEach((m: THREE.Material) => m.dispose()) 
              : o.material.dispose()
          }
        }
      })
    }
  }, [])

  return (
    <div className="flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="rounded-xl border border-white/20 shadow-2xl w-full h-96" 
      />
    </div>
  )
}
