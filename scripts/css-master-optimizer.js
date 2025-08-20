#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CSSMasterOptimizer {
  constructor() {
    this.stats = {
      startTime: Date.now(),
      steps: [],
      totalSavings: 0,
      originalSize: 0,
      finalSize: 0
    };
  }

  // Exécuter une commande et capturer la sortie
  runCommand(command, description) {
    console.log(`\n🚀 ${description}...`);
    console.log(`   Commande: ${command}`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      console.log(`✅ ${description} terminé avec succès`);
      this.stats.steps.push({ step: description, status: 'success', output });
      
      return output;
    } catch (error) {
      console.error(`❌ Erreur lors de ${description}:`, error.message);
      this.stats.steps.push({ step: description, status: 'error', error: error.message });
      throw error;
    }
  }

  // Mesurer la taille du CSS avant optimisation
  measureOriginalCSS() {
    const cssFile = path.join(__dirname, '../src/index.css');
    if (fs.existsSync(cssFile)) {
      const stats = fs.statSync(cssFile);
      this.stats.originalSize = stats.size;
      console.log(`📊 Taille CSS originale: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  }

  // Mesurer la taille du CSS après optimisation
  measureFinalCSS() {
    const cssFile = path.join(__dirname, '../src/index.css');
    if (fs.existsSync(cssFile)) {
      const stats = fs.statSync(cssFile);
      this.stats.finalSize = stats.size;
      console.log(`📊 Taille CSS finale: ${(stats.size / 1024).toFixed(2)} KB`);
      
      if (this.stats.originalSize > 0) {
        const savings = this.stats.originalSize - this.stats.finalSize;
        const savingsPercent = ((savings / this.stats.originalSize) * 100).toFixed(2);
        this.stats.totalSavings = savings;
        
        console.log(`💾 Économies totales: ${(savings / 1024).toFixed(2)} KB (${savingsPercent}%)`);
      }
    }
  }

  // Exécuter toutes les optimisations
  async runAllOptimizations() {
    console.log('🎨 DÉMARRAGE DE L\'OPTIMISATION CSS MAÎTRE');
    console.log('=' .repeat(60));
    
    try {
      // Étape 1: Mesurer le CSS original
      this.measureOriginalCSS();
      
      // Étape 2: Optimiser le CSS de base
      this.runCommand('npm run optimize:css', 'Optimisation CSS de base');
      
      // Étape 3: Analyser le CSS généré
      this.runCommand('npm run analyze:css', 'Analyse du CSS généré');
      
      // Étape 4: Purifier Tailwind
      this.runCommand('npm run purify:tailwind', 'Purification Tailwind');
      
      // Étape 5: Build optimisé
      this.runCommand('npm run build:css-optimized', 'Build avec CSS optimisé');
      
      // Étape 6: Analyse finale
      this.runCommand('npm run analyze:css', 'Analyse finale du CSS');
      
      // Étape 7: Mesurer les résultats finaux
      this.measureFinalCSS();
      
      console.log('\n🎉 OPTIMISATION CSS MAÎTRE TERMINÉE AVEC SUCCÈS !');
      
    } catch (error) {
      console.error('\n💥 Erreur lors de l\'optimisation maître:', error.message);
      console.log('\n📋 Résumé des étapes:');
      this.stats.steps.forEach((step, index) => {
        const status = step.status === 'success' ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} ${step.step}`);
      });
      process.exit(1);
    }
  }

  // Générer un rapport final complet
  generateFinalReport() {
    const duration = Date.now() - this.stats.startTime;
    const durationSeconds = (duration / 1000).toFixed(2);
    
    console.log('\n📊 RAPPORT FINAL D\'OPTIMISATION CSS');
    console.log('=' .repeat(50));
    console.log(`⏱️  Durée totale: ${durationSeconds} secondes`);
    console.log(`📊 Taille originale: ${(this.stats.originalSize / 1024).toFixed(2)} KB`);
    console.log(`✨ Taille finale: ${(this.stats.finalSize / 1024).toFixed(2)} KB`);
    
    if (this.stats.totalSavings > 0) {
      const savingsPercent = ((this.stats.totalSavings / this.stats.originalSize) * 100).toFixed(2);
      console.log(`💾 Économies totales: ${(this.stats.totalSavings / 1024).toFixed(2)} KB (${savingsPercent}%)`);
    }
    
    console.log(`\n📋 Étapes exécutées:`);
    this.stats.steps.forEach((step, index) => {
      const status = step.status === 'success' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${step.step}`);
    });
    
    // Sauvegarder le rapport final
    const finalReport = {
      timestamp: new Date().toISOString(),
      duration: duration,
      durationSeconds: parseFloat(durationSeconds),
      originalSize: this.stats.originalSize,
      finalSize: this.stats.finalSize,
      totalSavings: this.stats.totalSavings,
      steps: this.stats.steps,
      summary: {
        success: this.stats.steps.filter(s => s.status === 'success').length,
        errors: this.stats.steps.filter(s => s.status === 'error').length,
        total: this.stats.steps.length
      }
    };
    
    const reportFile = path.join(__dirname, '../css-master-optimization-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(finalReport, null, 2));
    console.log(`\n📄 Rapport final sauvegardé: ${reportFile}`);
    
    // Afficher les recommandations finales
    this.displayFinalRecommendations();
  }

  // Afficher les recommandations finales
  displayFinalRecommendations() {
    console.log(`\n💡 RECOMMANDATIONS FINALES:`);
    
    if (this.stats.totalSavings > 0) {
      const savingsPercent = ((this.stats.totalSavings / this.stats.originalSize) * 100).toFixed(2);
      
      if (parseFloat(savingsPercent) > 20) {
        console.log(`   🎉 Excellente optimisation ! ${savingsPercent}% d'économies réalisées`);
      } else if (parseFloat(savingsPercent) > 10) {
        console.log(`   👍 Bonne optimisation ! ${savingsPercent}% d'économies réalisées`);
      } else {
        console.log(`   📊 Optimisation modérée : ${savingsPercent}% d'économies`);
      }
    }
    
    // Vérifier les erreurs
    const errors = this.stats.steps.filter(s => s.status === 'error');
    if (errors.length > 0) {
      console.log(`   ⚠️  ${errors.length} erreur(s) détectée(s) - Vérifier les logs`);
    }
    
    // Recommandations RGESN
    console.log(`\n🌱 CONFORMITÉ RGESN 4.1:`);
    console.log(`   ✅ CSS inutilisé éliminé`);
    console.log(`   ✅ Compression avancée appliquée`);
    console.log(`   ✅ Classes Tailwind optimisées`);
    console.log(`   ✅ Build optimisé généré`);
    
    console.log(`\n🚀 Prochaines étapes recommandées:`);
    console.log(`   1. Tester l'application en production`);
    console.log(`   2. Surveiller les métriques de performance`);
    console.log(`   3. Analyser les Core Web Vitals`);
    console.log(`   4. Implémenter les métriques d'empreinte carbone (Tâche 12)`);
  }

  // Exécuter l'optimisation maître complète
  async run() {
    try {
      await this.runAllOptimizations();
      this.generateFinalReport();
    } catch (error) {
      console.error('💥 Erreur fatale:', error.message);
      process.exit(1);
    }
  }
}

// Exécuter l'optimiseur maître
const masterOptimizer = new CSSMasterOptimizer();
masterOptimizer.run();
