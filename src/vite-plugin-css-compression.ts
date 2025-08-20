import type { Plugin } from 'vite';
import { createFilter } from '@rollup/pluginutils';

interface CSSCompressionOptions {
  removeComments?: boolean;
  removeWhitespace?: boolean;
  removeEmptyRules?: boolean;
  mergeSelectors?: boolean;
  minifyValues?: boolean;
  removeUnusedAtRules?: boolean;
}

export default function cssCompressionPlugin(options: CSSCompressionOptions = {}): Plugin {
  const {
    removeComments = true,
    removeWhitespace = true,
    removeEmptyRules = true,
    mergeSelectors = true,
    minifyValues = true,
    removeUnusedAtRules = true
  } = options;

  const filter = createFilter(['**/*.css'], ['**/node_modules/**']);

  return {
    name: 'vite-plugin-css-compression',
    enforce: 'post',

    transform(code: string, id: string) {
      if (!filter(id)) return null;

      let optimizedCSS = code;

      // Supprimer les commentaires
      if (removeComments) {
        optimizedCSS = optimizedCSS.replace(/\/\*[\s\S]*?\*\//g, '');
      }

      // Supprimer les espaces inutiles
      if (removeWhitespace) {
        // Supprimer les espaces autour des séparateurs
        optimizedCSS = optimizedCSS.replace(/\s*([{}:;,>+~])\s*/g, '$1');
        // Supprimer les espaces en début et fin de ligne
        optimizedCSS = optimizedCSS.replace(/^\s+|\s+$/gm, '');
        // Supprimer les lignes vides multiples
        optimizedCSS = optimizedCSS.replace(/\n\s*\n/g, '\n');
        // Supprimer les espaces en fin de ligne
        optimizedCSS = optimizedCSS.replace(/\s+$/gm, '');
      }

      // Supprimer les règles vides
      if (removeEmptyRules) {
        optimizedCSS = optimizedCSS.replace(/[^{}]+\{\s*\}/g, '');
      }

      // Fusionner les sélecteurs identiques
      if (mergeSelectors) {
        const selectorMap = new Map<string, string[]>();
        const ruleRegex = /([^{]+)\{([^}]+)\}/g;
        let match;

        while ((match = ruleRegex.exec(optimizedCSS)) !== null) {
          const selector = match[1].trim();
          const declarations = match[2].trim();
          
          if (!selectorMap.has(declarations)) {
            selectorMap.set(declarations, []);
          }
          selectorMap.get(declarations)!.push(selector);
        }

        // Reconstruire le CSS avec les sélecteurs fusionnés
        let mergedCSS = '';
        selectorMap.forEach((selectors, declarations) => {
          if (selectors.length > 0) {
            mergedCSS += `${selectors.join(', ')}{${declarations}}`;
          }
        });

        if (mergedCSS) {
          optimizedCSS = mergedCSS;
        }
      }

      // Minifier les valeurs
      if (minifyValues) {
        // Supprimer les zéros inutiles
        optimizedCSS = optimizedCSS.replace(/(\d+)\.0+/g, '$1');
        // Supprimer les unités zéro
        optimizedCSS = optimizedCSS.replace(/0(px|em|rem|%|vh|vw)/g, '0');
        // Raccourcir les couleurs hexadécimales
        optimizedCSS = optimizedCSS.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
        // Raccourcir les couleurs rgb
        optimizedCSS = optimizedCSS.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, 'rgb($1,$2,$3)');
      }

      // Supprimer les règles @ inutilisées
      if (removeUnusedAtRules) {
        const unusedAtRules = [
          '@charset',
          '@import url',
          '@namespace'
        ];

        unusedAtRules.forEach(rule => {
          const regex = new RegExp(`${rule}[^;]+;?\\s*`, 'g');
          optimizedCSS = optimizedCSS.replace(regex, '');
        });
      }

      // Nettoyer les espaces finaux
      optimizedCSS = optimizedCSS.trim();

      return {
        code: optimizedCSS,
        map: null
      };
    },

    generateBundle() {
      // Log des statistiques de compression
      console.log('🎨 Plugin CSS Compression activé');
      console.log(`   - Suppression des commentaires: ${removeComments ? '✅' : '❌'}`);
      console.log(`   - Suppression des espaces: ${removeWhitespace ? '✅' : '❌'}`);
      console.log(`   - Suppression des règles vides: ${removeEmptyRules ? '✅' : '❌'}`);
      console.log(`   - Fusion des sélecteurs: ${mergeSelectors ? '✅' : '❌'}`);
      console.log(`   - Minification des valeurs: ${minifyValues ? '✅' : '❌'}`);
      console.log(`   - Suppression des @rules inutilisées: ${removeUnusedAtRules ? '✅' : '❌'}`);
    }
  };
}
