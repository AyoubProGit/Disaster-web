import React, { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Cpu,
  Database,
  Globe,
  MemoryStick,
  Timer,
  Zap,
  Layers,
  FileText,
  FilePlus,
  Image,
  Cloud
} from 'lucide-react'
import * as THREE from 'three'
import _ from 'lodash'

type Stat = {
  bundle: number
  weight: number
  dom: number
  resources: number
  js: number
  css: number
  img: number
  cache: number
  memory: number
  load: number
  rps: number
  pl: number
}

const limits = {
  weight: [512_000, 1_048_576],
  dom: [1_000, 2_000],
  resources: [50, 100],
  js: [153_600, 307_200],
  css: [51_200, 102_400],
  img: [307_200, 716_800],
  cache: [0.6, 0.4]
}

const color = (v: number, [g, y]: number[], inv = false) =>
  inv
    ? v >= g
      ? 'border-green-500/30 bg-green-500/20'
      : v >= y
      ? 'border-yellow-500/30 bg-yellow-500/20'
      : 'border-red-500/30 bg-red-500/20'
    : v <= g
    ? 'border-green-500/30 bg-green-500/20'
    : v <= y
    ? 'border-yellow-500/30 bg-yellow-500/20'
    : 'border-red-500/30 bg-red-500/20'

export default function App() {
  const [stats, setStats] = useState<Stat>({
    bundle: 0,
    weight: 0,
    dom: 0,
    resources: 0,
    js: 0,
    css: 0,
    img: 0,
    cache: 0,
    memory: 0,
    load: 0,
    rps: 0,
    pl: 0
  })
  const [ready, setReady] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const injectedRef = useRef(false)
  const intervalRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1_000)
    camera.position.z = 30
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth || 640, canvas.clientHeight || 480)
    renderer.setPixelRatio(window.devicePixelRatio)
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(25, 25, 25)
    scene.add(dir)
    for (let i = 0; i < 20; i++) {
      const mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff, shininess: 80 })
      const geo = new THREE.BoxGeometry(1 + Math.random(), 1 + Math.random(), 1 + Math.random())
      const cube = new THREE.Mesh(geo, mat)
      cube.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50)
      scene.add(cube)
    }
    const animate = () => {
      let i = 0
      scene.traverse((o: any) => {
        if (o.isMesh) {
          o.rotation.x += 0.002 * ((i % 3) + 1)
          o.rotation.y += 0.003 * ((i % 4) + 1)
        }
        i++
      })
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()
    const onResize = _.throttle(() => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }, 200)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          Array.isArray(o.material) ? o.material.forEach((m: any) => m.dispose()) : o.material.dispose()
        }
      })
    }
  }, [])

  useEffect(() => {
    if (injectedRef.current) return
    injectedRef.current = true
    const loadAssets = () => {
      const h = document.head
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'http://localhost:5001/static/big.css'
      h.appendChild(link)
      const script = document.createElement('script')
      script.src = 'http://localhost:5001/static/big.js'
      script.crossOrigin = 'anonymous'
      h.appendChild(script)
    }
    document.readyState === 'complete'
      ? loadAssets()
      : window.addEventListener('load', loadAssets, { once: true })
  }, [])

  useEffect(() => {
    const startTime = performance.now();

    const computeStats = () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      if (!nav) return;

      const totalWeight = nav.transferSize + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const jsWeight = resources.filter(r => r.initiatorType === 'script').reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const cssWeight = resources.filter(r => r.initiatorType === 'link').reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const imgWeight = resources
        .filter(
          r =>
            r.initiatorType === 'img' ||
            r.initiatorType === 'css' ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(r.name)
        )
        .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalEncoded = nav.encodedBodySize + resources.reduce((sum, r) => sum + (r.encodedBodySize || 0), 0);
      const cacheRatio = totalEncoded ? 1 - totalWeight / totalEncoded : 0;

      setStats(s => ({
        ...s,
        bundle: nav.transferSize,
        weight: totalWeight,
        dom: document.getElementsByTagName('*').length,
        resources: resources.length,
        js: jsWeight,
        css: cssWeight || s.css,
        img: imgWeight || s.img,
        cache: cacheRatio,
        pl: Math.round(performance.now() - startTime)
      }));
      setReady(true);
    };

    if (document.readyState === 'complete') {
      computeStats();
    } else {
      window.addEventListener('load', computeStats, { once: true });
    }

    // Ajout du rafraîchissement périodique
    const interval = setInterval(computeStats, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const po = new PerformanceObserver(list => {
      const res = list.getEntries() as PerformanceResourceTiming[]
      const added = res.reduce((a, b) => a + (b.transferSize || 0), 0)
      const jsAdd = res.filter(r => r.initiatorType === 'script').reduce((a, b) => a + (b.transferSize || 0), 0)
      const cssAdd = res.filter(r => r.initiatorType === 'link' || /\.css$/i.test(r.name)).reduce((a, b) => a + (b.transferSize || 0), 0) 
      const isImg = (r: PerformanceResourceTiming) => r.initiatorType === 'img' || r.initiatorType === 'css' || /\.(avif|jpe?g|png|gif|webp|svg)$/i.test(r.name);
      const imgAdd = res.filter(isImg).reduce((a, b) => a + (b.transferSize || 0), 0);
      const encAdd = res.reduce((a, b) => a + (b.encodedBodySize || 0), 0)
      setStats(s => {
        const weight = s.weight + added
        const enc = (1 - s.cache) * s.weight + encAdd
        const cache = enc ? 1 - weight / enc : s.cache
        return { ...s, weight, js: s.js + jsAdd, css: s.css + cssAdd, img: s.img + imgAdd, cache }
      })
    })
    po.observe({ type: 'resource', buffered: true })
    return () => po.disconnect()
  }, [])

  useEffect(() => {
    if (intervalRef.current) return

    intervalRef.current = window.setInterval(async () => {
      for (let i = 0; i < 2; i++) {
        fetch(`http://localhost:5001/api/payload?${Date.now()}_${i}`)
      }

      try {
        const { memory, load, rps } = await fetch('http://localhost:5001/api/server', {
          cache: 'no-store'
        }).then(r => r.json())

        setStats(s => ({
          ...s,
          memory: Math.ceil(memory / 1_048_576),
          load,
          rps
        }))
      } catch (err) {
        console.warn('Erreur lors du fetch des stats serveur', err)
      }
    }, 1_000)

    return () => clearInterval(intervalRef.current)
  }, [])

  if (!ready)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin h-24 w-24 rounded-full border-b-2 border-white mx-auto mb-6" />
          <p className="text-white text-xl font-semibold">Chargement…</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <img src="http://localhost:5001/static/large.jpg" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
      </div>
      <div className="relative z-10 container mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 animate-pulse">
            EcoTraining Platform
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">Plateforme d'entraînement avancée pour l'optimisation web et l'éco-conception</p>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          <Card icon={<Database className="w-8 h-8 text-purple-400" />} title="Poids HTML" value={`${(stats.bundle / 1_024).toFixed(0)} kB`} tone={color(stats.bundle, limits.weight)} tip="transferSize du document" />
          <Card icon={<Globe className="w-8 h-8 text-blue-400" />} title="Poids page" value={`${(stats.weight / 1_024).toFixed(0)} kB`} tone={color(stats.weight, limits.weight)} tip="somme transferSize" />
          <Card icon={<Layers className="w-8 h-8 text-teal-400" />} title="DOM" value={stats.dom} tone={color(stats.dom, limits.dom)} tip="nombre de nœuds" />
          <Card icon={<Activity className="w-8 h-8 text-green-400" />} title="Ressources" value={stats.resources} tone={color(stats.resources, limits.resources)} tip="entries PerformanceResourceTiming" />
          <Card icon={<FileText className="w-8 h-8 text-fuchsia-400" />} title="JS" value={`${(stats.js / 1_024).toFixed(0)} kB`} tone={color(stats.js, limits.js)} />
          <Card icon={<FilePlus className="w-8 h-8 text-sky-400" />} title="CSS" value={`${(stats.img / 1024).toFixed(1)} kB`} tone={color(stats.css, limits.css)} />
          <Card icon={<Image className="w-8 h-8 text-amber-400" />} title="Images" value={`${(stats.img / 1_024).toFixed(0)} kB`} tone={color(stats.img, limits.img)} />
          <Card icon={<Cloud className="w-8 h-8 text-emerald-400" />} title="Cache hit" value={`${Math.round(stats.cache * 100)} %`} tone={color(stats.cache, limits.cache, true)} />
          <Card icon={<MemoryStick className="w-8 h-8 text-red-400" />} title="RAM serveur" value={`${stats.memory} MB`} tone="bg-white/10 border-white/20" />
          <Card icon={<Cpu className="w-8 h-8 text-indigo-400" />} title="CPU" value={stats.load} tone="bg-white/10 border-white/20" />
          <Card icon={<Activity className="w-8 h-8 text-lime-400" />} title="RPS" value={stats.rps} tone="bg-white/10 border-white/20" />
          <Card icon={<Timer className="w-8 h-8 text-yellow-400" />} title="Load page" value={`${stats.pl} ms`} tone="bg-white/10 border-white/20" />
        </section>
        <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-16">
          <div className="flex items-center gap-4 mb-6">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Visualisation 3D</h2>
          </div>
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="rounded-xl border border-white/20 shadow-2xl w-full h-96" />
          </div>
          <p className="text-slate-300 text-center mt-4">500 cubes tournants en temps réel</p>
        </section>
      </div>
    </div>
  )
}

function Card({ icon, title, value, tone, tip }: { icon: React.ReactNode; title: string; value: string | number; tone: string; tip?: string }) {
  return (
    <div className={`backdrop-blur-lg rounded-2xl p-8 border hover:bg-white/15 hover:scale-105 transition ${tone}`} title={tip || ''}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  )
}