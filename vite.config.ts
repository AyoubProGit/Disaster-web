import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compressionPlugin from './vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compressionPlugin({
      algorithm: 'both',
      threshold: 1024,
      compressionOptions: { level: 9, memLevel: 9 }
    }),

  ],
  
  // Optimisation des dépendances
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'three', 'lodash-es']
  },
  
  // Configuration de build pour la production
  build: {
    // Minification avancée
    minify: 'terser',
    terserOptions: {
      compress: {
        // Supprimer console.log, debugger, etc. en production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        // Optimisations supplémentaires
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true
      },
      mangle: {
        // Mangle des noms de variables/fonctions
        toplevel: true,
        safari10: true
      },
      format: {
        // Supprimer les commentaires
        comments: false
      }
    },
    
    // Tree-shaking agressif
    rollupOptions: {
      output: {
        // Chunks optimisés
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          utils: ['lodash-es']
        },
        // Minification des chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Optimisations de taille
    target: 'es2020',
    sourcemap: false, // Pas de sourcemap en production
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    
    // Compression des assets
    assetsInlineLimit: 4096, // Inline les petits assets
    cssCodeSplit: true,
    cssMinify: true
  },
  
  // Optimisations de développement
  esbuild: {
    drop: ['console', 'debugger']
  }
});
