#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TailwindPurifier {
  constructor() {
    this.usedClasses = new Set();
    this.tailwindClasses = new Set();
    this.stats = {
      totalClasses: 0,
      usedClasses: 0,
      unusedClasses: 0,
      removedClasses: 0,
      originalSize: 0,
      optimizedSize: 0
    };
  }

  // Scanner tous les composants React pour les classes utilisées
  scanComponents() {
    const srcDir = path.join(__dirname, '../src');
    const components = this.findFiles(srcDir, '.tsx');
    
    console.log('🔍 Analyse des composants React pour les classes Tailwind...');
    
    components.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.extractTailwindClasses(content);
    });
    
    console.log(`✅ ${this.usedClasses.size} classes Tailwind utilisées détectées`);
  }

  // Trouver tous les fichiers d'une extension donnée
  findFiles(dir, ext) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, ext));
      } else if (item.endsWith(ext)) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Extraire les classes Tailwind du code
  extractTailwindClasses(content) {
    // Patterns pour les classes Tailwind
    const patterns = [
      // Classes de base
      /className\s*=\s*["'`]([^"'`]+)["'`]/g,
      // Classes dans les templates literals
      /className\s*=\s*\{`([^`]+)`\}/g,
      // Classes dans les expressions
      /className\s*=\s*\{[^}]+\}/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classes = match[1] || match[0];
        if (classes) {
          // Extraire les classes individuelles
          classes.split(/\s+/).forEach(cls => {
            cls = cls.trim();
            if (cls && this.isTailwindClass(cls)) {
              this.usedClasses.add(cls);
            }
          });
        }
      }
    });
  }

  // Vérifier si une classe est une classe Tailwind
  isTailwindClass(className) {
    // Patterns Tailwind courants
    const tailwindPatterns = [
      // Layout
      /^(container|block|inline-block|inline|flex|inline-flex|table|table-cell|table-row|grid|inline-grid)$/,
      // Spacing
      /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-[0-9]+$/,
      // Sizing
      /^(w|h)-[0-9]+$|^(w|h)-auto$|^(w|h)-full$|^(w|h)-screen$/,
      // Typography
      /^(text|font|leading|tracking|align|whitespace|break|overflow)-/,
      // Backgrounds
      /^(bg|from|via|to)-/,
      // Borders
      /^(border|rounded|divide|ring|shadow)-/,
      // Effects
      /^(opacity|mix-blend|background-blend|filter|backdrop-blur)-/,
      // Transitions
      /^(transition|duration|ease|delay|animate)-/,
      // Transforms
      /^(transform|scale|rotate|translate|skew|origin)-/,
      // Interactivity
      /^(cursor|select|resize|appearance|pointer-events)-/,
      // SVG
      /^(fill|stroke)-/,
      // Responsive
      /^(sm|md|lg|xl|2xl):/,
      // Dark mode
      /^dark:/,
      // Hover, focus, etc.
      /^(hover|focus|active|disabled|checked|required|valid|invalid):/,
      // Arbitrary values
      /^\[.*\]$/
    ];
    
    return tailwindPatterns.some(pattern => pattern.test(className));
  }

  // Analyser le CSS généré pour identifier les classes Tailwind
  analyzeGeneratedCSS() {
    const distDir = path.join(__dirname, '../dist');
    const cssFiles = this.findFiles(distDir, '.css');
    
    if (cssFiles.length === 0) {
      console.log('⚠️  Aucun fichier CSS généré trouvé. Exécutez d\'abord le build.');
      return;
    }
    
    const cssFile = cssFiles[0];
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    
    this.stats.originalSize = cssContent.length;
    console.log(`📊 Taille CSS généré: ${(cssContent.length / 1024).toFixed(2)} KB`);
    
    // Extraire toutes les classes Tailwind du CSS généré
    const classMatches = cssContent.match(/\.[a-zA-Z0-9:_\-\[\]]+/g) || [];
    classMatches.forEach(match => {
      const className = match.substring(1); // Enlever le point
      if (this.isTailwindClass(className)) {
        this.tailwindClasses.add(className);
      }
    });
    
    this.stats.totalClasses = this.tailwindClasses.size;
    this.stats.usedClasses = this.usedClasses.size;
    this.stats.unusedClasses = this.stats.totalClasses - this.stats.usedClasses;
    
    console.log(`📊 Classes Tailwind dans le CSS: ${this.stats.totalClasses}`);
    console.log(`📊 Classes utilisées: ${this.stats.usedClasses}`);
    console.log(`📊 Classes inutilisées: ${this.stats.unusedClasses}`);
  }

  // Générer un rapport d'optimisation
  generateReport() {
    console.log('\n📈 RAPPORT D\'OPTIMISATION TAILWIND');
    console.log('=' .repeat(50));
    
    const usageRatio = ((this.stats.usedClasses / this.stats.totalClasses) * 100).toFixed(1);
    const sizeReduction = this.stats.originalSize > 0 ? 
      ((this.stats.unusedClasses / this.stats.totalClasses) * 100).toFixed(1) : 0;
    
    console.log(`📊 STATISTIQUES:`);
    console.log(`   - Classes totales: ${this.stats.totalClasses}`);
    console.log(`   - Classes utilisées: ${this.stats.usedClasses}`);
    console.log(`   - Classes inutilisées: ${this.stats.unusedClasses}`);
    console.log(`   - Taux d'utilisation: ${usageRatio}%`);
    console.log(`   - Réduction potentielle: ${sizeReduction}%`);
    
    if (this.stats.unusedClasses > 0) {
      console.log(`\n💡 RECOMMANDATIONS:`);
      console.log(`   - ${this.stats.unusedClasses} classes Tailwind peuvent être supprimées`);
      console.log(`   - Utiliser PurgeCSS ou un outil similaire pour l'élimination automatique`);
      console.log(`   - Considérer le code-splitting CSS par composant`);
      
      // Afficher quelques exemples de classes inutilisées
      const unusedExamples = Array.from(this.tailwindClasses)
        .filter(cls => !this.usedClasses.has(cls))
        .slice(0, 10);
      
      if (unusedExamples.length > 0) {
        console.log(`\n📝 Exemples de classes inutilisées:`);
        unusedExamples.forEach(cls => console.log(`   - ${cls}`));
      }
    } else {
      console.log(`\n✅ Toutes les classes Tailwind sont utilisées !`);
    }
    
    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      totalClasses: this.stats.totalClasses,
      usedClasses: this.stats.usedClasses,
      unusedClasses: this.stats.unusedClasses,
      usageRatio: parseFloat(usageRatio),
      sizeReduction: parseFloat(sizeReduction),
      originalSize: this.stats.originalSize,
      usedClassesList: Array.from(this.usedClasses),
      unusedClassesList: Array.from(this.tailwindClasses).filter(cls => !this.usedClasses.has(cls))
    };
    
    const reportFile = path.join(__dirname, '../tailwind-purification-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportFile}`);
  }

  // Exécuter la purification complète
  run() {
    console.log('🚀 Démarrage de la purification Tailwind...\n');
    
    try {
      this.scanComponents();
      this.analyzeGeneratedCSS();
      this.generateReport();
      
      console.log('\n✅ Purification Tailwind terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la purification:', error.message);
      process.exit(1);
    }
  }
}

// Exécuter le purificateur
const purifier = new TailwindPurifier();
purifier.run();
