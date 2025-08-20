#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSOptimizer {
  constructor() {
    this.usedClasses = new Set();
    this.cssStats = {
      originalSize: 0,
      optimizedSize: 0,
      removedRules: 0,
      removedClasses: 0,
      removedAnimations: 0,
      removedFonts: 0
    };
  }

  // Analyser les composants React pour trouver les classes utilisées
  scanReactComponents() {
    const srcDir = path.join(__dirname, '../src');
    const components = this.findFiles(srcDir, '.tsx');
    
    console.log('🔍 Analyse des composants React...');
    
    components.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const classMatches = content.match(/className\s*=\s*["'`]([^"'`]+)["'`]/g);
      
      if (classMatches) {
        classMatches.forEach(match => {
          const classes = match.replace(/className\s*=\s*["'`]/, '').replace(/["'`]$/, '');
          classes.split(' ').forEach(cls => {
            if (cls.trim() && !cls.startsWith('{') && !cls.includes('$')) {
              this.usedClasses.add(cls.trim());
            }
          });
        });
      }
    });
    
    console.log(`✅ ${this.usedClasses.size} classes CSS utilisées détectées`);
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

  // Analyser et nettoyer le CSS
  optimizeCSS() {
    const cssFile = path.join(__dirname, '../src/index.css');
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    
    this.cssStats.originalSize = cssContent.length;
    console.log(`📊 Taille CSS originale: ${(cssContent.length / 1024).toFixed(2)} KB`);
    
    // Supprimer les imports de polices inutilisées
    let optimizedCSS = this.removeUnusedFonts(cssContent);
    
    // Supprimer les classes inutilisées
    optimizedCSS = this.removeUnusedClasses(optimizedCSS);
    
    // Supprimer les animations inutilisées
    optimizedCSS = this.removeUnusedAnimations(optimizedCSS);
    
    // Supprimer les règles dupliquées
    optimizedCSS = this.removeDuplicateRules(optimizedCSS);
    
    // Nettoyer les espaces et commentaires inutiles
    optimizedCSS = this.cleanupCSS(optimizedCSS);
    
    this.cssStats.optimizedSize = optimizedCSS.length;
    
    // Sauvegarder le CSS optimisé
    const backupFile = cssFile + '.backup';
    fs.writeFileSync(backupFile, cssContent);
    fs.writeFileSync(cssFile, optimizedCSS);
    
    console.log(`💾 Sauvegarde créée: ${backupFile}`);
    console.log(`✨ CSS optimisé sauvegardé`);
    
    return optimizedCSS;
  }

  // Supprimer les polices inutilisées
  removeUnusedFonts(css) {
    const fontImports = [
      'Roboto', 'Open+Sans', 'Lato', 'Montserrat'
    ];
    
    fontImports.forEach(font => {
      const regex = new RegExp(`@import url\\('https://fonts\\.googleapis\\.com/css2\\?family=${font}[^']*'\\);?\\s*`, 'g');
      if (css.match(regex)) {
        css = css.replace(regex, '');
        this.cssStats.removedFonts++;
        console.log(`🗑️  Police supprimée: ${font}`);
      }
    });
    
    return css;
  }

  // Supprimer les classes inutilisées
  removeUnusedClasses(css) {
    const unusedPatterns = [
      /\.unused-class-[^{]+{[^}]+}/g,
      /\.bloat-[^{]+{[^}]+}/g,
      /\.mega-bloat-[^{]+{[^}]+}/g,
      /\.ultra-bloat-[^{]+{[^}]+}/g,
      /\.cpu-waster\s*{[^}]+}/g
    ];
    
    unusedPatterns.forEach(pattern => {
      const matches = css.match(pattern);
      if (matches) {
        this.cssStats.removedClasses += matches.length;
        css = css.replace(pattern, '');
        console.log(`🗑️  ${matches.length} classes inutilisées supprimées`);
      }
    });
    
    return css;
  }

  // Supprimer les animations inutilisées
  removeUnusedAnimations(css) {
    const unusedAnimations = [
      'waste-cpu', 'rainbow-spin', 'mega-waste', 'bounce'
    ];
    
    unusedAnimations.forEach(animation => {
      const keyframeRegex = new RegExp(`@keyframes\\s+${animation}\\s*{[^}]+}`, 'g');
      const matches = css.match(keyframeRegex);
      if (matches) {
        this.cssStats.removedAnimations += matches.length;
        css = css.replace(keyframeRegex, '');
        console.log(`🗑️  Animation supprimée: ${animation}`);
      }
    });
    
    return css;
  }

  // Supprimer les règles dupliquées
  removeDuplicateRules(css) {
    // Supprimer les règles .container dupliquées
    const containerRules = css.match(/\.container\s*{[^}]+}/g);
    if (containerRules && containerRules.length > 1) {
      // Garder seulement la première règle
      const firstRule = containerRules[0];
      const allRules = containerRules.join('');
      css = css.replace(allRules, firstRule);
      this.cssStats.removedRules += containerRules.length - 1;
      console.log(`🗑️  ${containerRules.length - 1} règles .container dupliquées supprimées`);
    }
    
    return css;
  }

  // Nettoyer le CSS
  cleanupCSS(css) {
    // Supprimer les lignes vides multiples
    css = css.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Supprimer les espaces en fin de ligne
    css = css.replace(/\s+$/gm, '');
    
    // Supprimer les commentaires vides
    css = css.replace(/\/\*\s*\*\//g, '');
    
    return css;
  }

  // Générer un rapport d'optimisation
  generateReport() {
    const savings = this.cssStats.originalSize - this.cssStats.optimizedSize;
    const savingsPercent = ((savings / this.cssStats.originalSize) * 100).toFixed(2);
    
    console.log('\n📈 RAPPORT D\'OPTIMISATION CSS');
    console.log('=' .repeat(40));
    console.log(`📊 Taille originale: ${(this.cssStats.originalSize / 1024).toFixed(2)} KB`);
    console.log(`✨ Taille optimisée: ${(this.cssStats.optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`💾 Économies: ${(savings / 1024).toFixed(2)} KB (${savingsPercent}%)`);
    console.log(`🗑️  Classes supprimées: ${this.cssStats.removedClasses}`);
    console.log(`🗑️  Animations supprimées: ${this.cssStats.removedAnimations}`);
    console.log(`🗑️  Polices supprimées: ${this.cssStats.removedFonts}`);
    console.log(`🗑️  Règles dupliquées supprimées: ${this.cssStats.removedRules}`);
    
    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      originalSize: this.cssStats.originalSize,
      optimizedSize: this.cssStats.optimizedSize,
      savings: savings,
      savingsPercent: parseFloat(savingsPercent),
      removedClasses: this.cssStats.removedClasses,
      removedAnimations: this.cssStats.removedAnimations,
      removedFonts: this.cssStats.removedFonts,
      removedRules: this.cssStats.removedRules
    };
    
    const reportFile = path.join(__dirname, '../css-optimization-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Rapport sauvegardé: ${reportFile}`);
  }

  // Exécuter l'optimisation complète
  run() {
    console.log('🚀 Démarrage de l\'optimisation CSS...\n');
    
    try {
      this.scanReactComponents();
      this.optimizeCSS();
      this.generateReport();
      
      console.log('\n✅ Optimisation CSS terminée avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'optimisation:', error.message);
      process.exit(1);
    }
  }
}

// Exécuter l'optimiseur
const optimizer = new CSSOptimizer();
optimizer.run();
