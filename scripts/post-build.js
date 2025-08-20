#!/usr/bin/env node

/**
 * Script de post-build pour optimiser la production
 * Respecte les règles RGESN 6.x pour la minification et nettoyage
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, '../dist')

/**
 * Nettoie les fichiers de build
 */
function cleanBuildFiles() {
  console.log('🧹 Nettoyage des fichiers de build...')
  
  const filesToRemove = [
    '*.map', // Source maps
    '*.map.gz',
    '*.map.br'
  ]
  
  // Supprimer les fichiers inutiles
  const distFiles = fs.readdirSync(DIST_DIR, { recursive: true })
  
  distFiles.forEach(file => {
    if (typeof file === 'string') {
      const filePath = path.join(DIST_DIR, file)
      
      // Supprimer les source maps
      if (file.endsWith('.map')) {
        fs.unlinkSync(filePath)
        console.log(`  ❌ Supprimé: ${file}`)
      }
      
      // Supprimer les fichiers de compression en double
      if (file.endsWith('.gz.gz') || file.endsWith('.br.br')) {
        fs.unlinkSync(filePath)
        console.log(`  ❌ Supprimé: ${file}`)
      }
    }
  })
}

/**
 * Analyse la taille des assets
 */
function analyzeAssets() {
  console.log('\n📊 Analyse des assets...')
  
  const assetsDir = path.join(DIST_DIR, 'assets')
  if (!fs.existsSync(assetsDir)) return
  
  const files = fs.readdirSync(assetsDir)
  let totalSize = 0
  let totalGzipped = 0
  
  files.forEach(file => {
    const filePath = path.join(assetsDir, file)
    const stats = fs.statSync(filePath)
    const size = stats.size
    
    totalSize += size
    
    // Estimer la taille gzippée (approximatif)
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const gzippedSize = Math.round(size * 0.3) // ~30% de compression
      totalGzipped += gzippedSize
    } else {
      totalGzipped += size
    }
    
    const sizeKB = (size / 1024).toFixed(1)
    console.log(`  📁 ${file}: ${sizeKB} KB`)
  })
  
  console.log(`\n📈 Total: ${(totalSize / 1024).toFixed(1)} KB`)
  console.log(`📉 Gzippé estimé: ${(totalGzipped / 1024).toFixed(1)} KB`)
  console.log(`🎯 Compression: ${((1 - totalGzipped / totalSize) * 100).toFixed(1)}%`)
}

/**
 * Vérifie la présence de console.log restants
 */
function checkConsoleLogs() {
  console.log('\n🔍 Vérification des console.log restants...')
  
  const jsFiles = []
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        scanDirectory(filePath)
      } else if (file.endsWith('.js')) {
        jsFiles.push(filePath)
      }
    })
  }
  
  scanDirectory(DIST_DIR)
  
  let consoleLogsFound = 0
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')
    const consoleMatches = content.match(/console\.(log|warn|info|debug)/g)
    
    if (consoleMatches) {
      console.log(`  ⚠️  ${path.relative(DIST_DIR, file)}: ${consoleMatches.length} console.* trouvé(s)`)
      consoleLogsFound += consoleMatches.length
    }
  })
  
  if (consoleLogsFound === 0) {
    console.log('  ✅ Aucun console.log trouvé')
  } else {
    console.log(`  ⚠️  Total: ${consoleLogsFound} console.* trouvé(s)`)
  }
}

/**
 * Génère un rapport de build
 */
function generateBuildReport() {
  console.log('\n📋 Génération du rapport de build...')
  
  const report = {
    timestamp: new Date().toISOString(),
    buildInfo: {
      totalAssets: 0,
      totalSize: 0,
      totalGzipped: 0,
      compressionRatio: 0
    },
    optimizations: {
      minification: 'terser',
      treeShaking: 'aggressive',
      consoleRemoval: 'enabled',
      sourceMaps: 'disabled'
    }
  }
  
  // Calculer les statistiques
  const assetsDir = path.join(DIST_DIR, 'assets')
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir)
    report.buildInfo.totalAssets = files.length
    
    let totalSize = 0
    files.forEach(file => {
      const filePath = path.join(assetsDir, file)
      const stats = fs.statSync(filePath)
      totalSize += stats.size
    })
    
    report.buildInfo.totalSize = totalSize
    report.buildInfo.totalGzipped = Math.round(totalSize * 0.3)
    report.buildInfo.compressionRatio = ((1 - report.buildInfo.totalGzipped / totalSize) * 100)
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(DIST_DIR, 'build-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`  📄 Rapport sauvegardé: ${path.relative(DIST_DIR, reportPath)}`)
}

// Exécution principale
async function main() {
  try {
    console.log('🚀 Post-build optimization RGESN 6.x\n')
    
    cleanBuildFiles()
    analyzeAssets()
    checkConsoleLogs()
    generateBuildReport()
    
    console.log('\n✅ Post-build terminé avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors du post-build:', error)
    process.exit(1)
  }
}

// Lancer le script si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
