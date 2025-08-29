/**
 * Système de logging conditionnel pour la production
 * Respecte les règles RGESN 6.x pour la minification et suppression des logs
 */

interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'none'
  enableConsole: boolean
  enableDebugger: boolean
}

// Configuration selon l'environnement
const config: LoggerConfig = {
  level: import.meta.env.PROD ? 'error' : 'debug',
  enableConsole: !import.meta.env.PROD,
  enableDebugger: !import.meta.env.PROD
}

// Niveaux de log
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
}

class Logger {
  private currentLevel: number

  constructor() {
    this.currentLevel = LOG_LEVELS[config.level]
  }

  private shouldLog(level: string): boolean {
    if (!config.enableConsole) return false
    return LOG_LEVELS[level as keyof typeof LOG_LEVELS] >= this.currentLevel
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  }

  // Méthode pour les erreurs critiques (toujours affichées)
  critical(...args: unknown[]): void {
    console.error('[CRITICAL]', ...args)
  }

  // Méthode pour le debug conditionnel
  debugger(): void {
    if (config.enableDebugger) {
      // eslint-disable-next-line no-debugger
      debugger
    }
  }
}

// Instance singleton
export const logger = new Logger()

// Fonctions utilitaires
export const logDebug = (...args: unknown[]) => logger.debug(...args)
export const logInfo = (...args: unknown[]) => logger.info(...args)
export const logWarn = (...args: unknown[]) => logger.warn(...args)
export const logError = (...args: unknown[]) => logger.error(...args)
export const logCritical = (...args: unknown[]) => logger.critical(...args)

// Export de la configuration pour debug
export const loggerConfig = config
