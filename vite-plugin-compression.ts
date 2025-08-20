/**
 * Plugin Vite personnalisé pour la compression des assets
 * Respecte les règles RGESN 6.x pour la minification et compression
 */

import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'
import { gzip, brotliCompress } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)
const brotliAsync = promisify(brotliCompress)

interface CompressionOptions {
  algorithm?: 'gzip' | 'brotli' | 'both'
  threshold?: number
  compressionOptions?: {
    level?: number
    memLevel?: number
  }
}

export default function compressionPlugin(options: CompressionOptions = {}): Plugin {
  const {
    algorithm = 'both',
    threshold = 1024,
    compressionOptions = { level: 9, memLevel: 9 }
  } = options

  const filter = createFilter(/\.(js|css|html|svg|json)$/)

  return {
    name: 'vite-plugin-compression',
    enforce: 'post',
    generateBundle: async (options, bundle) => {
      const files = Object.values(bundle).filter(
        (file) => file.type === 'asset' && filter(file.fileName)
      ) as any[]

      for (const file of files) {
        if (file.source && file.source.length > threshold) {
          try {
            // Compression Gzip
            if (algorithm === 'gzip' || algorithm === 'both') {
              const gzipped = await gzipAsync(file.source, compressionOptions)
              const gzipFile = {
                fileName: `${file.fileName}.gz`,
                source: gzipped,
                type: 'asset'
              }
              bundle[gzipFile.fileName] = gzipFile
            }

            // Compression Brotli
            if (algorithm === 'brotli' || algorithm === 'both') {
              const brotlied = await brotliAsync(file.source, compressionOptions)
              const brotliFile = {
                fileName: `${file.fileName}.br`,
                source: brotlied,
                type: 'asset'
              }
              bundle[brotliFile.fileName] = brotliFile
            }
          } catch (error) {
            console.warn(`Compression failed for ${file.fileName}:`, error)
          }
        }
      }
    }
  }
}
