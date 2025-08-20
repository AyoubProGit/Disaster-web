#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSAnalyzer {
  constructor() {
    this.cssStats = {
      totalSize: 0,
      gzippedSize: 0,
      brotliSize: 0,
      files: [],
      optimizations: []
    };
  }

  // Analyser le dossier dist pour les fichiers CSS
  analyzeDist() {
    const distDir = path.join(__dirname, '../dist');
    const cssFiles = this.findCSSFiles(distDir);
    
    console.log('🔍 Analyse des fichiers CSS générés...');
    
    cssFiles.forEach(file => {
      const stats = this.analyzeCSSFile(file);
      this.cssStats.files.push(stats);
      this.cssStats.totalSize += stats.size;
      this.cssStats.gzippedSize += stats.gzippedSize || 0;
      this.cssStats.brotliSize += stats.brotliSize || 0;
    });
    
    return this.cssStats;
  }

  // Trouver tous les fichiers CSS
  findCSSFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findCSSFiles(fullPath));
      } else if (item.endsWith('.css')) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Analyser un fichier CSS spécifique
  analyzeCSSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    
    // Vérifier s'il existe des versions compressées
    const gzipFile = filePath + '.gz';
    const brotliFile = filePath + '.br';
    
    let gzippedSize = 0;
    let brotliSize = 0;
    
    if (fs.existsSync(gzipFile)) {
      gzippedSize = fs.statSync(gzipFile).size;
    }
    
    if (fs.existsSync(brotliFile)) {
      brotliSize = fs.statSync(brotliFile).size;
    }
    
    // Analyser le contenu CSS
    const analysis = this.analyzeCSSContent(content);
    
    return {
      name: fileName,
      path: filePath,
      size: stats.size,
      gzippedSize,
      brotliSize,
      analysis
    };
  }

  // Analyser le contenu CSS
  analyzeCSSContent(css) {
    const rules = css.match(/[^{}]+\{[^}]*\}/g) || [];
    const selectors = css.match(/[^{}]+\{/g) || [];
    const properties = css.match(/[a-zA-Z-]+\s*:\s*[^;]+;/g) || [];
    const mediaQueries = css.match(/@media[^{]+/g) || [];
    const keyframes = css.match(/@keyframes[^{]+/g) || [];
    const imports = css.match(/@import[^;]+;/g) || [];
    
    // Compter les classes Tailwind
    const tailwindClasses = css.match(/\.(bg-|text-|p-|m-|w-|h-|flex|grid|rounded|border|shadow|transition|hover|focus|sm:|md:|lg:|xl:)/g) || [];
    
    return {
      rules: rules.length,
      selectors: selectors.length,
      properties: properties.length,
      mediaQueries: mediaQueries.length,
      keyframes: keyframes.length,
      imports: imports.length,
      tailwindClasses: tailwindClasses.length,
      uniqueSelectors: new Set(selectors.map(s => s.trim())).size,
      uniqueProperties: new Set(properties.map(p => p.split(':')[0].trim())).size
    };
  }

  // Générer un rapport d'analyse
  generateReport() {
    console.log('\n📊 RAPPORT D\'ANALYSE CSS');
    console.log('=' .repeat(50));
    
    // Statistiques globales
    console.log(`📈 TAILLE TOTALE CSS:`);
    console.log(`   - Non compressé: ${(this.cssStats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   - Gzip: ${(this.cssStats.gzippedSize / 1024).toFixed(2)} KB`);
    console.log(`   - Brotli: ${(this.cssStats.brotliSize / 1024).toFixed(2)} KB`);
    
    const gzipRatio = ((this.cssStats.totalSize - this.cssStats.gzippedSize) / this.cssStats.totalSize * 100).toFixed(1);
    const brotliRatio = ((this.cssStats.totalSize - this.cssStats.brotliSize) / this.cssStats.totalSize * 100).toFixed(1);
    
    console.log(`   - Compression Gzip: ${gzipRatio}%`);
    console.log(`   - Compression Brotli: ${brotliRatio}%`);
    
    // Analyse par fichier
    console.log(`\n📁 ANALYSE PAR FICHIER:`);
    this.cssStats.files.forEach(file => {
      console.log(`\n   ${file.name}:`);
      console.log(`     - Taille: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`     - Gzip: ${(file.gzippedSize / 1024).toFixed(2)} KB`);
      console.log(`     - Brotli: ${(file.brotliSize / 1024).toFixed(2)} KB`);
      console.log(`     - Règles CSS: ${file.analysis.rules}`);
      console.log(`     - Sélecteurs uniques: ${file.analysis.uniqueSelectors}`);
      console.log(`     - Propriétés uniques: ${file.analysis.uniqueProperties}`);
      console.log(`     - Classes Tailwind: ${file.analysis.tailwindClasses}`);
    });
    
    // Recommandations d'optimisation
    console.log(`\n💡 RECOMMANDATIONS:`);
    
    if (this.cssStats.totalSize > 50 * 1024) { // > 50KB
      console.log(`   ⚠️  CSS volumineux détecté (>50KB)`);
      console.log(`      - Considérer le code-splitting CSS`);
      console.log(`      - Analyser les classes Tailwind inutilisées`);
    }
    
    if (gzipRatio < 70) {
      console.log(`   ⚠️  Compression Gzip faible (<70%)`);
      console.log(`      - Vérifier la redondance des règles CSS`);
      console.log(`      - Optimiser la structure des sélecteurs`);
    }
    
    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      totalSize: this.cssStats.totalSize,
      gzippedSize: this.cssStats.gzippedSize,
      brotliSize: this.cssStats.brotliSize,
      gzipRatio: parseFloat(gzipRatio),
      brotliRatio: parseFloat(brotliRatio),
      files: this.cssStats.files.map(f => ({
        name: f.name,
        size: f.size,
        gzippedSize: f.gzippedSize,
        brotliSize: f.brotliSize,
        analysis: f.analysis
      }))
    };
    
    const reportFile = path.join(__dirname, '../css-analysis-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportFile}`);
  }

  // Exécuter l'analyse complète
  run() {
    console.log('🚀 Démarrage de l\'analyse CSS...\n');
    
    try {
      this.analyzeDist();
      this.generateReport();
      
      console.log('\n✅ Analyse CSS terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
      process.exit(1);
    }
  }
}

// Exécuter l'analyseur
const analyzer = new CSSAnalyzer();
analyzer.run();
